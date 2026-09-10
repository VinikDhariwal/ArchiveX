import asyncHandler from '../utils/asyncHandler.js';
import { successResponse } from '../utils/response.js';
import ApiError from '../utils/ApiError.js';
import * as collectionService from '../services/collectionService.js';

function userId(req) {
  const id = req.auth?.sub;
  if (!id) throw new ApiError('Authentication required', 401, 'UNAUTHORIZED');
  return id;
}

export const listCollections = asyncHandler(async (req, res) => {
  const collections = await collectionService.listCollections(userId(req));
  return successResponse(res, collections, { total: collections.length });
});

export const createCollection = asyncHandler(async (req, res) => {
  const collection = await collectionService.createCollection(userId(req), req.body || {});
  return successResponse(res, collection, null, 201);
});

export const getCollection = asyncHandler(async (req, res) => {
  const collection = await collectionService.getCollection(userId(req), req.params.id);
  return successResponse(res, collection);
});

export const updateCollection = asyncHandler(async (req, res) => {
  const collection = await collectionService.updateCollection(
    userId(req),
    req.params.id,
    req.body || {}
  );
  return successResponse(res, collection);
});

export const deleteCollection = asyncHandler(async (req, res) => {
  const result = await collectionService.deleteCollection(userId(req), req.params.id);
  return successResponse(res, result);
});

export const addProductToCollection = asyncHandler(async (req, res) => {
  const collection = await collectionService.addProductToCollection(
    userId(req),
    req.params.id,
    req.params.productId
  );
  return successResponse(res, collection);
});

export const removeProductFromCollection = asyncHandler(async (req, res) => {
  const collection = await collectionService.removeProductFromCollection(
    userId(req),
    req.params.id,
    req.params.productId
  );
  return successResponse(res, collection);
});
