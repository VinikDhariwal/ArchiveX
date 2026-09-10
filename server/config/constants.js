import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

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

/** All known product types (V1 + reserved future). */
export const ALL_PRODUCT_TYPES = Object.freeze([
  ...SUPPORTED_PRODUCT_TYPES,
  ...FUTURE_PRODUCT_TYPES,
]);

export const USER_ROLES = Object.freeze([
  'user',
  'editor',
  'moderator',
  'admin',
  'superadmin',
]);

export const USER_STATUSES = Object.freeze(['active', 'disabled', 'pending']);

/**
 * Product status doubles as contribution moderation gate.
 * Seeds / operator content use `approved`. Contributor submissions start `pending`.
 * Public surfaces (Phase 5+) must only expose approved + non-deleted products.
 */
export const PRODUCT_STATUSES = Object.freeze([
  'pending',
  'approved',
  'rejected',
  'draft',
  'archived',
]);

/**
 * Article publish statuses mirror product moderation so public journal
 * surfaces only expose approved, non-deleted essays.
 */
export const ARTICLE_STATUSES = PRODUCT_STATUSES;

export const ARTICLE_TYPES = Object.freeze([
  'Archive Essay',
  'Model History',
  'Design Study',
  'Collector Note',
]);

export const CATALOG_STATUSES = Object.freeze(['active', 'inactive']);

export const IMAGE_TYPES = Object.freeze([
  'hero',
  'gallery',
  'detail',
  'editorial',
  'dial',
  'other',
]);

export const AVAILABILITY_VALUES = Object.freeze([
  'unknown',
  'museum',
  'private',
  'auction',
  'production',
  'discontinued',
]);

export const RARITY_VALUES = Object.freeze([
  'COMMON',
  'COLLECTIBLE',
  'RARE',
  'ICONIC',
  'ULTRA-RARE',
  'UNIQUE',
]);

/** Specification domain labels used inside Product.specifications.domain */
export const SPEC_DOMAINS = Object.freeze({
  car: 'automotive',
  motorcycle: 'automotive',
  watch: 'watch',
});

/** Controlled specification field keys per productType — no cross-domain leakage. */
export const SPEC_FIELDS_BY_TYPE = Object.freeze({
  car: Object.freeze([
    'engine',
    'engineDisplacement',
    'aspiration',
    'cylinders',
    'power',
    'torque',
    'transmission',
    'drivetrain',
    'fuelType',
    'zeroToHundred',
    'topSpeed',
    'weight',
    'productionUnits',
    'bodyStyle',
    'modelGeneration',
    'productionPeriod',
  ]),
  motorcycle: Object.freeze([
    'engine',
    'displacement',
    'cylinders',
    'power',
    'torque',
    'transmission',
    'finalDrive',
    'wetWeight',
    'seatHeight',
    'topSpeed',
    'productionUnits',
    'modelGeneration',
    'productionPeriod',
  ]),
  watch: Object.freeze([
    'movement',
    'caliber',
    'caseMaterial',
    'caseSize',
    'dialColor',
    'bracelet',
    'waterResistance',
    'powerReserve',
    'productionPeriod',
  ]),
});
