import { Brand } from '../models/index.js';
import ApiError from '../utils/ApiError.js';

const PUBLIC_FILTER = { status: 'active', deletedAt: null };

export function serializeBrand(doc) {
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
  };
}

export async function listPublicBrands(query = {}) {
  const filter = { ...PUBLIC_FILTER };
  if (query.domain) {
    filter.primaryDomains = query.domain;
  }

  const brands = await Brand.find(filter).sort({ name: 1 }).lean();
  return brands.map(serializeBrand);
}

export async function getPublicBrandBySlug(slug) {
  const brand = await Brand.findOne({ ...PUBLIC_FILTER, slug }).lean();
  if (!brand) {
    throw new ApiError('Brand not found', 404, 'BRAND_NOT_FOUND');
  }
  return serializeBrand(brand);
}
