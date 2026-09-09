import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from '../testSupport/http.js';
import { Brand, Product } from '../models/index.js';

describe('Phase 5 public catalog APIs', () => {
  /** @type {MongoMemoryServer} */
  let mongod;

  before(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri(), { dbName: 'archivex-api-test' });

    const brand = await Brand.create({
      name: 'API Test Brand',
      slug: 'api-test-brand',
      primaryDomains: ['car'],
      status: 'active',
    });

    await Product.create({
      name: 'Approved Coupe',
      slug: 'approved-coupe',
      productType: 'car',
      brand: brand._id,
      status: 'approved',
      featured: true,
      releaseYear: 2020,
      shortDescription: 'Public plate',
      publisher: 'ArchiveX',
      images: [{ url: 'https://example.com/a.jpg', alt: 'A', type: 'hero' }],
    });

    await Product.create({
      name: 'Pending Coupe',
      slug: 'pending-coupe',
      productType: 'car',
      brand: brand._id,
      status: 'pending',
      shortDescription: 'Should not leak',
      images: [{ url: 'https://example.com/b.jpg', alt: 'B', type: 'hero' }],
    });
  });

  after(async () => {
    await mongoose.disconnect();
    if (mongod) await mongod.stop();
  });

  it('GET /api/v1/products returns only approved products', async () => {
    const response = await request('/api/v1/products');
    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    const slugs = response.body.data.map((item) => item.slug);
    assert.ok(slugs.includes('approved-coupe'));
    assert.ok(!slugs.includes('pending-coupe'));
    assert.equal(response.body.data[0].brand, 'API Test Brand');
  });

  it('GET /api/v1/products/:slug returns approved product', async () => {
    const response = await request('/api/v1/products/approved-coupe');
    assert.equal(response.status, 200);
    assert.equal(response.body.data.slug, 'approved-coupe');
    assert.equal(response.body.data.year, 2020);
  });

  it('GET /api/v1/products/:slug hides pending products', async () => {
    const response = await request('/api/v1/products/pending-coupe');
    assert.equal(response.status, 404);
    assert.equal(response.body.success, false);
  });

  it('GET /api/v1/brands lists active brands', async () => {
    const response = await request('/api/v1/brands');
    assert.equal(response.status, 200);
    assert.ok(response.body.data.some((brand) => brand.slug === 'api-test-brand'));
  });

  it('GET /api/v1/categories responds', async () => {
    const response = await request('/api/v1/categories');
    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    assert.ok(Array.isArray(response.body.data));
  });
});
