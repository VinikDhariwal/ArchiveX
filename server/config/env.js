import {
  APP_NAME,
  API_NAME,
  API_SERVICE_ID,
  API_VERSION,
  SUPPORTED_PRODUCT_TYPES,
} from './constants.js';

const isProduction = (process.env.NODE_ENV || 'development') === 'production';

function requiredInProduction(name, value) {
  if (isProduction && (!value || !String(value).trim())) {
    throw new Error(`[env] ${name} is required in production`);
  }
  return value;
}

function parseOrigins(raw, fallback) {
  const source = raw && String(raw).trim() ? raw : fallback;
  return String(source || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function assertSecret(name, value) {
  const secret = requiredInProduction(name, value);
  if (isProduction && String(secret).length < 32) {
    throw new Error(`[env] ${name} must be at least 32 characters in production`);
  }
  return secret;
}

const clientOrigins = parseOrigins(
  process.env.CLIENT_ORIGIN,
  isProduction ? '' : 'http://localhost:5173'
);

if (isProduction && !clientOrigins.length) {
  throw new Error('[env] CLIENT_ORIGIN is required in production');
}

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction,
  port: Number(process.env.PORT) || 5001,
  clientOrigin: clientOrigins[0] || 'http://localhost:5173',
  clientOrigins,
  trustProxy: process.env.TRUST_PROXY === '1' || process.env.TRUST_PROXY === 'true',
  mongodbUri: process.env.MONGODB_URI || '',
  mongodbDbName: process.env.MONGODB_DB_NAME || 'archivex',
  jwtAccessSecret: assertSecret(
    'JWT_ACCESS_SECRET',
    process.env.JWT_ACCESS_SECRET || 'dev-access-secret-change-me'
  ),
  jwtRefreshSecret: assertSecret(
    'JWT_REFRESH_SECRET',
    process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-me'
  ),
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  publicOrigin: process.env.PUBLIC_ORIGIN || `http://localhost:${Number(process.env.PORT) || 5001}`,
  mediaMaxBytes: Number(process.env.MEDIA_MAX_BYTES) || 5 * 1024 * 1024,
  bcryptSaltRounds: Math.min(15, Math.max(10, Number(process.env.BCRYPT_SALT_ROUNDS) || 12)),
  rateLimitApiMax: Number(process.env.RATE_LIMIT_API_MAX) || 300,
  rateLimitAuthMax: Number(process.env.RATE_LIMIT_AUTH_MAX) || 40,
  appName: APP_NAME,
  apiName: API_NAME,
  apiServiceId: API_SERVICE_ID,
  apiVersion: API_VERSION,
  supportedProductTypes: SUPPORTED_PRODUCT_TYPES,
};

export default env;
