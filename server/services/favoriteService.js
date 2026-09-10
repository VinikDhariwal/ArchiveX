import mongoose from 'mongoose';
import { Favorite, Product } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import { serializeProduct } from './productService.js';

const PUBLIC_FILTER = { status: 'approved', deletedAt: null };

async function assertApprovedProduct(productId) {
  if (!mongoose.isValidObjectId(productId)) {
    throw new ApiError('Invalid product id', 400, 'INVALID_PRODUCT_ID');
  }
  const product = await Product.findOne({ _id: productId, ...PUBLIC_FILTER }).select('_id');
  if (!product) {
    throw new ApiError('Product not found', 404, 'PRODUCT_NOT_FOUND');
  }
  return String(product._id);
}

export async function listFavorites(userId) {
  const rows = await Favorite.find({ user: userId })
    .sort({ createdAt: -1 })
    .populate({
      path: 'product',
      match: PUBLIC_FILTER,
      populate: [
        { path: 'brand', select: 'name slug' },
        { path: 'category', select: 'name slug' },
        { path: 'tags', select: 'name slug' },
      ],
    })
    .lean();

  return rows
    .filter((row) => row.product)
    .map((row) => ({
      id: String(row._id),
      createdAt: row.createdAt,
      product: serializeProduct(row.product),
    }));
}

export async function addFavorite(userId, productId) {
  const id = await assertApprovedProduct(productId);
  try {
    const favorite = await Favorite.create({ user: userId, product: id });
    return { id: String(favorite._id), productId: id, createdAt: favorite.createdAt };
  } catch (error) {
    if (error?.code === 11000) {
      const existing = await Favorite.findOne({ user: userId, product: id }).lean();
      return {
        id: String(existing._id),
        productId: id,
        createdAt: existing.createdAt,
      };
    }
    throw error;
  }
}

export async function removeFavorite(userId, productId) {
  if (!mongoose.isValidObjectId(productId)) {
    throw new ApiError('Invalid product id', 400, 'INVALID_PRODUCT_ID');
  }
  await Favorite.deleteOne({ user: userId, product: productId });
  return { productId: String(productId), removed: true };
}

export async function listFavoriteProductIds(userId) {
  const rows = await Favorite.find({ user: userId }).select('product').lean();
  return rows.map((row) => String(row.product));
}
