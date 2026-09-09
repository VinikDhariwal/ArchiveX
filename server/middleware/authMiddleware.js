import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import * as authService from '../services/authService.js';
import { User } from '../models/index.js';

export function requireAuth(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const [, token] = header.startsWith('Bearer ') ? header.split(' ') : [null, null];
    const payload = authService.verifyAccessToken(token);
    req.auth = payload;
    return next();
  } catch (error) {
    return next(error);
  }
}

export function optionalAuth(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    if (header.startsWith('Bearer ')) {
      const token = header.slice(7);
      req.auth = authService.verifyAccessToken(token);
    }
  } catch {
    req.auth = undefined;
  }
  return next();
}

export function requireRoles(...roles) {
  return asyncHandler(async (req, _res, next) => {
    if (!req.auth?.sub) {
      throw new ApiError('Authentication required', 401, 'UNAUTHORIZED');
    }

    const user = await User.findById(req.auth.sub).select('role status deletedAt');
    if (!user || user.deletedAt || user.status !== 'active') {
      throw new ApiError('Authentication required', 401, 'UNAUTHORIZED');
    }

    authService.assertRole(user.role, roles);
    req.user = user;
    return next();
  });
}
