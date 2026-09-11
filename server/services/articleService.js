import mongoose from 'mongoose';
import { Article, Product } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import { serializeProduct } from './productService.js';
import { ARTICLE_TYPES, SUPPORTED_PRODUCT_TYPES } from '../config/constants.js';

const PUBLIC_FILTER = {
  status: 'approved',
  deletedAt: null,
};

const PRODUCT_PUBLIC_FILTER = {
  status: 'approved',
  deletedAt: null,
};

function serializeImage(image) {
  if (!image?.url) return null;
  return {
    url: image.url,
    alt: image.alt || '',
    type: image.type || 'editorial',
    width: image.width ?? null,
    height: image.height ?? null,
  };
}

export function serializeArticleCard(doc) {
  if (!doc) return null;
  const plain = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  return {
    id: String(plain._id),
    slug: plain.slug,
    type: plain.articleType,
    title: plain.title,
    excerpt: plain.excerpt || '',
    image: serializeImage(plain.heroImage),
    domains: plain.domains || [],
    featured: Boolean(plain.featured),
    publishedAt: plain.publishedAt ? new Date(plain.publishedAt).toISOString() : null,
    byline: plain.byline || 'ArchiveX Editorial',
    publisher: plain.publisher || 'ArchiveX',
  };
}

export function serializeArticleDetail(doc, relatedProducts = []) {
  const card = serializeArticleCard(doc);
  if (!card) return null;
  const plain = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  return {
    ...card,
    sections: (plain.sections || []).map((section) => ({
      heading: section.heading || '',
      body: section.body || '',
    })),
    relatedProducts,
  };
}

export async function listPublicArticles(query = {}) {
  const filter = { ...PUBLIC_FILTER };
  const type = String(query.type || '').trim();
  if (type) {
    if (!ARTICLE_TYPES.includes(type)) {
      throw new ApiError('Invalid article type', 400, 'INVALID_ARTICLE_TYPE');
    }
    filter.articleType = type;
  }
  const domain = String(query.domain || '').trim();
  if (domain) {
    if (!SUPPORTED_PRODUCT_TYPES.includes(domain)) {
      throw new ApiError('Invalid domain', 400, 'INVALID_DOMAIN');
    }
    filter.domains = domain;
  }
  if (query.featured === 'true' || query.featured === true) filter.featured = true;

  const limit = Math.min(Math.max(Number(query.limit) || 24, 1), 48);

  const articles = await Article.find(filter)
    .sort({ featured: -1, publishedAt: -1, createdAt: -1 })
    .limit(limit)
    .lean();

  return {
    articles: articles.map(serializeArticleCard),
    meta: { total: articles.length, limit },
  };
}

export async function getPublicArticleBySlug(slug) {
  const article = await Article.findOne({ ...PUBLIC_FILTER, slug }).lean();
  if (!article) {
    throw new ApiError('Article not found', 404, 'ARTICLE_NOT_FOUND');
  }

  const productIds = (article.relatedProducts || []).filter((id) =>
    mongoose.isValidObjectId(id)
  );

  let relatedProducts = [];
  if (productIds.length) {
    const products = await Product.find({
      _id: { $in: productIds },
      ...PRODUCT_PUBLIC_FILTER,
    })
      .populate('brand', 'name slug')
      .populate('category', 'name slug productType')
      .lean();

    const byId = new Map(products.map((item) => [String(item._id), item]));
    relatedProducts = productIds
      .map((id) => byId.get(String(id)))
      .filter(Boolean)
      .map(serializeProduct);
  }

  return serializeArticleDetail(article, relatedProducts);
}

/**
 * Approved journal essays linked to a public product.
 */
export async function getProductJournal(productId) {
  if (!mongoose.isValidObjectId(productId)) {
    throw new ApiError('Invalid product id', 400, 'INVALID_PRODUCT_ID');
  }

  const exists = await Product.exists({ _id: productId, ...PRODUCT_PUBLIC_FILTER });
  if (!exists) {
    throw new ApiError('Product not found', 404, 'PRODUCT_NOT_FOUND');
  }

  const articles = await Article.find({
    ...PUBLIC_FILTER,
    relatedProducts: productId,
  })
    .sort({ publishedAt: -1, createdAt: -1 })
    .lean();

  const items = articles.map(serializeArticleCard);
  return {
    items,
    meta: {
      total: items.length,
      note: items.length
        ? undefined
        : 'No journal essays are linked to this object yet.',
    },
  };
}
