import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import {
  ARTICLE_STATUSES,
  ARTICLE_TYPES,
  CATALOG_STATUSES,
  IMAGE_TYPES,
  PRODUCT_STATUSES,
  SUPPORTED_PRODUCT_TYPES,
  USER_ROLES,
  USER_STATUSES,
} from '../config/constants.js';
import { Article, Brand, Category, Product, User } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import { serializeProduct } from './productService.js';
import { serializeBrand } from './brandService.js';
import { serializeCategory } from './categoryService.js';
import { serializeArticleCard } from './articleService.js';
import { recordAudit } from './auditService.js';

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

async function uniqueSlug(Model, base, excludeId) {
  let candidate = base;
  let n = 1;
  while (true) {
    const filter = { slug: candidate };
    if (excludeId) filter._id = { $ne: excludeId };
    const exists = await Model.exists(filter);
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

function normalizeImages(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((image, index) => {
      const url = String(image?.url || '').trim();
      if (!url) return null;
      return {
        url,
        alt: String(image?.alt || '').trim(),
        type: IMAGE_TYPES.includes(image?.type) ? image.type : 'gallery',
        sortOrder: Number.isFinite(Number(image?.sortOrder)) ? Number(image.sortOrder) : index,
        width: image?.width ? Number(image.width) : undefined,
        height: image?.height ? Number(image.height) : undefined,
      };
    })
    .filter(Boolean);
}

function normalizeImage(value, fallbackType = 'other') {
  if (!value) return undefined;
  if (typeof value === 'string') {
    const url = value.trim();
    if (!url) return undefined;
    return { url, alt: '', type: fallbackType, sortOrder: 0 };
  }
  const url = String(value.url || '').trim();
  if (!url) return undefined;
  return {
    url,
    alt: String(value.alt || '').trim(),
    type: IMAGE_TYPES.includes(value.type) ? value.type : fallbackType,
    sortOrder: Number(value.sortOrder) || 0,
    width: value.width ? Number(value.width) : undefined,
    height: value.height ? Number(value.height) : undefined,
  };
}

async function resolveBrandId(value) {
  if (!value) throw new ApiError('Brand is required', 400, 'BRAND_REQUIRED');
  if (mongoose.isValidObjectId(value)) {
    const byId = await Brand.findOne({ _id: value, deletedAt: null }).select('_id');
    if (byId) return byId._id;
  }
  const bySlug = await Brand.findOne({ slug: String(value).toLowerCase(), deletedAt: null }).select(
    '_id'
  );
  if (!bySlug) throw new ApiError('Brand not found', 404, 'BRAND_NOT_FOUND');
  return bySlug._id;
}

async function resolveCategoryId(value) {
  if (!value) return null;
  if (mongoose.isValidObjectId(value)) {
    const byId = await Category.findOne({ _id: value, deletedAt: null }).select('_id');
    if (byId) return byId._id;
  }
  const bySlug = await Category.findOne({
    slug: String(value).toLowerCase(),
    deletedAt: null,
  }).select('_id');
  if (!bySlug) throw new ApiError('Category not found', 404, 'CATEGORY_NOT_FOUND');
  return bySlug._id;
}

function serializeAdminProduct(doc) {
  const base = serializeProduct(doc);
  const plain = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  const brandDoc = plain.brand && typeof plain.brand === 'object' ? plain.brand : null;
  return {
    ...base,
    brandId: brandDoc?._id ? String(brandDoc._id) : plain.brand ? String(plain.brand) : null,
    productionPeriod: plain.productionPeriod || '',
    status: plain.status,
    deletedAt: plain.deletedAt || null,
    submittedBy: plain.submittedBy ? String(plain.submittedBy) : null,
    createdBy: plain.createdBy ? String(plain.createdBy) : null,
    updatedBy: plain.updatedBy ? String(plain.updatedBy) : null,
    createdAt: plain.createdAt,
    updatedAt: plain.updatedAt,
  };
}

function serializeAdminArticle(doc) {
  const card = serializeArticleCard(doc);
  const plain = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  return {
    ...card,
    articleType: plain.articleType || card.type,
    status: plain.status,
    sections: (plain.sections || []).map((section) => ({
      heading: section.heading || '',
      body: section.body || '',
    })),
    relatedProductIds: (plain.relatedProducts || []).map(String),
    deletedAt: plain.deletedAt || null,
    createdAt: plain.createdAt,
    updatedAt: plain.updatedAt,
  };
}

function serializeAdminUser(doc) {
  const plain = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  return {
    id: String(plain._id),
    name: plain.name,
    email: plain.email,
    role: plain.role,
    status: plain.status,
    createdAt: plain.createdAt,
    updatedAt: plain.updatedAt,
    deletedAt: plain.deletedAt || null,
  };
}

export async function getAdminOverview() {
  const [
    productsTotal,
    productsPending,
    brandsTotal,
    categoriesTotal,
    articlesTotal,
    articlesDraft,
    usersTotal,
  ] = await Promise.all([
    Product.countDocuments({ deletedAt: null }),
    Product.countDocuments({ status: 'pending', deletedAt: null }),
    Brand.countDocuments({ deletedAt: null }),
    Category.countDocuments({ deletedAt: null }),
    Article.countDocuments({ deletedAt: null }),
    Article.countDocuments({ status: 'draft', deletedAt: null }),
    User.countDocuments({ deletedAt: null }),
  ]);

  return {
    productsTotal,
    productsPending,
    brandsTotal,
    categoriesTotal,
    articlesTotal,
    articlesDraft,
    usersTotal,
  };
}

export async function listAdminProducts(query = {}) {
  const filter = { deletedAt: null };
  if (query.status) {
    if (!PRODUCT_STATUSES.includes(query.status)) {
      throw new ApiError('Invalid status', 400, 'INVALID_STATUS');
    }
    filter.status = query.status;
  }
  if (query.productType) {
    if (!SUPPORTED_PRODUCT_TYPES.includes(query.productType)) {
      throw new ApiError('Invalid productType', 400, 'INVALID_PRODUCT_TYPE');
    }
    filter.productType = query.productType;
  }
  if (query.q) {
    filter.$or = [
      { name: { $regex: String(query.q).trim(), $options: 'i' } },
      { slug: { $regex: String(query.q).trim(), $options: 'i' } },
      { reference: { $regex: String(query.q).trim(), $options: 'i' } },
    ];
  }

  const limit = Math.min(Math.max(Number(query.limit) || 40, 1), 100);
  const page = Math.max(Number(query.page) || 1, 1);
  const skip = (page - 1) * limit;

  const [rows, total] = await Promise.all([
    Product.find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('brand', 'name slug')
      .populate('category', 'name slug productType')
      .lean(),
    Product.countDocuments(filter),
  ]);

  return {
    items: rows.map(serializeAdminProduct),
    meta: { total, page, limit, totalPages: Math.max(Math.ceil(total / limit), 1) },
  };
}

export async function getAdminProduct(id) {
  const product = await Product.findOne({ _id: asObjectId(id), deletedAt: null })
    .populate('brand', 'name slug')
    .populate('category', 'name slug productType')
    .populate('tags', 'name slug')
    .lean();
  if (!product) throw new ApiError('Product not found', 404, 'PRODUCT_NOT_FOUND');
  return serializeAdminProduct(product);
}

export async function createAdminProduct(actorId, payload = {}) {
  const name = String(payload.name || '').trim();
  if (!name) throw new ApiError('Name is required', 400, 'NAME_REQUIRED');
  const productType = payload.productType;
  if (!SUPPORTED_PRODUCT_TYPES.includes(productType)) {
    throw new ApiError('Invalid productType', 400, 'INVALID_PRODUCT_TYPE');
  }
  const brand = await resolveBrandId(payload.brand || payload.brandSlug || payload.brandId);
  const category = await resolveCategoryId(payload.category || payload.categorySlug);
  const status = PRODUCT_STATUSES.includes(payload.status) ? payload.status : 'draft';
  const slug = await uniqueSlug(Product, slugify(payload.slug || name));

  const product = await Product.create({
    name,
    slug,
    reference: payload.reference || '',
    productType,
    brand,
    category: category || undefined,
    shortDescription: payload.shortDescription || '',
    description: payload.description || '',
    whyItMatters: payload.whyItMatters || '',
    releaseYear: payload.releaseYear || undefined,
    productionPeriod: payload.productionPeriod || '',
    rarity: payload.rarity || 'COLLECTIBLE',
    availability: payload.availability || 'unknown',
    featured: Boolean(payload.featured),
    status,
    images: normalizeImages(payload.images),
    createdBy: actorId,
    updatedBy: actorId,
    submittedBy: actorId,
  });

  await recordAudit({
    actorId,
    action: 'product.create',
    entityType: 'product',
    entityId: product._id,
    summary: `Created product ${product.name} (${status})`,
  });

  return getAdminProduct(product._id);
}

export async function updateAdminProduct(actorId, id, payload = {}) {
  const product = await Product.findOne({ _id: asObjectId(id), deletedAt: null });
  if (!product) throw new ApiError('Product not found', 404, 'PRODUCT_NOT_FOUND');

  if (payload.name != null) product.name = String(payload.name).trim();
  if (payload.slug) {
    product.slug = await uniqueSlug(Product, slugify(payload.slug), product._id);
  }
  if (payload.reference != null) product.reference = payload.reference;
  if (payload.productType) {
    if (!SUPPORTED_PRODUCT_TYPES.includes(payload.productType)) {
      throw new ApiError('Invalid productType', 400, 'INVALID_PRODUCT_TYPE');
    }
    product.productType = payload.productType;
  }
  if (payload.brand || payload.brandSlug || payload.brandId) {
    product.brand = await resolveBrandId(payload.brand || payload.brandSlug || payload.brandId);
  }
  if (payload.category !== undefined || payload.categorySlug !== undefined) {
    product.category = await resolveCategoryId(payload.category || payload.categorySlug);
  }
  if (payload.shortDescription != null) product.shortDescription = payload.shortDescription;
  if (payload.description != null) product.description = payload.description;
  if (payload.whyItMatters != null) product.whyItMatters = payload.whyItMatters;
  if (payload.releaseYear !== undefined) product.releaseYear = payload.releaseYear || undefined;
  if (payload.productionPeriod != null) product.productionPeriod = payload.productionPeriod;
  if (payload.rarity) product.rarity = payload.rarity;
  if (payload.availability) product.availability = payload.availability;
  if (payload.featured !== undefined) product.featured = Boolean(payload.featured);
  if (payload.status) {
    if (!PRODUCT_STATUSES.includes(payload.status)) {
      throw new ApiError('Invalid status', 400, 'INVALID_STATUS');
    }
    product.status = payload.status;
  }
  if (Array.isArray(payload.images)) product.images = normalizeImages(payload.images);
  product.updatedBy = actorId;
  await product.save();

  await recordAudit({
    actorId,
    action: 'product.update',
    entityType: 'product',
    entityId: product._id,
    summary: `Updated product ${product.name}`,
    meta: { status: product.status },
  });

  return getAdminProduct(product._id);
}

export async function setAdminProductStatus(actorId, id, status) {
  if (!PRODUCT_STATUSES.includes(status)) {
    throw new ApiError('Invalid status', 400, 'INVALID_STATUS');
  }
  const product = await Product.findOne({ _id: asObjectId(id), deletedAt: null });
  if (!product) throw new ApiError('Product not found', 404, 'PRODUCT_NOT_FOUND');
  product.status = status;
  product.updatedBy = actorId;
  await product.save();

  await recordAudit({
    actorId,
    action: `product.${status}`,
    entityType: 'product',
    entityId: product._id,
    summary: `Set ${product.name} to ${status}`,
  });

  return getAdminProduct(product._id);
}

export async function deleteAdminProduct(actorId, id) {
  const product = await Product.findOne({ _id: asObjectId(id), deletedAt: null });
  if (!product) throw new ApiError('Product not found', 404, 'PRODUCT_NOT_FOUND');
  product.deletedAt = new Date();
  product.status = 'archived';
  product.updatedBy = actorId;
  await product.save();

  await recordAudit({
    actorId,
    action: 'product.delete',
    entityType: 'product',
    entityId: product._id,
    summary: `Soft-deleted product ${product.name}`,
  });

  return { id: String(product._id), deleted: true };
}

export async function listAdminBrands(query = {}) {
  const filter = { deletedAt: null };
  if (query.status && CATALOG_STATUSES.includes(query.status)) filter.status = query.status;
  if (query.domain) filter.primaryDomains = query.domain;
  const rows = await Brand.find(filter).sort({ name: 1 }).lean();
  return rows.map((row) => ({
    ...serializeBrand(row, 0),
    status: row.status,
    deletedAt: row.deletedAt || null,
  }));
}

export async function createAdminBrand(actorId, payload = {}) {
  const name = String(payload.name || '').trim();
  if (!name) throw new ApiError('Name is required', 400, 'NAME_REQUIRED');
  const slug = await uniqueSlug(Brand, slugify(payload.slug || name));
  const brand = await Brand.create({
    name,
    slug,
    description: payload.description || '',
    foundedYear: payload.foundedYear || undefined,
    country: payload.country || '',
    primaryDomains: Array.isArray(payload.primaryDomains) ? payload.primaryDomains : [],
    logo: normalizeImage(payload.logo, 'other'),
    status: CATALOG_STATUSES.includes(payload.status) ? payload.status : 'active',
  });

  await recordAudit({
    actorId,
    action: 'brand.create',
    entityType: 'brand',
    entityId: brand._id,
    summary: `Created brand ${brand.name}`,
  });

  return { ...serializeBrand(brand, 0), status: brand.status };
}

export async function updateAdminBrand(actorId, id, payload = {}) {
  const brand = await Brand.findOne({ _id: asObjectId(id), deletedAt: null });
  if (!brand) throw new ApiError('Brand not found', 404, 'BRAND_NOT_FOUND');
  if (payload.name != null) brand.name = String(payload.name).trim();
  if (payload.slug) brand.slug = await uniqueSlug(Brand, slugify(payload.slug), brand._id);
  if (payload.description != null) brand.description = payload.description;
  if (payload.foundedYear !== undefined) brand.foundedYear = payload.foundedYear || undefined;
  if (payload.country != null) brand.country = payload.country;
  if (Array.isArray(payload.primaryDomains)) brand.primaryDomains = payload.primaryDomains;
  if (payload.logo !== undefined) brand.logo = normalizeImage(payload.logo, 'other');
  if (payload.status && CATALOG_STATUSES.includes(payload.status)) brand.status = payload.status;
  await brand.save();

  await recordAudit({
    actorId,
    action: 'brand.update',
    entityType: 'brand',
    entityId: brand._id,
    summary: `Updated brand ${brand.name}`,
  });

  return { ...serializeBrand(brand, 0), status: brand.status };
}

export async function deleteAdminBrand(actorId, id) {
  const brand = await Brand.findOne({ _id: asObjectId(id), deletedAt: null });
  if (!brand) throw new ApiError('Brand not found', 404, 'BRAND_NOT_FOUND');
  brand.deletedAt = new Date();
  brand.status = 'inactive';
  await brand.save();
  await recordAudit({
    actorId,
    action: 'brand.delete',
    entityType: 'brand',
    entityId: brand._id,
    summary: `Soft-deleted brand ${brand.name}`,
  });
  return { id: String(brand._id), deleted: true };
}

export async function listAdminCategories(query = {}) {
  const filter = { deletedAt: null };
  if (query.productType && SUPPORTED_PRODUCT_TYPES.includes(query.productType)) {
    filter.productType = query.productType;
  }
  if (query.status && CATALOG_STATUSES.includes(query.status)) filter.status = query.status;
  const rows = await Category.find(filter).sort({ name: 1 }).lean();
  return rows.map((row) => ({
    ...serializeCategory(row, 0),
    status: row.status,
    deletedAt: row.deletedAt || null,
  }));
}

export async function createAdminCategory(actorId, payload = {}) {
  const name = String(payload.name || '').trim();
  if (!name) throw new ApiError('Name is required', 400, 'NAME_REQUIRED');
  if (!SUPPORTED_PRODUCT_TYPES.includes(payload.productType)) {
    throw new ApiError('Invalid productType', 400, 'INVALID_PRODUCT_TYPE');
  }
  const slug = await uniqueSlug(Category, slugify(payload.slug || name));
  const category = await Category.create({
    name,
    slug,
    description: payload.description || '',
    productType: payload.productType,
    status: CATALOG_STATUSES.includes(payload.status) ? payload.status : 'active',
  });
  await recordAudit({
    actorId,
    action: 'category.create',
    entityType: 'category',
    entityId: category._id,
    summary: `Created category ${category.name}`,
  });
  return { ...serializeCategory(category, 0), status: category.status };
}

export async function updateAdminCategory(actorId, id, payload = {}) {
  const category = await Category.findOne({ _id: asObjectId(id), deletedAt: null });
  if (!category) throw new ApiError('Category not found', 404, 'CATEGORY_NOT_FOUND');
  if (payload.name != null) category.name = String(payload.name).trim();
  if (payload.slug) {
    category.slug = await uniqueSlug(Category, slugify(payload.slug), category._id);
  }
  if (payload.description != null) category.description = payload.description;
  if (payload.productType) {
    if (!SUPPORTED_PRODUCT_TYPES.includes(payload.productType)) {
      throw new ApiError('Invalid productType', 400, 'INVALID_PRODUCT_TYPE');
    }
    category.productType = payload.productType;
  }
  if (payload.status && CATALOG_STATUSES.includes(payload.status)) category.status = payload.status;
  await category.save();
  await recordAudit({
    actorId,
    action: 'category.update',
    entityType: 'category',
    entityId: category._id,
    summary: `Updated category ${category.name}`,
  });
  return { ...serializeCategory(category, 0), status: category.status };
}

export async function deleteAdminCategory(actorId, id) {
  const category = await Category.findOne({ _id: asObjectId(id), deletedAt: null });
  if (!category) throw new ApiError('Category not found', 404, 'CATEGORY_NOT_FOUND');
  category.deletedAt = new Date();
  category.status = 'inactive';
  await category.save();
  await recordAudit({
    actorId,
    action: 'category.delete',
    entityType: 'category',
    entityId: category._id,
    summary: `Soft-deleted category ${category.name}`,
  });
  return { id: String(category._id), deleted: true };
}

export async function listAdminArticles(query = {}) {
  const filter = { deletedAt: null };
  if (query.status) {
    if (!ARTICLE_STATUSES.includes(query.status)) {
      throw new ApiError('Invalid status', 400, 'INVALID_STATUS');
    }
    filter.status = query.status;
  }
  const rows = await Article.find(filter).sort({ updatedAt: -1 }).lean();
  return rows.map(serializeAdminArticle);
}

export async function getAdminArticle(id) {
  const article = await Article.findOne({ _id: asObjectId(id), deletedAt: null }).lean();
  if (!article) throw new ApiError('Article not found', 404, 'ARTICLE_NOT_FOUND');
  return serializeAdminArticle(article);
}

export async function createAdminArticle(actorId, payload = {}) {
  const title = String(payload.title || '').trim();
  if (!title) throw new ApiError('Title is required', 400, 'TITLE_REQUIRED');
  const slug = await uniqueSlug(Article, slugify(payload.slug || title));
  const status = ARTICLE_STATUSES.includes(payload.status) ? payload.status : 'draft';
  const article = await Article.create({
    title,
    slug,
    articleType: ARTICLE_TYPES.includes(payload.articleType || payload.type)
      ? payload.articleType || payload.type
      : 'Archive Essay',
    excerpt: payload.excerpt || '',
    heroImage: normalizeImage(payload.heroImage || payload.image, 'editorial'),
    sections: Array.isArray(payload.sections) ? payload.sections : [],
    relatedProducts: Array.isArray(payload.relatedProducts) ? payload.relatedProducts : [],
    domains: Array.isArray(payload.domains) ? payload.domains : [],
    status,
    featured: Boolean(payload.featured),
    byline: payload.byline || 'ArchiveX Editorial',
    publishedAt: status === 'approved' ? payload.publishedAt || new Date() : null,
    createdBy: actorId,
    updatedBy: actorId,
  });
  await recordAudit({
    actorId,
    action: 'article.create',
    entityType: 'article',
    entityId: article._id,
    summary: `Created article ${article.title}`,
  });
  return serializeAdminArticle(article);
}

export async function updateAdminArticle(actorId, id, payload = {}) {
  const article = await Article.findOne({ _id: asObjectId(id), deletedAt: null });
  if (!article) throw new ApiError('Article not found', 404, 'ARTICLE_NOT_FOUND');
  if (payload.title != null) article.title = String(payload.title).trim();
  if (payload.slug) article.slug = await uniqueSlug(Article, slugify(payload.slug), article._id);
  if (payload.articleType || payload.type) {
    const type = payload.articleType || payload.type;
    if (ARTICLE_TYPES.includes(type)) article.articleType = type;
  }
  if (payload.excerpt != null) article.excerpt = payload.excerpt;
  if (payload.heroImage !== undefined || payload.image !== undefined) {
    article.heroImage = normalizeImage(payload.heroImage || payload.image, 'editorial');
  }
  if (Array.isArray(payload.sections)) article.sections = payload.sections;
  if (Array.isArray(payload.relatedProducts)) article.relatedProducts = payload.relatedProducts;
  if (Array.isArray(payload.domains)) article.domains = payload.domains;
  if (payload.featured !== undefined) article.featured = Boolean(payload.featured);
  if (payload.byline != null) article.byline = payload.byline;
  if (payload.status) {
    if (!ARTICLE_STATUSES.includes(payload.status)) {
      throw new ApiError('Invalid status', 400, 'INVALID_STATUS');
    }
    article.status = payload.status;
    if (payload.status === 'approved' && !article.publishedAt) {
      article.publishedAt = new Date();
    }
  }
  article.updatedBy = actorId;
  await article.save();
  await recordAudit({
    actorId,
    action: 'article.update',
    entityType: 'article',
    entityId: article._id,
    summary: `Updated article ${article.title}`,
    meta: { status: article.status },
  });
  return serializeAdminArticle(article);
}

export async function deleteAdminArticle(actorId, id) {
  const article = await Article.findOne({ _id: asObjectId(id), deletedAt: null });
  if (!article) throw new ApiError('Article not found', 404, 'ARTICLE_NOT_FOUND');
  article.deletedAt = new Date();
  article.status = 'archived';
  article.updatedBy = actorId;
  await article.save();
  await recordAudit({
    actorId,
    action: 'article.delete',
    entityType: 'article',
    entityId: article._id,
    summary: `Soft-deleted article ${article.title}`,
  });
  return { id: String(article._id), deleted: true };
}

export async function listAdminUsers() {
  const rows = await User.find({ deletedAt: null }).sort({ createdAt: -1 }).lean();
  return rows.map(serializeAdminUser);
}

export async function createAdminUser(actorId, payload = {}) {
  const name = String(payload.name || '').trim();
  const email = String(payload.email || '').trim().toLowerCase();
  const password = String(payload.password || '');
  const role = USER_ROLES.includes(payload.role) ? payload.role : 'user';
  const status = USER_STATUSES.includes(payload.status) ? payload.status : 'active';

  if (name.length < 2) throw new ApiError('Name must be at least 2 characters', 400, 'VALIDATION_ERROR');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ApiError('A valid email is required', 400, 'VALIDATION_ERROR');
  }
  if (password.length < 8) {
    throw new ApiError('Password must be at least 8 characters', 400, 'VALIDATION_ERROR');
  }

  const existing = await User.findOne({ email });
  if (existing) throw new ApiError('Email is already registered', 409, 'EMAIL_IN_USE');

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    passwordHash,
    role,
    status,
    tokenVersion: 0,
  });

  await recordAudit({
    actorId,
    action: 'user.create',
    entityType: 'user',
    entityId: user._id,
    summary: `Created user ${user.email} (${role})`,
  });

  return serializeAdminUser(user);
}

export async function updateAdminUser(actorId, id, payload = {}) {
  const user = await User.findOne({ _id: asObjectId(id), deletedAt: null });
  if (!user) throw new ApiError('User not found', 404, 'USER_NOT_FOUND');
  if (payload.role) {
    if (!USER_ROLES.includes(payload.role)) {
      throw new ApiError('Invalid role', 400, 'INVALID_ROLE');
    }
    user.role = payload.role;
  }
  if (payload.status) {
    if (!USER_STATUSES.includes(payload.status)) {
      throw new ApiError('Invalid status', 400, 'INVALID_STATUS');
    }
    user.status = payload.status;
  }
  if (payload.name != null) user.name = String(payload.name).trim();
  await user.save();
  await recordAudit({
    actorId,
    action: 'user.update',
    entityType: 'user',
    entityId: user._id,
    summary: `Updated user ${user.email}`,
    meta: { role: user.role, status: user.status },
  });
  return serializeAdminUser(user);
}
