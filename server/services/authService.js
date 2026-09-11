import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import env from '../config/env.js';
import { USER_ROLES } from '../config/constants.js';
import { assertPasswordPolicy, hashPassword, verifyPasswordOrDummy } from '../utils/password.js';

const REFRESH_COOKIE = 'archivex_refresh';
const PASSWORD_SELECT = '+passwordHash';

export function serializeUser(user) {
  if (!user) return null;
  const plain = typeof user.toObject === 'function' ? user.toObject() : user;
  return {
    id: String(plain._id),
    name: plain.name,
    firstName: plain.firstName || '',
    lastName: plain.lastName || '',
    username: plain.username || '',
    email: plain.email,
    role: plain.role,
    status: plain.status,
    preferences: plain.preferences || { newsletter: false, locale: 'en' },
    createdAt: plain.createdAt,
  };
}

const USERNAME_PATTERN = /^[A-Za-z0-9._\-!@#$]{3,30}$/;

/** Trim only — case and allowed specials are preserved. */
export function normalizeUsername(value) {
  return String(value || '').trim();
}

export function usernameKey(value) {
  return normalizeUsername(value).toLowerCase();
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function findUserByUsername(username, { excludeId } = {}) {
  const key = usernameKey(username);
  if (!key) return null;
  const filter = {
    username: { $regex: new RegExp(`^${escapeRegex(key)}$`, 'i') },
    deletedAt: null,
  };
  if (excludeId) filter._id = { $ne: excludeId };
  return User.findOne(filter);
}

export function buildDisplayName(firstName, lastName) {
  return `${String(firstName || '').trim()} ${String(lastName || '').trim()}`.trim();
}

export async function allocateUsername(base) {
  const root = usernameKey(base)
    .replace(/[^a-z0-9._\-!@#$]/gi, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  let candidate = (root || 'collector').slice(0, 30);
  if (candidate.length < 3) candidate = `${candidate}xxx`.slice(0, 3);

  for (let i = 0; i < 50; i += 1) {
    const next = i === 0 ? candidate : `${candidate.slice(0, Math.max(1, 30 - String(i).length - 1))}_${i}`;
    const exists = await findUserByUsername(next);
    if (!exists) return next;
  }

  return `${candidate.slice(0, 20)}_${Date.now().toString(36)}`.slice(0, 30);
}

function signAccessToken(user) {
  return jwt.sign(
    {
      sub: String(user._id),
      role: user.role,
      type: 'access',
      ver: user.tokenVersion || 0,
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

export async function register({ firstName, lastName, username, email, password, name }) {
  const trimmedFirst = String(firstName || '').trim();
  const trimmedLast = String(lastName || '').trim();
  const trimmedUsername = normalizeUsername(username);
  const trimmedEmail = String(email || '').trim().toLowerCase();
  const rawPassword = String(password || '');
  const displayName = buildDisplayName(trimmedFirst, trimmedLast) || String(name || '').trim();

  if (trimmedFirst.length < 1) {
    throw new ApiError('First name is required', 400, 'VALIDATION_ERROR');
  }
  if (trimmedLast.length < 1) {
    throw new ApiError('Last name is required', 400, 'VALIDATION_ERROR');
  }
  if (!USERNAME_PATTERN.test(trimmedUsername)) {
    throw new ApiError(
      'Username must be 3–30 characters: letters, numbers, and . _ - ! @ # $',
      400,
      'VALIDATION_ERROR'
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    throw new ApiError('A valid email is required', 400, 'VALIDATION_ERROR');
  }
  assertPasswordPolicy(rawPassword);
  if (displayName.length < 2) {
    throw new ApiError('Name must be at least 2 characters', 400, 'VALIDATION_ERROR');
  }

  const existingEmail = await User.findOne({ email: trimmedEmail });
  if (existingEmail) {
    const staffRoles = ['admin', 'superadmin', 'moderator', 'editor'];
    if (staffRoles.includes(existingEmail.role)) {
      throw new ApiError(
        'That email belongs to a staff account. Use a different email for a collector account, or sign in at Admin.',
        409,
        'STAFF_EMAIL_IN_USE'
      );
    }
    throw new ApiError(
      'That email already has a collector account. Log in instead, or use a different email.',
      409,
      'EMAIL_IN_USE'
    );
  }

  const existingUsername = await findUserByUsername(trimmedUsername);
  if (existingUsername) {
    throw new ApiError('Username is already taken', 409, 'USERNAME_IN_USE');
  }

  const passwordHash = await hashPassword(rawPassword);
  const user = await User.create({
    name: displayName,
    firstName: trimmedFirst,
    lastName: trimmedLast,
    username: trimmedUsername,
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

const STAFF_ROLES = ['admin', 'superadmin', 'moderator', 'editor'];

export async function login({ email, password, staffOnly = false }) {
  const trimmedEmail = String(email || '').trim().toLowerCase();
  const rawPassword = String(password || '');

  // Always load hash (select:false) and always run bcrypt so timing / enumeration stay flat.
  const user = await User.findOne({ email: trimmedEmail }).select(PASSWORD_SELECT);
  const matches = await verifyPasswordOrDummy(rawPassword, user?.passwordHash);

  if (!user || !matches) {
    throw new ApiError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  assertActiveUser(user);

  if (staffOnly && !STAFF_ROLES.includes(user.role)) {
    throw new ApiError('Staff credentials required', 403, 'STAFF_REQUIRED');
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

export async function updateProfile(userId, payload = {}) {
  const user = await User.findById(userId);
  assertActiveUser(user);

  const nextFirst =
    payload.firstName != null ? String(payload.firstName).trim() : user.firstName || '';
  const nextLast =
    payload.lastName != null ? String(payload.lastName).trim() : user.lastName || '';
  const nextUsername =
    payload.username != null ? normalizeUsername(payload.username) : user.username || '';

  if (nextFirst.length < 1) {
    throw new ApiError('First name is required', 400, 'VALIDATION_ERROR');
  }
  if (nextLast.length < 1) {
    throw new ApiError('Last name is required', 400, 'VALIDATION_ERROR');
  }
  if (!USERNAME_PATTERN.test(nextUsername)) {
    throw new ApiError(
      'Username must be 3–30 characters: letters, numbers, and . _ - ! @ # $',
      400,
      'VALIDATION_ERROR'
    );
  }

  const taken = await findUserByUsername(nextUsername, { excludeId: user._id });
  if (taken) {
    throw new ApiError('Username is already taken', 409, 'USERNAME_IN_USE');
  }

  user.firstName = nextFirst;
  user.lastName = nextLast;
  user.username = nextUsername;
  user.name = buildDisplayName(nextFirst, nextLast);
  await user.save();

  return serializeUser(user);
}

export async function changeEmail(userId, { email, password } = {}) {
  const user = await User.findById(userId).select(PASSWORD_SELECT);
  assertActiveUser(user);

  const nextEmail = String(email || '')
    .trim()
    .toLowerCase();
  const rawPassword = String(password || '');

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail)) {
    throw new ApiError('A valid email is required', 400, 'VALIDATION_ERROR');
  }
  assertPasswordPolicy(rawPassword, { label: 'Current password' });

  const matches = await verifyPasswordOrDummy(rawPassword, user.passwordHash);
  if (!matches) {
    throw new ApiError('Invalid password', 401, 'INVALID_CREDENTIALS');
  }

  if (nextEmail === user.email) {
    return serializeUser(user);
  }

  const existing = await User.findOne({ email: nextEmail, deletedAt: null });
  if (existing) {
    throw new ApiError('Email is already registered', 409, 'EMAIL_IN_USE');
  }

  user.email = nextEmail;
  await user.save();
  return serializeUser(user);
}

export async function changePassword(userId, { currentPassword, newPassword } = {}) {
  const user = await User.findById(userId).select(PASSWORD_SELECT);
  assertActiveUser(user);

  const current = String(currentPassword || '');
  const next = String(newPassword || '');

  assertPasswordPolicy(current, { label: 'Current password' });
  assertPasswordPolicy(next, { label: 'New password' });
  if (current === next) {
    throw new ApiError('New password must be different', 400, 'VALIDATION_ERROR');
  }

  const matches = await verifyPasswordOrDummy(current, user.passwordHash);
  if (!matches) {
    throw new ApiError('Invalid password', 401, 'INVALID_CREDENTIALS');
  }

  user.passwordHash = await hashPassword(next);
  user.tokenVersion = (user.tokenVersion || 0) + 1;
  await user.save();

  return {
    user: serializeUser(user),
    accessToken: signAccessToken(user),
    refreshToken: signRefreshToken(user),
  };
}

/**
 * Two-step delete: client asks for confirmation, then sends username + password.
 * Soft-deletes collector accounts only (staff use Admin → Users).
 */
export async function deleteAccount(userId, { confirmUsername, password } = {}) {
  const user = await User.findById(userId).select(PASSWORD_SELECT);
  assertActiveUser(user);

  if (STAFF_ROLES.includes(user.role)) {
    throw new ApiError(
      'Staff accounts cannot be deleted here. Ask another admin.',
      403,
      'STAFF_DELETE_FORBIDDEN'
    );
  }

  const typed = normalizeUsername(confirmUsername);
  if (!typed || usernameKey(typed) !== usernameKey(user.username || '')) {
    throw new ApiError('Type your exact username to confirm deletion', 400, 'CONFIRM_USERNAME');
  }

  const rawPassword = String(password || '');
  assertPasswordPolicy(rawPassword, { label: 'Password' });

  const matches = await verifyPasswordOrDummy(rawPassword, user.passwordHash);
  if (!matches) {
    throw new ApiError('Invalid password', 401, 'INVALID_CREDENTIALS');
  }

  user.deletedAt = new Date();
  user.status = 'disabled';
  user.tokenVersion = (user.tokenVersion || 0) + 1;
  await user.save();

  return { ok: true };
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
