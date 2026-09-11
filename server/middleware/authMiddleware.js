import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import * as authService from '../services/authService.js';
import { User } from '../models/index.js';

/**
 * Verify the bearer token AND revalidate the account against the database so
 * that logout, password changes, account disabling, and soft deletes revoke
 * access immediately instead of waiting for the access token to expire.
 */
async function resolveAuthenticatedUser(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  const payload = authService.verifyAccessToken(token);

  const user = await User.findById(payload.sub).select('role status deletedAt tokenVersion');
  if (!user || user.deletedAt || user.status !== 'active') {
    throw new ApiError('Authentication required', 401, 'UNAUTHORIZED');
  }
  if ((user.tokenVersion || 0) !== (payload.ver || 0)) {
    throw new ApiError('Session expired', 401, 'TOKEN_REVOKED');
  }

  return { payload, user };
}

export const requireAuth = asyncHandler(async (req, _res, next) => {
  const { payload, user } = await resolveAuthenticatedUser(req);
  req.auth = payload;
  req.user = user;
  return next();
});

export const optionalAuth = asyncHandler(async (req, _res, next) => {
  try {
    const header = req.headers.authorization || '';
    if (header.startsWith('Bearer ')) {
      const { payload, user } = await resolveAuthenticatedUser(req);
      req.auth = payload;
      req.user = user;
    }
  } catch {
    req.auth = undefined;
    req.user = undefined;
  }
  return next();
});

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
