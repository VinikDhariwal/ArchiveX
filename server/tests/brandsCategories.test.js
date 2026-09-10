import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from '../testSupport/http.js';
import { Brand, Category, Product } from '../models/index.js';

describe('Phase 11 brands and categories APIs', () => {
  /** @type {MongoMemoryServer} */
  let mongod;

  before(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri(), { dbName: 'archivex-taxonomy-test' });

    const ferrari = await Brand.create({
      name: 'Ferrari',
      slug: 'ferrari',
      country: 'Italy',
      foundedYear: 1947,
      primaryDomains: ['car'],
      status: 'active',
      description: 'Maranello icons.',
    });
    await Brand.create({
      name: 'Ducati',
      slug: 'ducati',
      country: 'Italy',
      primaryDomains: ['motorcycle'],
      status: 'active',
    });
    await Brand.create({
      name: 'Quiet House',
      slug: 'quiet-house',
      primaryDomains: ['car'],
      status: 'inactive',
    });
    await Brand.create({
      name: 'Rolex',
      slug: 'rolex',
      primaryDomains: ['watch'],
      status: 'active',
    });

    const carIcons = await Category.create({
      name: 'Automotive icons',
      slug: 'automotive-icons',
      productType: 'car',
      status: 'active',
      description: 'Scarce silhouettes.',
    });
    await Category.create({
      name: 'Superbikes',
      slug: 'superbikes',
      productType: 'motorcycle',
      status: 'active',
    });
    await Category.create({
      name: 'Hidden path',
      slug: 'hidden-path',
      productType: 'car',
      status: 'inactive',
    });

    await Product.create({
      name: 'Ferrari F40',
      slug: 'ferrari-f40',
      productType: 'car',
      brand: ferrari._id,
      category: carIcons._id,
      status: 'approved',
      rarity: 'ICONIC',
    });
  });

  after(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  it('GET /brands returns active brands A–Z with product counts', async () => {
    const response = await request('/api/v1/brands');
    assert.equal(response.status, 200);
    assert.ok(Array.isArray(response.body.data));
    assert.ok(response.body.data.every((item) => item.slug !== 'quiet-house'));
    assert.equal(response.body.data[0].slug, 'ducati');
    const ferrari = response.body.data.find((item) => item.slug === 'ferrari');
    assert.equal(ferrari.productCount, 1);
    assert.ok(response.body.data.some((item) => item.slug === 'rolex'));
  });

  it('GET /brands filters by domain', async () => {
    const response = await request('/api/v1/brands?domain=motorcycle');
    assert.equal(response.status, 200);
    assert.equal(response.body.data.length, 1);
    assert.equal(response.body.data[0].slug, 'ducati');
  });

  it('GET /brands supports name search', async () => {
    const response = await request('/api/v1/brands?q=ferr');
    assert.equal(response.status, 200);
    assert.equal(response.body.data.length, 1);
    assert.equal(response.body.data[0].slug, 'ferrari');
  });

  it('GET /brands/:slug returns brand chamber payload', async () => {
    const response = await request('/api/v1/brands/ferrari');
    assert.equal(response.status, 200);
    assert.equal(response.body.data.name, 'Ferrari');
    assert.equal(response.body.data.productCount, 1);
    assert.deepEqual(response.body.data.primaryDomains, ['car']);
  });

  it('GET /brands/:slug hides inactive brands', async () => {
    const response = await request('/api/v1/brands/quiet-house');
    assert.equal(response.status, 404);
  });

  it('GET /categories returns active taxonomy with counts', async () => {
    const response = await request('/api/v1/categories');
    assert.equal(response.status, 200);
    assert.equal(response.body.data.length, 2);
    const icons = response.body.data.find((item) => item.slug === 'automotive-icons');
    assert.equal(icons.productCount, 1);
    assert.ok(!response.body.data.some((item) => item.slug === 'hidden-path'));
  });

  it('GET /categories filters by productType', async () => {
    const response = await request('/api/v1/categories?productType=motorcycle');
    assert.equal(response.status, 200);
    assert.equal(response.body.data.length, 1);
    assert.equal(response.body.data[0].slug, 'superbikes');
  });

  it('GET /categories/:slug returns category chamber payload', async () => {
    const response = await request('/api/v1/categories/automotive-icons');
    assert.equal(response.status, 200);
    assert.equal(response.body.data.productType, 'car');
    assert.equal(response.body.data.productCount, 1);
  });
});
