import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import env from '../config/env.js';
import { USER_ROLES } from '../config/constants.js';

const SALT_ROUNDS = 10;
const REFRESH_COOKIE = 'archivex_refresh';

export function serializeUser(user) {
  if (!user) return null;
  const plain = typeof user.toObject === 'function' ? user.toObject() : user;
  return {
    id: String(plain._id),
    name: plain.name,
    email: plain.email,
    role: plain.role,
    status: plain.status,
    preferences: plain.preferences || { newsletter: false, locale: 'en' },
    createdAt: plain.createdAt,
  };
}

function signAccessToken(user) {
  return jwt.sign(
    {
      sub: String(user._id),
      role: user.role,
      type: 'access',
    },
    env.jwtAccessSecret,
    { expiresIn: env.jwtAccessExpiresIn }
  );
}

function signRefreshToken(user) {
  return jwt.sign(
    {
      sub: String(user._id),
      role: user.role,
      type: 'refresh',
      ver: user.tokenVersion || 0,
    },
    env.jwtRefreshSecret,
    { expiresIn: env.jwtRefreshExpiresIn }
  );
}

export function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: `/api/${env.apiVersion}/auth`,
  });
}

export function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: 'lax',
    path: `/api/${env.apiVersion}/auth`,
  });
}

export function getRefreshCookieName() {
  return REFRESH_COOKIE;
}

function assertActiveUser(user) {
  if (!user || user.deletedAt) {
    throw new ApiError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }
  if (user.status !== 'active') {
    throw new ApiError('Account is not active', 403, 'ACCOUNT_INACTIVE');
  }
}

export async function register({ name, email, password }) {
  const trimmedName = String(name || '').trim();
  const trimmedEmail = String(email || '').trim().toLowerCase();
  const rawPassword = String(password || '');

  if (trimmedName.length < 2) {
    throw new ApiError('Name must be at least 2 characters', 400, 'VALIDATION_ERROR');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    throw new ApiError('A valid email is required', 400, 'VALIDATION_ERROR');
  }
  if (rawPassword.length < 8) {
    throw new ApiError('Password must be at least 8 characters', 400, 'VALIDATION_ERROR');
  }

  const existing = await User.findOne({ email: trimmedEmail });
  if (existing) {
    throw new ApiError('Email is already registered', 409, 'EMAIL_IN_USE');
  }

  const passwordHash = await bcrypt.hash(rawPassword, SALT_ROUNDS);
  const user = await User.create({
    name: trimmedName,
    email: trimmedEmail,
    passwordHash,
    role: 'user',
    status: 'active',
    tokenVersion: 0,
  });

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  return {
    user: serializeUser(user),
    accessToken,
    refreshToken,
  };
}

export async function login({ email, password }) {
  const trimmedEmail = String(email || '').trim().toLowerCase();
  const rawPassword = String(password || '');

  const user = await User.findOne({ email: trimmedEmail });
  if (!user) {
    throw new ApiError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  assertActiveUser(user);

  const matches = await bcrypt.compare(rawPassword, user.passwordHash);
  if (!matches) {
    throw new ApiError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  return {
    user: serializeUser(user),
    accessToken,
    refreshToken,
  };
}

export async function refresh(refreshToken) {
  if (!refreshToken) {
    throw new ApiError('Refresh token required', 401, 'REFRESH_REQUIRED');
  }

  let payload;
  try {
    payload = jwt.verify(refreshToken, env.jwtRefreshSecret);
  } catch {
    throw new ApiError('Invalid refresh token', 401, 'INVALID_REFRESH');
  }

  if (payload.type !== 'refresh') {
    throw new ApiError('Invalid refresh token', 401, 'INVALID_REFRESH');
  }

  const user = await User.findById(payload.sub);
  assertActiveUser(user);

  if ((user.tokenVersion || 0) !== (payload.ver || 0)) {
    throw new ApiError('Refresh token revoked', 401, 'REFRESH_REVOKED');
  }

  return {
    user: serializeUser(user),
    accessToken: signAccessToken(user),
    refreshToken: signRefreshToken(user),
  };
}

export async function logout(userId) {
  if (!userId) return;
  await User.findByIdAndUpdate(userId, { $inc: { tokenVersion: 1 } });
}

export async function getMe(userId) {
  const user = await User.findById(userId);
  assertActiveUser(user);
  return serializeUser(user);
}

export function verifyAccessToken(token) {
  if (!token) {
    throw new ApiError('Authentication required', 401, 'UNAUTHORIZED');
  }
  try {
    const payload = jwt.verify(token, env.jwtAccessSecret);
    if (payload.type !== 'access') {
      throw new ApiError('Authentication required', 401, 'UNAUTHORIZED');
    }
    return payload;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Authentication required', 401, 'UNAUTHORIZED');
  }
}

export function assertRole(userRole, allowedRoles = []) {
  if (!allowedRoles.length) return;
  if (!USER_ROLES.includes(userRole) || !allowedRoles.includes(userRole)) {
    throw new ApiError('Forbidden', 403, 'FORBIDDEN');
  }
}
