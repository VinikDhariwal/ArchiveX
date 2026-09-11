import rateLimit from 'express-rate-limit';
import env from '../config/env.js';

function rateLimitEnabled() {
  if (process.env.RATE_LIMIT_ENABLED === 'false') return false;
  if (process.env.RATE_LIMIT_ENABLED === 'true') return true;
  return env.nodeEnv !== 'test';
}

function authMax() {
  const fromEnv = Number(process.env.RATE_LIMIT_AUTH_MAX);
  if (Number.isFinite(fromEnv) && fromEnv > 0) return fromEnv;
  return env.rateLimitAuthMax;
}

function apiMax() {
  const fromEnv = Number(process.env.RATE_LIMIT_API_MAX);
  if (Number.isFinite(fromEnv) && fromEnv > 0) return fromEnv;
  return env.rateLimitApiMax;
}

function rateLimitHandler(_req, res) {
  return res.status(429).json({
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many requests. Please wait and try again.',
    },
    requestId: _req.requestId || undefined,
  });
}

/** Broad API ceiling — protects Atlas / compute from abuse. */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: () => apiMax(),
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => !rateLimitEnabled(),
  handler: rateLimitHandler,
});

/** Stricter ceiling on login / register / refresh (credential stuffing). */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: () => authMax(),
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => !rateLimitEnabled(),
  handler: rateLimitHandler,
});

export default apiRateLimiter;
