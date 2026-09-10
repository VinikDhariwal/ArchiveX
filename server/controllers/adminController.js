import asyncHandler from '../utils/asyncHandler.js';
import { successResponse } from '../utils/response.js';
import * as adminService from '../services/adminService.js';
import { listAuditLogs } from '../services/auditService.js';

const actorId = (req) => req.auth?.sub || req.user?._id;

export const getOverview = asyncHandler(async (_req, res) => {
  const data = await adminService.getAdminOverview();
  return successResponse(res, data);
});

export const listProducts = asyncHandler(async (req, res) => {
  const { items, meta } = await adminService.listAdminProducts(req.query);
  return successResponse(res, items, meta);
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await adminService.getAdminProduct(req.params.id);
  return successResponse(res, product);
});

export const createProduct = asyncHandler(async (req, res) => {
  const product = await adminService.createAdminProduct(actorId(req), req.body);
  return successResponse(res, product, undefined, 201);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await adminService.updateAdminProduct(actorId(req), req.params.id, req.body);
  return successResponse(res, product);
});

export const setProductStatus = asyncHandler(async (req, res) => {
  const product = await adminService.setAdminProductStatus(
    actorId(req),
    req.params.id,
    req.body?.status
  );
  return successResponse(res, product);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const result = await adminService.deleteAdminProduct(actorId(req), req.params.id);
  return successResponse(res, result);
});

export const listBrands = asyncHandler(async (req, res) => {
  const brands = await adminService.listAdminBrands(req.query);
  return successResponse(res, brands);
});

export const createBrand = asyncHandler(async (req, res) => {
  const brand = await adminService.createAdminBrand(actorId(req), req.body);
  return successResponse(res, brand, undefined, 201);
});

export const updateBrand = asyncHandler(async (req, res) => {
  const brand = await adminService.updateAdminBrand(actorId(req), req.params.id, req.body);
  return successResponse(res, brand);
});

export const deleteBrand = asyncHandler(async (req, res) => {
  const result = await adminService.deleteAdminBrand(actorId(req), req.params.id);
  return successResponse(res, result);
});

export const listCategories = asyncHandler(async (req, res) => {
  const categories = await adminService.listAdminCategories(req.query);
  return successResponse(res, categories);
});

export const createCategory = asyncHandler(async (req, res) => {
  const category = await adminService.createAdminCategory(actorId(req), req.body);
  return successResponse(res, category, undefined, 201);
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await adminService.updateAdminCategory(actorId(req), req.params.id, req.body);
  return successResponse(res, category);
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const result = await adminService.deleteAdminCategory(actorId(req), req.params.id);
  return successResponse(res, result);
});

export const listArticles = asyncHandler(async (req, res) => {
  const articles = await adminService.listAdminArticles(req.query);
  return successResponse(res, articles);
});

export const getArticle = asyncHandler(async (req, res) => {
  const article = await adminService.getAdminArticle(req.params.id);
  return successResponse(res, article);
});

export const createArticle = asyncHandler(async (req, res) => {
  const article = await adminService.createAdminArticle(actorId(req), req.body);
  return successResponse(res, article, undefined, 201);
});

export const updateArticle = asyncHandler(async (req, res) => {
  const article = await adminService.updateAdminArticle(actorId(req), req.params.id, req.body);
  return successResponse(res, article);
});

export const deleteArticle = asyncHandler(async (req, res) => {
  const result = await adminService.deleteAdminArticle(actorId(req), req.params.id);
  return successResponse(res, result);
});

export const listUsers = asyncHandler(async (_req, res) => {
  const users = await adminService.listAdminUsers();
  return successResponse(res, users);
});

export const createUser = asyncHandler(async (req, res) => {
  const user = await adminService.createAdminUser(actorId(req), req.body);
  return successResponse(res, user, undefined, 201);
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await adminService.updateAdminUser(actorId(req), req.params.id, req.body);
  return successResponse(res, user);
});

export const listAudit = asyncHandler(async (req, res) => {
  const logs = await listAuditLogs({ limit: req.query.limit });
  return successResponse(res, logs, { total: logs.length });
});
