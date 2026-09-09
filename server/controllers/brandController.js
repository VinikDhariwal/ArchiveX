import asyncHandler from '../utils/asyncHandler.js';
import { successResponse } from '../utils/response.js';
import * as brandService from '../services/brandService.js';

export const listBrands = asyncHandler(async (req, res) => {
  const brands = await brandService.listPublicBrands(req.query);
  return successResponse(res, brands);
});

export const getBrandBySlug = asyncHandler(async (req, res) => {
  const brand = await brandService.getPublicBrandBySlug(req.params.slug);
  return successResponse(res, brand);
});
