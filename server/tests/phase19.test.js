import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from '../testSupport/http.js';
import { Brand, Product, buildSpecifications } from '../models/index.js';

describe('Phase 19 performance', () => {
  /** @type {MongoMemoryServer} */
  let mongod;

  before(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri(), { dbName: 'archivex-phase19-test' });

    const brand = await Brand.create({
      name: 'Porsche',
      slug: 'porsche-perf',
      primaryDomains: ['car'],
      status: 'active',
    });

    const base = (name, slug, year) => ({
      name,
      slug,
      productType: 'car',
      brand: brand._id,
      status: 'approved',
      releaseYear: year,
      rarity: 'RARE',
      availability: 'private',
      shortDescription: `${name} plate`,
      description: 'Long dossier copy that list queries should not need to hydrate heavily.',
      whyItMatters: 'Archive note',
      images: [{ url: 'https://example.com/car.jpg', alt: name, type: 'hero' }],
      specifications: buildSpecifications('car', { engine: 'flat-6', bodyStyle: 'coupe' }),
      featured: true,
    });

    await Product.create([
      base('911 Perf A', 'perf-a', 2018),
      base('911 Perf B', 'perf-b', 2019),
      base('911 Perf C', 'perf-c', 2020),
    ]);
  });

  after(async () => {
    await mongoose.disconnect();
    if (mongod) await mongod.stop();
  });

  it('sets Cache-Control on public catalog GETs', async () => {
    const home = await request('/api/v1/home');
    assert.equal(home.status, 200);
    assert.match(String(home.headers.get('cache-control') || ''), /public/);

    const products = await request('/api/v1/products?limit=2');
    assert.equal(products.status, 200);
    assert.match(String(products.headers.get('cache-control') || ''), /max-age=/);
  });

  it('list payloads omit heavy dossier fields by default', async () => {
    const response = await request('/api/v1/products?limit=2&sort=newest');
    assert.equal(response.status, 200);
    assert.ok(response.body.data.length >= 1);
    for (const item of response.body.data) {
      assert.equal(item.whyItMatters, '');
      assert.equal(item.description, '');
      assert.ok(item.name);
      assert.ok(item.slug);
    }
  });

  it('shuffle still pages correctly after id-hydrate path', async () => {
    const response = await request('/api/v1/products?sort=shuffle&seed=7&limit=2&page=1');
    assert.equal(response.status, 200);
    assert.equal(response.body.data.length, 2);
    assert.equal(response.body.meta.total, 3);
    assert.equal(response.body.meta.seed, 7);
  });
});
