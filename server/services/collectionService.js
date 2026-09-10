import mongoose from 'mongoose';
import { Collection, Product } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import { serializeProduct } from './productService.js';
import { COLLECTION_VISIBILITY } from '../models/Collection.js';

const PUBLIC_FILTER = { status: 'approved', deletedAt: null };

function slugify(value) {
  return String(value || 'collection')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'collection';
}

function serializeCollection(doc, { includeProducts = false } = {}) {
  const plain = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  const products = Array.isArray(plain.products) ? plain.products : [];
  return {
    id: String(plain._id),
    name: plain.name,
    slug: plain.slug,
    description: plain.description || '',
    coverImage: plain.coverImage || '',
    visibility: plain.visibility,
    objectCount: plain.objectCount ?? products.length,
    productIds: products
      .map((item) => {
        if (!item) return null;
        if (typeof item === 'object' && item._id) return String(item._id);
        return String(item);
      })
      .filter(Boolean),
    products: includeProducts
      ? products
          .filter((item) => item && typeof item === 'object' && item._id)
          .map((item) => serializeProduct(item))
      : undefined,
    createdAt: plain.createdAt,
    updatedAt: plain.updatedAt,
  };
}

async function assertApprovedProduct(productId) {
  if (!mongoose.isValidObjectId(productId)) {
    throw new ApiError('Invalid product id', 400, 'INVALID_PRODUCT_ID');
  }
  const product = await Product.findOne({ _id: productId, ...PUBLIC_FILTER }).select('_id images');
  if (!product) {
    throw new ApiError('Product not found', 404, 'PRODUCT_NOT_FOUND');
  }
  return product;
}

async function uniqueSlug(ownerId, name) {
  const base = slugify(name);
  let candidate = base;
  let n = 1;
  while (await Collection.exists({ owner: ownerId, slug: candidate })) {
    n += 1;
    candidate = `${base}-${n}`;
  }
  return candidate;
}

export async function listCollections(userId) {
  const rows = await Collection.find({ owner: userId }).sort({ updatedAt: -1 }).lean();
  return rows.map((row) => serializeCollection(row));
}

export async function createCollection(userId, payload = {}) {
  const name = String(payload.name || '').trim();
  if (!name) {
    throw new ApiError('Collection name is required', 400, 'COLLECTION_NAME_REQUIRED');
  }
  const visibility = COLLECTION_VISIBILITY.includes(payload.visibility)
    ? payload.visibility
    : 'private';
  const slug = await uniqueSlug(userId, name);
  const collection = await Collection.create({
    owner: userId,
    name,
    slug,
    description: String(payload.description || '').slice(0, 2000),
    visibility,
    products: [],
    objectCount: 0,
  });
  return serializeCollection(collection);
}

export async function getCollection(userId, collectionId) {
  if (!mongoose.isValidObjectId(collectionId)) {
    throw new ApiError('Invalid collection id', 400, 'INVALID_COLLECTION_ID');
  }
  const collection = await Collection.findOne({ _id: collectionId, owner: userId })
    .populate({
      path: 'products',
      match: PUBLIC_FILTER,
      populate: [
        { path: 'brand', select: 'name slug' },
        { path: 'category', select: 'name slug' },
        { path: 'tags', select: 'name slug' },
      ],
    })
    .lean();

  if (!collection) {
    throw new ApiError('Collection not found', 404, 'COLLECTION_NOT_FOUND');
  }

  return serializeCollection(collection, { includeProducts: true });
}

export async function updateCollection(userId, collectionId, payload = {}) {
  if (!mongoose.isValidObjectId(collectionId)) {
    throw new ApiError('Invalid collection id', 400, 'INVALID_COLLECTION_ID');
  }
  const collection = await Collection.findOne({ _id: collectionId, owner: userId });
  if (!collection) {
    throw new ApiError('Collection not found', 404, 'COLLECTION_NOT_FOUND');
  }

  if (payload.name !== undefined) {
    const name = String(payload.name || '').trim();
    if (!name) throw new ApiError('Collection name is required', 400, 'COLLECTION_NAME_REQUIRED');
    collection.name = name;
    if (payload.regenerateSlug) {
      collection.slug = await uniqueSlug(userId, name);
    }
  }
  if (payload.description !== undefined) {
    collection.description = String(payload.description || '').slice(0, 2000);
  }
  if (payload.visibility !== undefined) {
    if (!COLLECTION_VISIBILITY.includes(payload.visibility)) {
      throw new ApiError('Invalid visibility', 400, 'INVALID_VISIBILITY');
    }
    collection.visibility = payload.visibility;
  }
  if (payload.coverImage !== undefined) {
    collection.coverImage = String(payload.coverImage || '').slice(0, 500);
  }

  await collection.save();
  return serializeCollection(collection);
}

export async function deleteCollection(userId, collectionId) {
  if (!mongoose.isValidObjectId(collectionId)) {
    throw new ApiError('Invalid collection id', 400, 'INVALID_COLLECTION_ID');
  }
  const result = await Collection.deleteOne({ _id: collectionId, owner: userId });
  if (!result.deletedCount) {
    throw new ApiError('Collection not found', 404, 'COLLECTION_NOT_FOUND');
  }
  return { id: String(collectionId), removed: true };
}

export async function addProductToCollection(userId, collectionId, productId) {
  if (!mongoose.isValidObjectId(collectionId)) {
    throw new ApiError('Invalid collection id', 400, 'INVALID_COLLECTION_ID');
  }
  const collection = await Collection.findOne({ _id: collectionId, owner: userId });
  if (!collection) {
    throw new ApiError('Collection not found', 404, 'COLLECTION_NOT_FOUND');
  }

  const product = await assertApprovedProduct(productId);
  const id = String(product._id);
  const already = collection.products.some((item) => String(item) === id);
  if (!already) {
    collection.products.push(product._id);
    collection.objectCount = collection.products.length;
    if (!collection.coverImage && product.images?.[0]?.url) {
      collection.coverImage = product.images[0].url;
    }
    await collection.save();
  }

  return serializeCollection(collection);
}

export async function removeProductFromCollection(userId, collectionId, productId) {
  if (!mongoose.isValidObjectId(collectionId) || !mongoose.isValidObjectId(productId)) {
    throw new ApiError('Invalid id', 400, 'INVALID_ID');
  }
  const collection = await Collection.findOne({ _id: collectionId, owner: userId });
  if (!collection) {
    throw new ApiError('Collection not found', 404, 'COLLECTION_NOT_FOUND');
  }

  collection.products = collection.products.filter((item) => String(item) !== String(productId));
  collection.objectCount = collection.products.length;
  await collection.save();
  return serializeCollection(collection);
}
