import mongoose from 'mongoose';
import { Product } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import { serializeProduct } from './productService.js';
import { getProductJournal as getLinkedProductJournal } from './articleService.js';

const PUBLIC_FILTER = {
  status: 'approved',
  deletedAt: null,
};

const RARITY_RANK = {
  COMMON: 1,
  COLLECTIBLE: 2,
  RARE: 3,
  ICONIC: 4,
  'ULTRA-RARE': 5,
  UNIQUE: 6,
};

/**
 * Related objects: same type preferred, then same brand, shared tags, rarity proximity.
 * Returns deliberate projections via serializeProduct — no uncontrolled populate.
 */
export async function getRelatedProducts(productId, { limit = 6 } = {}) {
  if (!mongoose.isValidObjectId(productId)) {
    throw new ApiError('Invalid product id', 400, 'INVALID_PRODUCT_ID');
  }

  const source = await Product.findOne({ _id: productId, ...PUBLIC_FILTER })
    .select('_id productType brand category tags rarity releaseYear')
    .lean();

  if (!source) {
    throw new ApiError('Product not found', 404, 'PRODUCT_NOT_FOUND');
  }

  const tagIds = (source.tags || []).map(String);
  const capped = Math.min(Math.max(Number(limit) || 6, 1), 12);

  const candidates = await Product.find({
    ...PUBLIC_FILTER,
    _id: { $ne: source._id },
    $or: [
      { productType: source.productType },
      { brand: source.brand },
      ...(tagIds.length ? [{ tags: { $in: source.tags } }] : []),
    ],
  })
    .populate('brand', 'name slug')
    .populate('category', 'name slug')
    .populate('tags', 'name slug')
    .limit(40)
    .lean();

  const scored = candidates
    .map((item) => {
      let score = 0;
      if (item.productType === source.productType) score += 5;
      if (String(item.brand?._id || item.brand) === String(source.brand)) score += 4;
      if (String(item.category?._id || item.category || '') === String(source.category || '')) {
        score += 2;
      }
      const sharedTags = (item.tags || []).filter((tag) => tagIds.includes(String(tag._id || tag)));
      score += sharedTags.length * 2;
      const rarityDelta = Math.abs(
        (RARITY_RANK[item.rarity] || 0) - (RARITY_RANK[source.rarity] || 0)
      );
      score += Math.max(0, 3 - rarityDelta);
      if (item.featured) score += 1;
      return { item, score };
    })
    .sort((a, b) => b.score - a.score || (b.item.releaseYear || 0) - (a.item.releaseYear || 0));

  return scored.slice(0, capped).map(({ item }) => serializeProduct(item));
}

/**
 * Archive recommendations for Search landing / empty results.
 * Featured first, then rarity and recency — approved public objects only.
 */
export async function getRecommendedProducts({ limit = 8, productType } = {}) {
  const capped = Math.min(Math.max(Number(limit) || 8, 1), 24);
  const filter = { ...PUBLIC_FILTER };
  if (productType) filter.productType = productType;

  const candidates = await Product.find(filter)
    .populate('brand', 'name slug')
    .populate('category', 'name slug')
    .populate('tags', 'name slug')
    .limit(60)
    .lean();

  const scored = candidates
    .map((item) => {
      let score = 0;
      if (item.featured) score += 8;
      score += RARITY_RANK[item.rarity] || 0;
      score += Math.min(Math.max((item.releaseYear || 1900) - 1950, 0) / 20, 4);
      return { item, score };
    })
    .sort(
      (a, b) =>
        b.score - a.score ||
        (b.item.releaseYear || 0) - (a.item.releaseYear || 0) ||
        String(a.item.name || '').localeCompare(String(b.item.name || ''))
    );

  return scored.slice(0, capped).map(({ item }) => serializeProduct(item));
}

/**
 * Journal coverage for a product — approved essays linked via Article.relatedProducts.
 */
export async function getProductJournal(productId) {
  return getLinkedProductJournal(productId);
}
