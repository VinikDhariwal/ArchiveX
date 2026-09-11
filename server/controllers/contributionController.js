import asyncHandler from '../utils/asyncHandler.js';
import { successResponse } from '../utils/response.js';
import * as contributionService from '../services/contributionService.js';

export const createProduct = asyncHandler(async (req, res) => {
  const product = await contributionService.createContribution(req.auth.sub, req.body);
  return successResponse(res, { product }, undefined, 201);
});

export const listMine = asyncHandler(async (req, res) => {
  const products = await contributionService.listMyContributions(req.auth.sub);
  return successResponse(res, products, { total: products.length });
});

export const getMine = asyncHandler(async (req, res) => {
  const product = await contributionService.getMyContribution(req.auth.sub, req.params.id);
  return successResponse(res, { product });
});

export const updateMine = asyncHandler(async (req, res) => {
  const product = await contributionService.updateMyContribution(
    req.auth.sub,
    req.params.id,
    req.body
  );
  return successResponse(res, { product });
});

export const withdrawMine = asyncHandler(async (req, res) => {
  const result = await contributionService.withdrawMyContribution(req.auth.sub, req.params.id);
  return successResponse(res, result);
});
