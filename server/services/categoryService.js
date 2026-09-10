import { Category, Product } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import { SUPPORTED_PRODUCT_TYPES } from '../config/constants.js';

const PUBLIC_FILTER = { status: 'active', deletedAt: null };
const PRODUCT_PUBLIC = { status: 'approved', deletedAt: null };

export function serializeCategory(doc, productCount = 0) {
  if (!doc) return null;
  const plain = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  return {
    id: String(plain._id),
    name: plain.name,
    slug: plain.slug,
    description: plain.description || '',
    productType: plain.productType,
    productCount: Number(productCount) || 0,
  };
}

async function productCountsForCategoryIds(categoryIds) {
  if (!categoryIds.length) return new Map();
  const rows = await Product.aggregate([
    { $match: { ...PRODUCT_PUBLIC, category: { $in: categoryIds } } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);
  return new Map(rows.map((row) => [String(row._id), row.count]));
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
  const counts = await productCountsForCategoryIds(categories.map((item) => item._id));
  return categories.map((item) => serializeCategory(item, counts.get(String(item._id)) || 0));
}

export async function getPublicCategoryBySlug(slug) {
  const category = await Category.findOne({ ...PUBLIC_FILTER, slug }).lean();
  if (!category) {
    throw new ApiError('Category not found', 404, 'CATEGORY_NOT_FOUND');
  }
  const counts = await productCountsForCategoryIds([category._id]);
  return serializeCategory(category, counts.get(String(category._id)) || 0);
}
