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

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction,
  port: Number(process.env.PORT) || 5001,
  clientOrigin: requiredInProduction(
    'CLIENT_ORIGIN',
    process.env.CLIENT_ORIGIN || (isProduction ? '' : 'http://localhost:5173')
  ),
  mongodbUri: process.env.MONGODB_URI || '',
  mongodbDbName: process.env.MONGODB_DB_NAME || 'archivex',
  jwtAccessSecret: requiredInProduction(
    'JWT_ACCESS_SECRET',
    process.env.JWT_ACCESS_SECRET || 'dev-access-secret-change-me'
  ),
  jwtRefreshSecret: requiredInProduction(
    'JWT_REFRESH_SECRET',
    process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-me'
  ),
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  publicOrigin: process.env.PUBLIC_ORIGIN || `http://localhost:${Number(process.env.PORT) || 5001}`,
  mediaUploadDir: process.env.MEDIA_UPLOAD_DIR || 'uploads',
  mediaPublicPath: process.env.MEDIA_PUBLIC_PATH || '/media',
  mediaMaxBytes: Number(process.env.MEDIA_MAX_BYTES) || 5 * 1024 * 1024,
  appName: APP_NAME,
  apiName: API_NAME,
  apiServiceId: API_SERVICE_ID,
  apiVersion: API_VERSION,
  supportedProductTypes: SUPPORTED_PRODUCT_TYPES,
};

export default env;
