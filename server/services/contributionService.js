import mongoose from 'mongoose';
import {
  IMAGE_TYPES,
  RARITY_VALUES,
  AVAILABILITY_VALUES,
  SUPPORTED_PRODUCT_TYPES,
} from '../config/constants.js';
import { Brand, Category, Product, buildSpecifications, assertValidSpecifications } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import { serializeProduct } from './productService.js';
import { recordAudit } from './auditService.js';

const EDITABLE_STATUSES = new Set(['pending', 'rejected']);

function slugify(value, fallback = 'item') {
  return (
    String(value || fallback)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || fallback
  );
}

async function uniqueSlug(base, excludeId) {
  let candidate = base;
  let n = 1;
  while (true) {
    const filter = { slug: candidate };
    if (excludeId) filter._id = { $ne: excludeId };
    const exists = await Product.exists(filter);
    if (!exists) return candidate;
    n += 1;
    candidate = `${base}-${n}`;
  }
}

function asObjectId(value, label = 'id') {
  if (!mongoose.isValidObjectId(value)) {
    throw new ApiError(`Invalid ${label}`, 400, 'INVALID_ID');
  }
  return value;
}

function assertHttpUrl(url, label = 'Image URL') {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    throw new ApiError(`${label} must be an absolute http(s) URL`, 400, 'INVALID_URL');
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new ApiError(`${label} must use http or https`, 400, 'INVALID_URL');
  }
}

function normalizeContributionImages(value) {
  if (value == null) return [];
  if (!Array.isArray(value)) {
    throw new ApiError('Images must be an array', 400, 'VALIDATION_ERROR');
  }
  return value
    .map((image, index) => {
      const url = String(image?.url || '').trim();
      if (!url) return null;
      assertHttpUrl(url);
      return {
        url,
        alt: String(image?.alt || '').trim().slice(0, 200),
        type: IMAGE_TYPES.includes(image?.type) ? image.type : 'gallery',
        sortOrder: Number.isFinite(Number(image?.sortOrder)) ? Number(image.sortOrder) : index,
      };
    })
    .filter(Boolean);
}

async function resolveActiveBrandId(value) {
  if (!value) throw new ApiError('Brand is required', 400, 'BRAND_REQUIRED');
  const filter = { deletedAt: null, status: 'active' };
  let brand = null;
  if (mongoose.isValidObjectId(value)) {
    brand = await Brand.findOne({ ...filter, _id: value }).select('_id');
  }
  if (!brand) {
    brand = await Brand.findOne({ ...filter, slug: String(value).toLowerCase().trim() }).select(
      '_id'
    );
  }
  if (!brand) throw new ApiError('Active brand not found', 404, 'BRAND_NOT_FOUND');
  return brand._id;
}

async function resolveCategoryForType(value, productType) {
  if (!value) return null;
  const filter = { deletedAt: null, status: 'active', productType };
  let category = null;
  if (mongoose.isValidObjectId(value)) {
    category = await Category.findOne({ ...filter, _id: value }).select('_id');
  }
  if (!category) {
    category = await Category.findOne({
      ...filter,
      slug: String(value).toLowerCase().trim(),
    }).select('_id');
  }
  if (!category) throw new ApiError('Category not found for this domain', 404, 'CATEGORY_NOT_FOUND');
  return category._id;
}

function serializeSubmission(doc) {
  const base = serializeProduct(doc);
  const plain = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  const brandDoc = plain.brand && typeof plain.brand === 'object' ? plain.brand : null;
  return {
    ...base,
    brandId: brandDoc?._id ? String(brandDoc._id) : plain.brand ? String(plain.brand) : null,
    status: plain.status,
    submittedBy: plain.submittedBy ? String(plain.submittedBy) : null,
    productionPeriod: plain.productionPeriod || '',
    createdAt: plain.createdAt,
    updatedAt: plain.updatedAt,
  };
}

async function loadOwned(userId, productId) {
  const product = await Product.findOne({
    _id: asObjectId(productId),
    submittedBy: userId,
    deletedAt: null,
  })
    .populate('brand', 'name slug')
    .populate('category', 'name slug')
    .populate('tags', 'name slug');
  if (!product) throw new ApiError('Submission not found', 404, 'SUBMISSION_NOT_FOUND');
  return product;
}

function assertEditable(product) {
  if (!EDITABLE_STATUSES.has(product.status)) {
    throw new ApiError(
      'Only pending or rejected submissions can be edited',
      403,
      'SUBMISSION_LOCKED'
    );
  }
}

function buildSpecs(productType, payload) {
  if (!payload?.specifications && !payload?.specs) return undefined;
  const raw = payload.specifications || payload.specs || {};
  const fields = raw.fields && typeof raw.fields === 'object' ? raw.fields : raw;
  const cleaned =
    fields && typeof fields === 'object' && !Array.isArray(fields)
      ? Object.fromEntries(
          Object.entries(fields)
            .map(([key, value]) => [key, String(value ?? '').trim()])
            .filter(([, value]) => value.length > 0)
        )
      : {};
  if (!Object.keys(cleaned).length) return undefined;
  try {
    assertValidSpecifications(productType, { productType, fields: cleaned });
    return buildSpecifications(productType, cleaned);
  } catch (error) {
    throw new ApiError(error.message || 'Invalid specifications', 400, 'INVALID_SPECIFICATIONS');
  }
}

export async function createContribution(userId, payload = {}) {
  const name = String(payload.name || '').trim();
  if (name.length < 2) throw new ApiError('Name is required', 400, 'NAME_REQUIRED');

  const productType = payload.productType;
  if (!SUPPORTED_PRODUCT_TYPES.includes(productType)) {
    throw new ApiError('Invalid productType', 400, 'INVALID_PRODUCT_TYPE');
  }

  const shortDescription = String(payload.shortDescription || '').trim();
  if (shortDescription.length < 8) {
    throw new ApiError('A short description is required', 400, 'DESCRIPTION_REQUIRED');
  }

  const brand = await resolveActiveBrandId(payload.brandId || payload.brandSlug || payload.brand);
  const category = await resolveCategoryForType(
    payload.categoryId || payload.categorySlug || payload.category,
    productType
  );
  const images = normalizeContributionImages(payload.images);
  const slug = await uniqueSlug(slugify(payload.slug || name));
  const specifications = buildSpecs(productType, payload);

  const product = await Product.create({
    name,
    slug,
    reference: String(payload.reference || '').trim().slice(0, 80),
    productType,
    brand,
    category: category || undefined,
    shortDescription: shortDescription.slice(0, 500),
    description: String(payload.description || '').trim().slice(0, 20000),
    whyItMatters: String(payload.whyItMatters || '').trim().slice(0, 8000),
    releaseYear: payload.releaseYear ? Number(payload.releaseYear) : undefined,
    productionPeriod: String(payload.productionPeriod || '').trim().slice(0, 120),
    rarity: RARITY_VALUES.includes(payload.rarity) ? payload.rarity : 'COLLECTIBLE',
    availability: AVAILABILITY_VALUES.includes(payload.availability)
      ? payload.availability
      : 'unknown',
    featured: false,
    status: 'pending',
    images,
    specifications,
    submittedBy: userId,
    createdBy: userId,
    updatedBy: userId,
  });

  await recordAudit({
    actorId: userId,
    action: 'product.contribute',
    entityType: 'product',
    entityId: product._id,
    summary: `Collector submitted ${product.name}`,
  });

  const loaded = await Product.findById(product._id)
    .populate('brand', 'name slug')
    .populate('category', 'name slug')
    .populate('tags', 'name slug');
  return serializeSubmission(loaded);
}

export async function listMyContributions(userId) {
  const rows = await Product.find({ submittedBy: userId, deletedAt: null })
    .sort({ updatedAt: -1 })
    .populate('brand', 'name slug')
    .populate('category', 'name slug')
    .populate('tags', 'name slug')
    .lean();
  return rows.map(serializeSubmission);
}

export async function getMyContribution(userId, productId) {
  const product = await loadOwned(userId, productId);
  return serializeSubmission(product);
}

export async function updateMyContribution(userId, productId, payload = {}) {
  const product = await loadOwned(userId, productId);
  assertEditable(product);

  if (payload.name != null) {
    const name = String(payload.name).trim();
    if (name.length < 2) throw new ApiError('Name is required', 400, 'NAME_REQUIRED');
    product.name = name;
  }
  if (payload.shortDescription != null) {
    const shortDescription = String(payload.shortDescription).trim();
    if (shortDescription.length < 8) {
      throw new ApiError('A short description is required', 400, 'DESCRIPTION_REQUIRED');
    }
    product.shortDescription = shortDescription.slice(0, 500);
  }
  if (payload.description != null) {
    product.description = String(payload.description).trim().slice(0, 20000);
  }
  if (payload.whyItMatters != null) {
    product.whyItMatters = String(payload.whyItMatters).trim().slice(0, 8000);
  }
  if (payload.reference != null) {
    product.reference = String(payload.reference).trim().slice(0, 80);
  }
  if (payload.releaseYear !== undefined) {
    product.releaseYear = payload.releaseYear ? Number(payload.releaseYear) : undefined;
  }
  if (payload.productionPeriod != null) {
    product.productionPeriod = String(payload.productionPeriod).trim().slice(0, 120);
  }
  if (payload.productType) {
    if (!SUPPORTED_PRODUCT_TYPES.includes(payload.productType)) {
      throw new ApiError('Invalid productType', 400, 'INVALID_PRODUCT_TYPE');
    }
    product.productType = payload.productType;
  }
  if (payload.brandId || payload.brandSlug || payload.brand) {
    product.brand = await resolveActiveBrandId(
      payload.brandId || payload.brandSlug || payload.brand
    );
  }
  if (
    payload.categoryId !== undefined ||
    payload.categorySlug !== undefined ||
    payload.category !== undefined
  ) {
    product.category = await resolveCategoryForType(
      payload.categoryId || payload.categorySlug || payload.category,
      product.productType
    );
  }
  if (payload.images !== undefined) {
    product.images = normalizeContributionImages(payload.images);
  }
  if (payload.specifications !== undefined || payload.specs !== undefined) {
    product.specifications = buildSpecs(product.productType, payload);
  }
  if (payload.rarity && RARITY_VALUES.includes(payload.rarity)) {
    product.rarity = payload.rarity;
  }
  if (payload.availability && AVAILABILITY_VALUES.includes(payload.availability)) {
    product.availability = payload.availability;
  }

  // Rejected submissions return to the queue when the collector revises them.
  if (product.status === 'rejected') {
    product.status = 'pending';
  }

  product.featured = false;
  product.updatedBy = userId;
  await product.save();

  await recordAudit({
    actorId: userId,
    action: 'product.contribute.update',
    entityType: 'product',
    entityId: product._id,
    summary: `Collector updated submission ${product.name}`,
  });

  const loaded = await Product.findById(product._id)
    .populate('brand', 'name slug')
    .populate('category', 'name slug')
    .populate('tags', 'name slug');
  return serializeSubmission(loaded);
}

export async function withdrawMyContribution(userId, productId) {
  const product = await loadOwned(userId, productId);
  assertEditable(product);

  product.deletedAt = new Date();
  product.updatedBy = userId;
  await product.save();

  await recordAudit({
    actorId: userId,
    action: 'product.contribute.withdraw',
    entityType: 'product',
    entityId: product._id,
    summary: `Collector withdrew submission ${product.name}`,
  });

  return { id: String(product._id), withdrawn: true };
}
