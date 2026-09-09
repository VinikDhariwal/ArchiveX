import {
  SPEC_DOMAINS,
  SPEC_FIELDS_BY_TYPE,
  SUPPORTED_PRODUCT_TYPES,
} from '../../config/constants.js';

/**
 * Build a controlled specifications document for a product type.
 * Only keys listed in SPEC_FIELDS_BY_TYPE are kept.
 */
export function buildSpecifications(productType, fields = {}) {
  if (!SUPPORTED_PRODUCT_TYPES.includes(productType)) {
    throw new Error(`Unsupported productType for specifications: ${productType}`);
  }

  const allowed = SPEC_FIELDS_BY_TYPE[productType] || [];
  const cleaned = {};

  for (const key of allowed) {
    if (fields[key] !== undefined && fields[key] !== null && fields[key] !== '') {
      cleaned[key] = fields[key];
    }
  }

  return {
    domain: SPEC_DOMAINS[productType],
    productType,
    fields: cleaned,
  };
}

/**
 * Assert specifications match productType and contain no foreign keys.
 */
export function assertValidSpecifications(productType, specifications) {
  if (!specifications) return;

  if (specifications.productType && specifications.productType !== productType) {
    throw new Error('specifications.productType must match product.productType');
  }

  if (specifications.domain && specifications.domain !== SPEC_DOMAINS[productType]) {
    throw new Error(`specifications.domain must be ${SPEC_DOMAINS[productType]} for ${productType}`);
  }

  const allowed = new Set(SPEC_FIELDS_BY_TYPE[productType] || []);
  const fields = specifications.fields || {};

  for (const key of Object.keys(fields)) {
    if (!allowed.has(key)) {
      throw new Error(`Disallowed specification field "${key}" for productType "${productType}"`);
    }
  }
}
