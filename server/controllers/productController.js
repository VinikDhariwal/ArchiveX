import asyncHandler from '../utils/asyncHandler.js';
import { successResponse } from '../utils/response.js';
import * as productService from '../services/productService.js';
import * as recommendationService from '../services/recommendationService.js';

export const listProducts = asyncHandler(async (req, res) => {
  const { products, meta } = await productService.listPublicProducts(req.query);
  return successResponse(res, products, meta);
});

export const getProductFilters = asyncHandler(async (req, res) => {
  const schema = productService.getPublicFilterSchema(req.query);
  return successResponse(res, schema);
});

export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await productService.getPublicProductBySlug(req.params.slug);
  return successResponse(res, product);
});

export const recordProductView = asyncHandler(async (req, res) => {
  const result = await productService.recordProductView(req.params.id, {
    sessionKey: req.body?.sessionKey || req.headers['x-session-key'],
    userId: req.auth?.sub || req.user?.id || null,
    source: req.body?.source || 'detail',
    userAgent: req.get('user-agent') || '',
  });
  return successResponse(res, result, null, 201);
});

export const getRelatedProducts = asyncHandler(async (req, res) => {
  const products = await recommendationService.getRelatedProducts(req.params.id, {
    limit: req.query.limit,
  });
  return successResponse(res, products, { total: products.length });
});

export const getRecommendedProducts = asyncHandler(async (req, res) => {
  const products = await recommendationService.getRecommendedProducts({
    limit: req.query.limit,
    productType: req.query.productType || req.query.domain,
  });
  return successResponse(res, products, { total: products.length });
});

export const getProductJournal = asyncHandler(async (req, res) => {
  const payload = await recommendationService.getProductJournal(req.params.id);
  return successResponse(res, payload.items, payload.meta);
});

export const getRecentlyViewed = asyncHandler(async (req, res) => {
  const products = await productService.listRecentlyViewed({
    userId: req.auth?.sub || null,
    sessionKey: req.query.sessionKey || req.headers['x-session-key'],
    limit: req.query.limit,
  });
  return successResponse(res, products, { total: products.length });
});
