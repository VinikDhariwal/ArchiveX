import asyncHandler from '../utils/asyncHandler.js';
import { successResponse } from '../utils/response.js';
import * as categoryService from '../services/categoryService.js';

export const listCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.listPublicCategories(req.query);
  return successResponse(res, categories);
});

export const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await categoryService.getPublicCategoryBySlug(req.params.slug);
  return successResponse(res, category);
});
