import mongoose from 'mongoose';
import {
  AVAILABILITY_VALUES,
  RARITY_VALUES,
  SPEC_FIELDS_BY_TYPE,
  SUPPORTED_PRODUCT_TYPES,
} from '../config/constants.js';
import { Brand, Category, Tag } from '../models/index.js';
import ApiError from '../utils/ApiError.js';

const PUBLIC_STATUS = 'approved';

const SHARED_SPEC_FILTER_KEYS = Object.freeze([
  'bodyStyle',
  'engine',
  'power',
  'drivetrain',
  'transmission',
  'productionPeriod',
  'displacement',
  'movement',
  'caseMaterial',
  'caseSize',
  'dialColor',
  'waterResistance',
]);

const SORT_VALUES = Object.freeze([
  'relevance',
  'popularity',
  'newest',
  'rarity',
  'name',
  'shuffle',
]);

const RARITY_RANK = Object.freeze({
  UNIQUE: 6,
  'ULTRA-RARE': 5,
  ICONIC: 4,
  RARE: 3,
  COLLECTIBLE: 2,
  COMMON: 1,
});

const ALLOWED_PROJECTION_FIELDS = Object.freeze([
  'id',
  'slug',
  'name',
  'reference',
  'brand',
  'brandSlug',
  'productType',
  'year',
  'rarity',
  'availability',
  'featured',
  'shortDescription',
  'description',
  'publisher',
  'materials',
  'colors',
  'images',
  'specifications',
  'rarityProfile',
  'category',
  'tags',
]);

export function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function asTrimmed(value) {
  if (value === undefined || value === null) return '';
  return String(value).trim();
}

function parsePositiveInt(value, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.floor(parsed);
}

/**
 * Domain-aware filter metadata for the Discover UI.
 * Only returns filters relevant to the selected product type.
 */
export function getDiscoverFilterSchema(productType = 'all') {
  const shared = [
    { key: 'productType', label: 'Domain', kind: 'domain' },
    { key: 'q', label: 'Search', kind: 'search' },
    { key: 'brand', label: 'Brand', kind: 'brand' },
    { key: 'category', label: 'Category', kind: 'category' },
    { key: 'yearMin', label: 'Year from', kind: 'number' },
    { key: 'yearMax', label: 'Year to', kind: 'number' },
    { key: 'rarity', label: 'Rarity', kind: 'enum', options: [...RARITY_VALUES] },
    { key: 'material', label: 'Material', kind: 'text' },
    { key: 'color', label: 'Color', kind: 'text' },
    {
      key: 'availability',
      label: 'Availability',
      kind: 'enum',
      options: [...AVAILABILITY_VALUES],
    },
  ];

  const automotive = [
    { key: 'bodyStyle', label: 'Body type', kind: 'spec', domains: ['car'] },
    { key: 'engine', label: 'Engine type', kind: 'spec', domains: ['car', 'motorcycle'] },
    { key: 'power', label: 'Power', kind: 'spec', domains: ['car', 'motorcycle'] },
    { key: 'drivetrain', label: 'Drivetrain', kind: 'spec', domains: ['car'] },
    { key: 'transmission', label: 'Transmission', kind: 'spec', domains: ['car', 'motorcycle'] },
    { key: 'displacement', label: 'Displacement', kind: 'spec', domains: ['motorcycle'] },
    {
      key: 'productionPeriod',
      label: 'Production era',
      kind: 'spec',
      domains: ['car', 'motorcycle', 'watch'],
    },
  ];

  const watch = [
    { key: 'movement', label: 'Movement', kind: 'spec', domains: ['watch'] },
    { key: 'caseMaterial', label: 'Case material', kind: 'spec', domains: ['watch'] },
    { key: 'caseSize', label: 'Case size', kind: 'spec', domains: ['watch'] },
    { key: 'dialColor', label: 'Dial color', kind: 'spec', domains: ['watch'] },
    { key: 'waterResistance', label: 'Water resistance', kind: 'spec', domains: ['watch'] },
  ];

  const domainFilters = [...automotive, ...watch].filter((item) => {
    if (productType === 'all') return true;
    return item.domains.includes(productType);
  });

  return {
    productType: SUPPORTED_PRODUCT_TYPES.includes(productType) ? productType : 'all',
    shared,
    domain: domainFilters,
    sort: [...SORT_VALUES],
  };
}

export function parsePagination(query = {}) {
  const page = parsePositiveInt(query.page, 1);
  const limit = Math.min(48, parsePositiveInt(query.limit, 24));
  return { page, limit, skip: (page - 1) * limit };
}

export function parseSort(query = {}) {
  const requested = asTrimmed(query.sort).toLowerCase() || (query.shuffle === 'true' ? 'shuffle' : '');
  if (requested && !SORT_VALUES.includes(requested)) {
    throw new ApiError('Invalid sort', 400, 'INVALID_SORT');
  }

  if (requested === 'shuffle' || query.shuffle === 'true') {
    // Stable default — never Date.now(), or every refresh reshuffles the chamber.
    const parsed = Number(query.seed);
    return { mode: 'shuffle', seed: Number.isFinite(parsed) && parsed > 0 ? parsed : 1 };
  }

  if (requested === 'relevance' || (!requested && asTrimmed(query.q))) {
    return { mode: 'relevance' };
  }

  if (requested === 'popularity') return { mode: 'popularity' };
  if (requested === 'newest') return { mode: 'newest' };
  if (requested === 'rarity') return { mode: 'rarity' };
  if (requested === 'name') return { mode: 'name' };

  return { mode: 'popularity' };
}

export function parseFieldSelection(query = {}) {
  const raw = asTrimmed(query.fields);
  if (!raw) return null;

  const fields = raw
    .split(',')
    .map((item) => item.trim())
    .filter((item) => ALLOWED_PROJECTION_FIELDS.includes(item));

  if (!fields.length) {
    throw new ApiError('No valid fields requested', 400, 'INVALID_FIELDS');
  }

  return new Set(fields);
}

async function resolveCatalogIds(Model, slug) {
  if (!slug) return null;
  const doc = await Model.findOne({
    slug: String(slug).toLowerCase(),
    status: 'active',
    deletedAt: null,
  })
    .select('_id')
    .lean();
  return doc?._id || null;
}

/**
 * Build a public Mongo filter for discovery / product listing.
 * Always restricts to approved, non-deleted products.
 */
export async function buildPublicProductFilter(query = {}) {
  const filter = {
    status: PUBLIC_STATUS,
    deletedAt: null,
  };

  const productType = asTrimmed(query.productType) || asTrimmed(query.domain);
  if (productType && productType !== 'all') {
    if (!SUPPORTED_PRODUCT_TYPES.includes(productType)) {
      throw new ApiError('Invalid productType', 400, 'INVALID_PRODUCT_TYPE');
    }
    filter.productType = productType;
  }

  if (query.featured === 'true' || query.featured === true) {
    filter.featured = true;
  }

  const idsRaw = asTrimmed(query.ids);
  if (idsRaw) {
    const ids = idsRaw
      .split(',')
      .map((item) => item.trim())
      .filter((item) => mongoose.isValidObjectId(item));
    if (!ids.length) {
      return { filter: { ...filter, _id: null }, empty: true };
    }
    filter._id = { $in: ids };
  }

  const brandSlug = asTrimmed(query.brand);
  if (brandSlug) {
    const brandId = await resolveCatalogIds(Brand, brandSlug);
    if (!brandId) {
      return { filter: { ...filter, _id: null }, empty: true };
    }
    filter.brand = brandId;
  }

  const categorySlug = asTrimmed(query.category);
  if (categorySlug) {
    const categoryId = await resolveCatalogIds(Category, categorySlug);
    if (!categoryId) {
      return { filter: { ...filter, _id: null }, empty: true };
    }
    filter.category = categoryId;
  }

  const tagSlug = asTrimmed(query.tag);
  if (tagSlug) {
    const tagId = await resolveCatalogIds(Tag, tagSlug);
    if (!tagId) {
      return { filter: { ...filter, _id: null }, empty: true };
    }
    filter.tags = tagId;
  }

  const yearMin = query.yearMin !== undefined && query.yearMin !== '' ? Number(query.yearMin) : null;
  const yearMax = query.yearMax !== undefined && query.yearMax !== '' ? Number(query.yearMax) : null;
  if (yearMin !== null && Number.isFinite(yearMin)) {
    filter.releaseYear = { ...(filter.releaseYear || {}), $gte: yearMin };
  }
  if (yearMax !== null && Number.isFinite(yearMax)) {
    filter.releaseYear = { ...(filter.releaseYear || {}), $lte: yearMax };
  }

  const rarity = asTrimmed(query.rarity).toUpperCase();
  if (rarity) {
    if (!RARITY_VALUES.includes(rarity)) {
      throw new ApiError('Invalid rarity', 400, 'INVALID_RARITY');
    }
    filter.rarity = rarity;
  }

  const availability = asTrimmed(query.availability).toLowerCase();
  if (availability) {
    if (!AVAILABILITY_VALUES.includes(availability)) {
      throw new ApiError('Invalid availability', 400, 'INVALID_AVAILABILITY');
    }
    filter.availability = availability;
  }

  const material = asTrimmed(query.material);
  if (material) {
    filter.materials = { $regex: escapeRegex(material), $options: 'i' };
  }

  const color = asTrimmed(query.color);
  if (color) {
    filter.colors = { $regex: escapeRegex(color), $options: 'i' };
  }

  // Domain-aware specification filters (ignore keys that do not apply to the active type).
  const allowedSpecKeys = new Set(
    filter.productType
      ? SPEC_FIELDS_BY_TYPE[filter.productType] || []
      : SHARED_SPEC_FILTER_KEYS
  );

  for (const key of SHARED_SPEC_FILTER_KEYS) {
    const value = asTrimmed(query[key]);
    if (!value) continue;
    if (!allowedSpecKeys.has(key)) continue;
    filter[`specifications.fields.${key}`] = {
      $regex: escapeRegex(value),
      $options: 'i',
    };
  }

  const searchTerm = asTrimmed(query.q);
  if (searchTerm) {
    const regex = new RegExp(escapeRegex(searchTerm), 'i');
    const [brands, categories, tags] = await Promise.all([
      Brand.find({ name: regex, status: 'active', deletedAt: null }).select('_id').lean(),
      Category.find({ name: regex, status: 'active', deletedAt: null }).select('_id').lean(),
      Tag.find({ name: regex, status: 'active', deletedAt: null }).select('_id').lean(),
    ]);

    const brandIds = brands.map((item) => item._id);
    const categoryIds = categories.map((item) => item._id);
    const tagIds = tags.map((item) => item._id);

    let textIds = [];
    try {
      const textHits = await Product.find({
        status: PUBLIC_STATUS,
        deletedAt: null,
        $text: { $search: searchTerm },
      })
        .select('_id')
        .lean();
      textIds = textHits.map((item) => item._id);
    } catch {
      // Text index may not be ready yet (fresh memory DB) — regex clauses below cover it.
    }

    filter.$or = [
      ...(textIds.length ? [{ _id: { $in: textIds } }] : []),
      ...(brandIds.length ? [{ brand: { $in: brandIds } }] : []),
      ...(categoryIds.length ? [{ category: { $in: categoryIds } }] : []),
      ...(tagIds.length ? [{ tags: { $in: tagIds } }] : []),
      { name: regex },
      { reference: regex },
      { shortDescription: regex },
      { 'specifications.fields.engine': regex },
      { 'specifications.fields.movement': regex },
      { 'specifications.fields.bodyStyle': regex },
    ];
  }

  // Public surfaces never honor arbitrary status overrides.
  filter.status = PUBLIC_STATUS;

  return { filter, empty: false, searchTerm };
}

export function mongoSortForMode(mode) {
  switch (mode) {
    case 'newest':
      return { releaseYear: -1, createdAt: -1, name: 1 };
    case 'name':
      return { name: 1 };
    case 'rarity':
      // Approximate rarity ordering via featured + year; refined in-memory when needed.
      return { featured: -1, releaseYear: -1, name: 1 };
    case 'relevance':
      return { featured: -1, releaseYear: -1, name: 1 };
    case 'popularity':
    default:
      return { featured: -1, releaseYear: -1, name: 1 };
  }
}

export function sortProductsInMemory(products, mode, searchTerm = '') {
  if (mode === 'rarity') {
    return [...products].sort((a, b) => {
      const rankDiff = (RARITY_RANK[b.rarity] || 0) - (RARITY_RANK[a.rarity] || 0);
      if (rankDiff !== 0) return rankDiff;
      return (b.year || 0) - (a.year || 0);
    });
  }

  if (mode === 'relevance' && searchTerm) {
    const needle = searchTerm.toLowerCase();
    const score = (item) => {
      let value = 0;
      if (item.name?.toLowerCase().includes(needle)) value += 8;
      if (item.reference?.toLowerCase().includes(needle)) value += 6;
      if (item.brand?.toLowerCase().includes(needle)) value += 5;
      if (item.shortDescription?.toLowerCase().includes(needle)) value += 2;
      if (item.featured) value += 1;
      return value;
    };
    return [...products].sort((a, b) => score(b) - score(a));
  }

  return products;
}

/** Deterministic shuffle preferring cars/motorcycles before watches. */
export function shufflePreferringPrimary(products, seed) {
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

export function applyFieldSelection(product, fields) {
  if (!fields) return product;
  const selected = {};
  for (const key of fields) {
    if (Object.prototype.hasOwnProperty.call(product, key)) {
      selected[key] = product[key];
    }
  }
  // Always keep identity keys for client routing/caching.
  selected.id = product.id;
  selected.slug = product.slug;
  return selected;
}

export { SORT_VALUES, RARITY_RANK, ALLOWED_PROJECTION_FIELDS };
