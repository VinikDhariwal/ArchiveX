import asyncHandler from '../utils/asyncHandler.js';
import { successResponse } from '../utils/response.js';
import * as articleService from '../services/articleService.js';

export const listArticles = asyncHandler(async (req, res) => {
  const { articles, meta } = await articleService.listPublicArticles(req.query);
  return successResponse(res, articles, meta);
});

export const getArticleBySlug = asyncHandler(async (req, res) => {
  const article = await articleService.getPublicArticleBySlug(req.params.slug);
  return successResponse(res, article);
});
