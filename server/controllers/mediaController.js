import asyncHandler from '../utils/asyncHandler.js';
import { successResponse } from '../utils/response.js';
import * as mediaService from '../services/mediaService.js';

const actorId = (req) => req.auth?.sub || req.user?._id;

export const listMedia = asyncHandler(async (req, res) => {
  const items = await mediaService.listMediaAssets(req.query);
  return successResponse(res, items, { total: items.length });
});

export const uploadMedia = asyncHandler(async (req, res) => {
  const asset = await mediaService.createMediaFromUpload(actorId(req), req.file, req.body);
  return successResponse(res, asset, undefined, 201);
});

export const registerMediaUrl = asyncHandler(async (req, res) => {
  const asset = await mediaService.createMediaFromUrl(actorId(req), req.body);
  return successResponse(res, asset, undefined, 201);
});

export const deleteMedia = asyncHandler(async (req, res) => {
  const result = await mediaService.deleteMediaAsset(actorId(req), req.params.id);
  return successResponse(res, result);
});
