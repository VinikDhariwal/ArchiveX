import { Product, ProductView } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import mongoose from 'mongoose';
import {
  applyFieldSelection,
  buildPublicProductFilter,
  getDiscoverFilterSchema,
  mongoSortForMode,
  parseFieldSelection,
  parsePagination,
  parseSort,
  shufflePreferringPrimary,
  sortProductsInMemory,
} from './searchService.js';

const PUBLIC_FILTER = {
  status: 'approved',
  deletedAt: null,
};

/** Card/list projection — omit long dossier fields and tags on feed queries. */
const LIST_SELECT =
  'slug name reference brand productType releaseYear rarity availability featured shortDescription publisher images category';

async function loadListedProductsByIds(ids) {
  const order = ids.map(String);
  if (!order.length) return [];
  const docs = await Product.find({ _id: { $in: order }, ...PUBLIC_FILTER })
    .select(LIST_SELECT)
    .populate('brand', 'name slug')
    .populate('category', 'name slug')
    .lean();
  const byId = new Map(docs.map((doc) => [String(doc._id), doc]));
  return order
    .map((id) => byId.get(id))
    .filter(Boolean)
    .map(serializeProduct);
}

function toPlainFields(specifications) {
  if (!specifications) return undefined;
  const fields =
    specifications.fields instanceof Map
      ? Object.fromEntries(specifications.fields)
      : specifications.fields || {};
  return {
    domain: specifications.domain,
    productType: specifications.productType,
    fields,
  };
}

/** Map a Product document to the public API / client shape. */
export function serializeProduct(doc) {
  if (!doc) return null;
  const plain = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  const brandDoc = plain.brand && typeof plain.brand === 'object' ? plain.brand : null;

  return {
    id: String(plain._id),
    slug: plain.slug,
    name: plain.name,
    reference: plain.reference || null,
    brand: brandDoc?.name || plain.brandName || 'Unknown',
    brandSlug: brandDoc?.slug || null,
    productType: plain.productType,
    year: plain.releaseYear ?? null,
    rarity: plain.rarity,
    availability: plain.availability,
    featured: Boolean(plain.featured),
    shortDescription: plain.shortDescription || '',
    description: plain.description || '',
    whyItMatters: plain.whyItMatters || '',
    publisher: plain.publisher || 'ArchiveX',
    materials: plain.materials || [],
    colors: plain.colors || [],
    images: (plain.images || []).map((image) => ({
      url: image.url,
      alt: image.alt || '',
      type: image.type || 'gallery',
      width: image.width,
      height: image.height,
      sortOrder: image.sortOrder ?? 0,
    })),
    specifications: toPlainFields(plain.specifications),
    rarityProfile: plain.rarityProfile || null,
    marketSignals: plain.marketSignals
      ? {
          archiveEstimate: plain.marketSignals.archiveEstimate || '',
          marketRange: plain.marketSignals.marketRange || '',
          collectorInterest: plain.marketSignals.collectorInterest || '',
          availabilitySignal: plain.marketSignals.availabilitySignal || '',
          priceMovement: plain.marketSignals.priceMovement || '',
          lastUpdated: plain.marketSignals.lastUpdated || null,
          disclaimer:
            plain.marketSignals.disclaimer ||
            'Informational archive signals only — not a guarantee of price, availability, or investment outcome.',
        }
      : null,
    category: plain.category
      ? {
          id: String(plain.category._id || plain.category),
          name: plain.category.name,
          slug: plain.category.slug,
        }
      : null,
    tags: Array.isArray(plain.tags)
      ? plain.tags
          .filter((tag) => tag && typeof tag === 'object')
          .map((tag) => ({ id: String(tag._id), name: tag.name, slug: tag.slug }))
      : [],
  };
}

export async function listPublicProducts(query = {}) {
  const { filter, empty, searchTerm } = await buildPublicProductFilter(query);
  const { page, limit, skip } = parsePagination(query);
  const sort = parseSort(query);
  const fields = parseFieldSelection(query);

  if (empty) {
    return {
      products: [],
      meta: {
        page,
        limit,
        total: 0,
        totalPages: 1,
        sort: sort.mode,
        filters: summarizeActiveFilters(query),
      },
    };
  }

  // Shuffle: order thin id rows, then hydrate only the current page.
  if (sort.mode === 'shuffle') {
    const rows = await Product.find(filter).select('_id productType').lean();
    const ordered = shufflePreferringPrimary(
      rows.map((row) => ({
        id: String(row._id),
        productType: row.productType,
      })),
      sort.seed
    );
    const total = ordered.length;
    const pageRows = ordered.slice(skip, skip + limit);
    let products = await loadListedProductsByIds(pageRows.map((row) => row.id));
    products = products.map((item) => applyFieldSelection(item, fields));

    return {
      products,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
        sort: 'shuffle',
        seed: sort.seed,
        filters: summarizeActiveFilters(query),
      },
    };
  }

  const needsInMemorySort = sort.mode === 'rarity' || (sort.mode === 'relevance' && searchTerm);

  if (needsInMemorySort) {
    const all = await Product.find(filter)
      .select(LIST_SELECT)
      .populate('brand', 'name slug')
      .populate('category', 'name slug')
      .lean();

    let products = sortProductsInMemory(all.map(serializeProduct), sort.mode, searchTerm);
    const total = products.length;
    products = products.slice(skip, skip + limit).map((item) => applyFieldSelection(item, fields));

    return {
      products,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
        sort: sort.mode,
        filters: summarizeActiveFilters(query),
      },
    };
  }

  const mongoSort = mongoSortForMode(sort.mode);

  const [items, total] = await Promise.all([
    Product.find(filter)
      .select(LIST_SELECT)
      .populate('brand', 'name slug')
      .populate('category', 'name slug')
      .sort(mongoSort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  const products = items
    .map(serializeProduct)
    .map((item) => applyFieldSelection(item, fields));

  return {
    products,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      sort: sort.mode,
      filters: summarizeActiveFilters(query),
    },
  };
}

export async function getPublicProductBySlug(slug) {
  const product = await Product.findOne({ ...PUBLIC_FILTER, slug })
    .populate('brand', 'name slug')
    .populate('category', 'name slug')
    .populate('tags', 'name slug')
    .lean();

  if (!product) {
    throw new ApiError('Product not found', 404, 'PRODUCT_NOT_FOUND');
  }

  return serializeProduct(product);
}

export async function getApprovedProductId(productId) {
  if (!mongoose.isValidObjectId(productId)) {
    throw new ApiError('Invalid product id', 400, 'INVALID_PRODUCT_ID');
  }
  const product = await Product.findOne({ _id: productId, ...PUBLIC_FILTER }).select('_id').lean();
  if (!product) {
    throw new ApiError('Product not found', 404, 'PRODUCT_NOT_FOUND');
  }
  return String(product._id);
}

export async function recordProductView(productId, { sessionKey, userId, source, userAgent } = {}) {
  const id = await getApprovedProductId(productId);
  const view = await ProductView.create({
    product: id,
    user: userId || null,
    sessionKey: sessionKey ? String(sessionKey).slice(0, 120) : null,
    source: source || 'detail',
    userAgent: userAgent ? String(userAgent).slice(0, 400) : '',
  });

  return {
    id: String(view._id),
    productId: id,
    createdAt: view.createdAt,
  };
}

export async function listRecentlyViewed({ userId, sessionKey, limit = 8 } = {}) {
  const capped = Math.min(Math.max(Number(limit) || 8, 1), 24);
  const match = {};
  if (userId) match.user = userId;
  else if (sessionKey) match.sessionKey = String(sessionKey).slice(0, 120);
  else return [];

  const views = await ProductView.find(match).sort({ createdAt: -1 }).limit(80).lean();
  const seen = new Set();
  const productIds = [];
  for (const view of views) {
    const id = String(view.product);
    if (seen.has(id)) continue;
    seen.add(id);
    productIds.push(id);
    if (productIds.length >= capped) break;
  }

  if (!productIds.length) return [];

  const products = await Product.find({ _id: { $in: productIds }, ...PUBLIC_FILTER })
    .select(LIST_SELECT)
    .populate('brand', 'name slug')
    .populate('category', 'name slug')
    .lean();

  const byId = new Map(products.map((item) => [String(item._id), item]));
  return productIds
    .map((id) => byId.get(id))
    .filter(Boolean)
    .map(serializeProduct);
}

export function getPublicFilterSchema(query = {}) {
  const productType = query.productType || query.domain || 'all';
  return getDiscoverFilterSchema(productType);
}

function summarizeActiveFilters(query = {}) {
  const keys = [
    'productType',
    'domain',
    'q',
    'brand',
    'category',
    'tag',
    'yearMin',
    'yearMax',
    'rarity',
    'material',
    'color',
    'availability',
    'bodyStyle',
    'engine',
    'power',
    'drivetrain',
    'transmission',
    'displacement',
    'productionPeriod',
    'movement',
    'caseMaterial',
    'caseSize',
    'dialColor',
    'waterResistance',
    'featured',
  ];

  const active = {};
  for (const key of keys) {
    if (query[key] !== undefined && query[key] !== null && String(query[key]).trim() !== '') {
      active[key] = query[key];
    }
  }
  return active;
}
