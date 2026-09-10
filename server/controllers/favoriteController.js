import asyncHandler from '../utils/asyncHandler.js';
import { successResponse } from '../utils/response.js';
import ApiError from '../utils/ApiError.js';
import * as favoriteService from '../services/favoriteService.js';

function userId(req) {
  const id = req.auth?.sub;
  if (!id) throw new ApiError('Authentication required', 401, 'UNAUTHORIZED');
  return id;
}

export const listFavorites = asyncHandler(async (req, res) => {
  const favorites = await favoriteService.listFavorites(userId(req));
  return successResponse(res, favorites, { total: favorites.length });
});

export const addFavorite = asyncHandler(async (req, res) => {
  const result = await favoriteService.addFavorite(userId(req), req.params.productId);
  return successResponse(res, result, null, 201);
});

export const removeFavorite = asyncHandler(async (req, res) => {
  const result = await favoriteService.removeFavorite(userId(req), req.params.productId);
  return successResponse(res, result);
});
