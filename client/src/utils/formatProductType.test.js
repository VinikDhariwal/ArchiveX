import { describe, expect, it } from 'vitest';
import { formatProductType } from '../utils/formatProductType.js';

describe('formatProductType', () => {
  it('labels known domains in plural', () => {
    expect(formatProductType('car')).toBe('Cars');
    expect(formatProductType('motorcycle')).toBe('Motorcycles');
    expect(formatProductType('watch')).toBe('Watches');
  });

  it('labels known domains in singular', () => {
    expect(formatProductType('car', { singular: true })).toBe('Car');
    expect(formatProductType('watch', { singular: true })).toBe('Watch');
  });

  it('returns empty string for blank values', () => {
    expect(formatProductType('')).toBe('');
    expect(formatProductType(null)).toBe('');
  });

  it('passes through unknown values', () => {
    expect(formatProductType('boat')).toBe('boat');
  });
});
