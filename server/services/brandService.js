import { Brand, Product } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import { SUPPORTED_PRODUCT_TYPES } from '../config/constants.js';
import { escapeRegex } from './searchService.js';

const PUBLIC_FILTER = { status: 'active', deletedAt: null };
const PRODUCT_PUBLIC = { status: 'approved', deletedAt: null };

export function serializeBrand(doc, productCount = 0) {
  if (!doc) return null;
  const plain = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  return {
    id: String(plain._id),
    name: plain.name,
    slug: plain.slug,
    description: plain.description || '',
    foundedYear: plain.foundedYear ?? null,
    country: plain.country || null,
    primaryDomains: plain.primaryDomains || [],
    logo: plain.logo || null,
    coverImage: plain.coverImage || plain.logo || null,
    productCount: Number(productCount) || 0,
  };
}

async function productCountsForBrandIds(brandIds) {
  if (!brandIds.length) return new Map();
  const rows = await Product.aggregate([
    { $match: { ...PRODUCT_PUBLIC, brand: { $in: brandIds } } },
    { $group: { _id: '$brand', count: { $sum: 1 } } },
  ]);
  return new Map(rows.map((row) => [String(row._id), row.count]));
}

export async function listPublicBrands(query = {}) {
  const filter = { ...PUBLIC_FILTER };
  const domain = String(query.domain || '').trim();
  if (domain) {
    if (!SUPPORTED_PRODUCT_TYPES.includes(domain)) {
      throw new ApiError('Invalid domain', 400, 'INVALID_DOMAIN');
    }
    filter.primaryDomains = domain;
  }
  const q = String(query.q || '').trim();
  if (q) {
    filter.name = { $regex: escapeRegex(q), $options: 'i' };
  }

  const brands = await Brand.find(filter).sort({ name: 1 }).lean();
  const counts = await productCountsForBrandIds(brands.map((item) => item._id));
  return brands.map((item) => serializeBrand(item, counts.get(String(item._id)) || 0));
}

export async function getPublicBrandBySlug(slug) {
  const brand = await Brand.findOne({ ...PUBLIC_FILTER, slug }).lean();
  if (!brand) {
    throw new ApiError('Brand not found', 404, 'BRAND_NOT_FOUND');
  }
  const counts = await productCountsForBrandIds([brand._id]);
  return serializeBrand(brand, counts.get(String(brand._id)) || 0);
}
