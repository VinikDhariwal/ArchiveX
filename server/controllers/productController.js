import asyncHandler from '../utils/asyncHandler.js';
import { successResponse } from '../utils/response.js';
import * as productService from '../services/productService.js';

export const listProducts = asyncHandler(async (req, res) => {
  const { products, meta } = await productService.listPublicProducts(req.query);
  return successResponse(res, products, meta);
});

export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await productService.getPublicProductBySlug(req.params.slug);
  return successResponse(res, product);
});
