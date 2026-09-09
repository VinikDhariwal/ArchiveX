import { Category } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import { SUPPORTED_PRODUCT_TYPES } from '../config/constants.js';

const PUBLIC_FILTER = { status: 'active', deletedAt: null };

export function serializeCategory(doc) {
  if (!doc) return null;
  const plain = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  return {
    id: String(plain._id),
    name: plain.name,
    slug: plain.slug,
    description: plain.description || '',
    productType: plain.productType,
  };
}

export async function listPublicCategories(query = {}) {
  const filter = { ...PUBLIC_FILTER };
  if (query.productType) {
    if (!SUPPORTED_PRODUCT_TYPES.includes(query.productType)) {
      throw new ApiError('Invalid productType', 400, 'INVALID_PRODUCT_TYPE');
    }
    filter.productType = query.productType;
  }

  const categories = await Category.find(filter).sort({ name: 1 }).lean();
  return categories.map(serializeCategory);
}

export async function getPublicCategoryBySlug(slug) {
  const category = await Category.findOne({ ...PUBLIC_FILTER, slug }).lean();
  if (!category) {
    throw new ApiError('Category not found', 404, 'CATEGORY_NOT_FOUND');
  }
  return serializeCategory(category);
}
