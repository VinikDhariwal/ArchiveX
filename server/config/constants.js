import dotenv from 'dotenv';

dotenv.config();

/**
 * Shared application constants.
 * Runtime-tunable values belong in env / process.env.
 * Domain metadata lives here once so it is not duplicated inline across routes.
 */
export const APP_NAME = process.env.APP_NAME || 'ArchiveX';
export const API_NAME = process.env.API_NAME || 'ArchiveX API';
export const API_SERVICE_ID = process.env.API_SERVICE_ID || 'archivex-api';
export const API_VERSION = process.env.API_VERSION || 'v1';

/** Launch product types — extend via config, not scattered literals. */
export const PRIMARY_PRODUCT_TYPES = Object.freeze(['car', 'motorcycle']);
export const SECONDARY_PRODUCT_TYPES = Object.freeze(['watch']);
export const SUPPORTED_PRODUCT_TYPES = Object.freeze([
  ...PRIMARY_PRODUCT_TYPES,
  ...SECONDARY_PRODUCT_TYPES,
]);

export const FUTURE_PRODUCT_TYPES = Object.freeze([
  'jet',
  'helicopter',
  'yacht',
  'bag',
  'fashion',
  'jewellery',
  'art',
  'audio',
  'furniture',
  'collectible',
]);
