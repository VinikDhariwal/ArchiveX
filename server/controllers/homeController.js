import asyncHandler from '../utils/asyncHandler.js';
import { successResponse } from '../utils/response.js';
import * as homeService from '../services/homeService.js';

export const getPublicHome = asyncHandler(async (_req, res) => {
  const data = await homeService.getPublicHome();
  return successResponse(res, data);
});

export const getAdminHome = asyncHandler(async (_req, res) => {
  const data = await homeService.getAdminHome();
  return successResponse(res, data);
});

export const updateAdminHome = asyncHandler(async (req, res) => {
  const actorId = req.auth?.sub || req.user?._id;
  const data = await homeService.updateAdminHome(actorId, req.body || {});
  return successResponse(res, data);
});
