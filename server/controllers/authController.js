import asyncHandler from '../utils/asyncHandler.js';
import { successResponse } from '../utils/response.js';
import * as authService from '../services/authService.js';

export const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  authService.setRefreshCookie(res, result.refreshToken);
  return successResponse(
    res,
    { user: result.user, accessToken: result.accessToken },
    undefined,
    201
  );
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  authService.setRefreshCookie(res, result.refreshToken);
  return successResponse(res, { user: result.user, accessToken: result.accessToken });
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.[authService.getRefreshCookieName()];
  const result = await authService.refresh(token);
  authService.setRefreshCookie(res, result.refreshToken);
  return successResponse(res, { user: result.user, accessToken: result.accessToken });
});

export const logout = asyncHandler(async (req, res) => {
  if (req.auth?.sub) {
    await authService.logout(req.auth.sub);
  }
  authService.clearRefreshCookie(res);
  return successResponse(res, { ok: true });
});

export const me = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.auth.sub);
  return successResponse(res, { user });
});
