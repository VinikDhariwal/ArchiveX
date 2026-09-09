import { Product } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import { SUPPORTED_PRODUCT_TYPES } from '../config/constants.js';

const PUBLIC_FILTER = {
  status: 'approved',
  deletedAt: null,
};

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

function parsePagination(query) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(48, Math.max(1, Number(query.limit) || 24));
  return { page, limit, skip: (page - 1) * limit };
}

export async function listPublicProducts(query = {}) {
  const filter = { ...PUBLIC_FILTER };

  if (query.productType) {
    if (!SUPPORTED_PRODUCT_TYPES.includes(query.productType)) {
      throw new ApiError('Invalid productType', 400, 'INVALID_PRODUCT_TYPE');
    }
    filter.productType = query.productType;
  }

  if (query.featured === 'true' || query.featured === true) {
    filter.featured = true;
  }

  if (query.q && String(query.q).trim()) {
    filter.$text = { $search: String(query.q).trim() };
  }

  const { page, limit, skip } = parsePagination(query);
  const sort = query.shuffle === 'true' ? { updatedAt: -1 } : { featured: -1, releaseYear: -1, name: 1 };

  const [items, total] = await Promise.all([
    Product.find(filter)
      .populate('brand', 'name slug')
      .populate('category', 'name slug')
      .populate('tags', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  let products = items.map(serializeProduct);

  if (query.shuffle === 'true') {
    products = shufflePreferringPrimary(products, Number(query.seed) || Date.now());
  }

  return {
    products,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
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

/** Deterministic-ish shuffle that weaves watches after every third primary object. */
function shufflePreferringPrimary(products, seed) {
  const random = mulberry32(seed);
  const shuffle = (list) => {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const primary = shuffle(
    products.filter((item) => item.productType === 'car' || item.productType === 'motorcycle')
  );
  const secondary = shuffle(products.filter((item) => item.productType === 'watch'));
  const feed = [];
  let watchIndex = 0;

  primary.forEach((item, index) => {
    feed.push(item);
    if ((index + 1) % 3 === 0 && secondary[watchIndex]) {
      feed.push(secondary[watchIndex]);
      watchIndex += 1;
    }
  });

  while (watchIndex < secondary.length) {
    feed.push(secondary[watchIndex]);
    watchIndex += 1;
  }

  return feed;
}

function mulberry32(seed) {
  let value = seed >>> 0;
  return function next() {
    value += 0x6d2b79f5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
