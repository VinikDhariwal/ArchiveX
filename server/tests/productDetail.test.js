import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from '../testSupport/http.js';
import { Brand, Category, Product, ProductView, Tag, buildSpecifications } from '../models/index.js';

describe('Phase 8 product intelligence APIs', () => {
  /** @type {MongoMemoryServer} */
  let mongod;
  let ferrariId;
  let f40Id;
  let chironId;

  before(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri(), { dbName: 'archivex-detail-test' });

    const ferrari = await Brand.create({
      name: 'Ferrari',
      slug: 'ferrari',
      primaryDomains: ['car'],
      status: 'active',
    });
    const bugatti = await Brand.create({
      name: 'Bugatti',
      slug: 'bugatti',
      primaryDomains: ['car'],
      status: 'active',
    });
    const category = await Category.create({
      name: 'Car Icons',
      slug: 'car-icons',
      productType: 'car',
      status: 'active',
    });
    const tag = await Tag.create({ name: 'Iconic', slug: 'iconic', status: 'active' });
    ferrariId = String(ferrari._id);

    const f40 = await Product.create({
      name: 'Ferrari F40',
      slug: 'ferrari-f40',
      reference: 'AX-0108',
      productType: 'car',
      brand: ferrari._id,
      category: category._id,
      tags: [tag._id],
      shortDescription: 'Twin-turbo legend',
      description: 'Enzo’s final road car.',
      whyItMatters: 'Engineering theatre and collector myth.',
      releaseYear: 1987,
      rarity: 'ICONIC',
      availability: 'private',
      status: 'approved',
      featured: true,
      images: [{ url: 'https://example.com/f40.jpg', alt: 'F40', type: 'hero' }],
      specifications: buildSpecifications('car', { engine: 'V8 twin-turbo', bodyStyle: 'coupe' }),
      rarityProfile: {
        productionHistory: 'Late 1980s limited run.',
        collectorInterest: 'Very high.',
        historicalSignificance: 'Final Enzo-era road car.',
      },
      marketSignals: {
        archiveEstimate: 'Archive study range',
        marketRange: 'Elevated private band',
        collectorInterest: 'High',
        availabilitySignal: 'private',
        priceMovement: 'Observational',
        lastUpdated: new Date('2026-09-09'),
      },
    });

    const chiron = await Product.create({
      name: 'Bugatti Chiron',
      slug: 'bugatti-chiron',
      productType: 'car',
      brand: bugatti._id,
      category: category._id,
      tags: [tag._id],
      shortDescription: 'Modern hypercar',
      description: 'W16 presence.',
      releaseYear: 2016,
      rarity: 'ICONIC',
      status: 'approved',
      images: [{ url: 'https://example.com/chiron.jpg', alt: 'Chiron', type: 'hero' }],
      specifications: buildSpecifications('car', { engine: 'W16', bodyStyle: 'coupe' }),
    });

    f40Id = String(f40._id);
    chironId = String(chiron._id);
    void ferrariId;
    void chironId;
  });

  after(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  it('GET /products/:slug returns intelligence fields', async () => {
    const response = await request('/api/v1/products/ferrari-f40');
    assert.equal(response.status, 200);
    assert.equal(response.body.data.slug, 'ferrari-f40');
    assert.ok(response.body.data.whyItMatters);
    assert.ok(response.body.data.rarityProfile);
    assert.ok(response.body.data.marketSignals?.marketRange);
    assert.equal(response.body.data.specifications.fields.engine, 'V8 twin-turbo');
  });

  it('POST /products/:id/view records a ProductView', async () => {
    const response = await request(`/api/v1/products/${f40Id}/view`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sessionKey: 'test-session', source: 'detail' }),
    });
    assert.equal(response.status, 201);
    assert.equal(response.body.data.productId, f40Id);
    const count = await ProductView.countDocuments({ product: f40Id });
    assert.equal(count, 1);
  });

  it('GET /products/:id/related returns related approved products', async () => {
    const response = await request(`/api/v1/products/${f40Id}/related`);
    assert.equal(response.status, 200);
    assert.ok(Array.isArray(response.body.data));
    assert.ok(response.body.data.some((item) => item.slug === 'bugatti-chiron'));
    assert.ok(!response.body.data.some((item) => item.id === f40Id));
  });

  it('GET /products/:id/journal returns empty coverage when no essays linked', async () => {
    const response = await request(`/api/v1/products/${f40Id}/journal`);
    assert.equal(response.status, 200);
    assert.deepEqual(response.body.data, []);
    assert.equal(response.body.meta.total, 0);
    assert.match(response.body.meta.note || '', /No journal essays/);
  });

  it('rejects invalid product ids', async () => {
    const response = await request('/api/v1/products/not-an-id/related');
    assert.equal(response.status, 400);
  });
});
