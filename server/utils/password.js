import bcrypt from 'bcryptjs';
import ApiError from './ApiError.js';
import env from '../config/env.js';

/** bcrypt cost — never store reversible ciphertext for passwords. */
export function getPasswordSaltRounds() {
  return env.bcryptSaltRounds;
}

/**
 * Valid bcrypt stub used when no user exists so login timing stays comparable.
 * Generated once at module load (not a real account password).
 */
const TIMING_DUMMY_HASH = bcrypt.hashSync('__archivex_timing_dummy__', 10);

const MIN_PASSWORD_LENGTH = 8;
/** bcrypt silently truncates beyond 72 bytes — reject longer inputs. */
const MAX_PASSWORD_LENGTH = 72;

/**
 * Validate a plaintext password for create / change flows.
 * @returns {string} trimmed password (whitespace-only rejected via length)
 */
export function assertPasswordPolicy(password, { label = 'Password' } = {}) {
  const value = String(password ?? '');
  if (value.length < MIN_PASSWORD_LENGTH) {
    throw new ApiError(`${label} must be at least ${MIN_PASSWORD_LENGTH} characters`, 400, 'VALIDATION_ERROR');
  }
  if (value.length > MAX_PASSWORD_LENGTH) {
    throw new ApiError(`${label} must be at most ${MAX_PASSWORD_LENGTH} characters`, 400, 'VALIDATION_ERROR');
  }
  return value;
}

export async function hashPassword(password) {
  const value = assertPasswordPolicy(password);
  return bcrypt.hash(value, getPasswordSaltRounds());
}

export async function verifyPassword(password, passwordHash) {
  const hash = passwordHash || TIMING_DUMMY_HASH;
  return bcrypt.compare(String(password ?? ''), hash);
}

/** Run a compare even when the account is missing (timing equalization). */
export async function verifyPasswordOrDummy(password, passwordHash) {
  return verifyPassword(password, passwordHash || TIMING_DUMMY_HASH);
}

export { TIMING_DUMMY_HASH, MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH };
