import assert from 'node:assert/strict';
import { describe, it, before, after } from 'node:test';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import {
  Brand,
  Category,
  Product,
  Tag,
  User,
  buildSpecifications,
  assertValidSpecifications,
} from '../models/index.js';

describe('Phase 4 models', () => {
  /** @type {MongoMemoryServer} */
  let mongod;

  before(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri(), { dbName: 'archivex-test' });
  });

  after(async () => {
    await mongoose.disconnect();
    if (mongod) await mongod.stop();
  });

  it('buildSpecifications keeps only allowed car fields', () => {
    const spec = buildSpecifications('car', {
      engine: 'V12',
      caseSize: 'should-drop',
      power: '700 PS',
    });
    assert.equal(spec.domain, 'automotive');
    assert.equal(spec.productType, 'car');
    assert.equal(spec.fields.engine, 'V12');
    assert.equal(spec.fields.power, '700 PS');
    assert.equal(spec.fields.caseSize, undefined);
  });

  it('assertValidSpecifications rejects watch fields on cars', () => {
    assert.throws(
      () =>
        assertValidSpecifications('car', {
          productType: 'car',
          domain: 'automotive',
          fields: { caseSize: '40mm' },
        }),
      /Disallowed specification field/
    );
  });

  it('creates User with admin role', async () => {
    const user = await User.create({
      name: 'Test Admin',
      email: 'admin@test.local',
      passwordHash: 'hash',
      role: 'admin',
    });
    assert.equal(user.role, 'admin');
    assert.equal(user.status, 'active');
  });

  it('creates Brand and Category', async () => {
    const brand = await Brand.create({
      name: 'Test Brand',
      slug: 'test-brand',
      primaryDomains: ['car'],
      country: 'Italy',
    });
    const category = await Category.create({
      name: 'Test Cars',
      slug: 'test-cars',
      productType: 'car',
    });
    assert.equal(brand.slug, 'test-brand');
    assert.equal(category.productType, 'car');
  });

  it('creates approved Product with controlled specs', async () => {
    const brand = await Brand.findOne({ slug: 'test-brand' });
    const category = await Category.findOne({ slug: 'test-cars' });
    const tag = await Tag.create({ name: 'Iconic', slug: 'test-iconic' });
    const user = await User.findOne({ email: 'admin@test.local' });

    const product = await Product.create({
      name: 'Test Coupe',
      slug: 'test-coupe',
      productType: 'car',
      brand: brand._id,
      category: category._id,
      tags: [tag._id],
      shortDescription: 'Test car',
      releaseYear: 2020,
      rarity: 'RARE',
      status: 'approved',
      publisher: 'ArchiveX',
      createdBy: user._id,
      images: [{ url: 'https://example.com/car.jpg', alt: 'Test', type: 'hero' }],
      specifications: buildSpecifications('car', { engine: 'V8', bodyStyle: 'coupe' }),
    });

    assert.equal(product.status, 'approved');
    assert.equal(product.publisher, 'ArchiveX');
    assert.equal(product.specifications.fields.get('engine'), 'V8');
  });

  it('rejects Product with foreign specification keys', async () => {
    const brand = await Brand.findOne({ slug: 'test-brand' });
    await assert.rejects(
      () =>
        Product.create({
          name: 'Bad Specs',
          slug: 'bad-specs',
          productType: 'car',
          brand: brand._id,
          status: 'approved',
          specifications: {
            domain: 'automotive',
            productType: 'car',
            fields: { caseSize: '40mm' },
          },
        }),
      /Disallowed specification field/
    );
  });

  it('defaults new products to pending status', async () => {
    const brand = await Brand.findOne({ slug: 'test-brand' });
    const product = await Product.create({
      name: 'Pending Bike',
      slug: 'pending-bike',
      productType: 'motorcycle',
      brand: brand._id,
    });
    assert.equal(product.status, 'pending');
  });
});
