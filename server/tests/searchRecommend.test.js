import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from '../testSupport/http.js';
import { Brand, Product } from '../models/index.js';

describe('Phase 12 search and recommendations APIs', () => {
  /** @type {MongoMemoryServer} */
  let mongod;

  before(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri(), { dbName: 'archivex-search-test' });

    const ferrari = await Brand.create({
      name: 'Ferrari',
      slug: 'ferrari',
      primaryDomains: ['car'],
      status: 'active',
    });
    const ducati = await Brand.create({
      name: 'Ducati',
      slug: 'ducati',
      primaryDomains: ['motorcycle'],
      status: 'active',
    });

    await Product.create({
      name: 'Ferrari F40',
      slug: 'ferrari-f40',
      reference: 'AX-0108',
      productType: 'car',
      brand: ferrari._id,
      shortDescription: 'Twin-turbo legend',
      description: 'Enzo final road car.',
      status: 'approved',
      featured: true,
      rarity: 'ICONIC',
      releaseYear: 1987,
    });
    await Product.create({
      name: 'Ducati Panigale',
      slug: 'ducati-panigale',
      productType: 'motorcycle',
      brand: ducati._id,
      shortDescription: 'Superbike geometry',
      status: 'approved',
      featured: false,
      rarity: 'RARE',
      releaseYear: 2018,
    });
    await Product.create({
      name: 'Hidden draft coupe',
      slug: 'hidden-draft-coupe',
      productType: 'car',
      brand: ferrari._id,
      status: 'pending',
      featured: true,
      rarity: 'ICONIC',
    });
  });

  after(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  it('GET /products?q= finds approved objects by name and brand', async () => {
    const byName = await request('/api/v1/products?q=F40&sort=relevance');
    assert.equal(byName.status, 200);
    assert.ok(byName.body.data.some((item) => item.slug === 'ferrari-f40'));
    assert.ok(!byName.body.data.some((item) => item.slug === 'hidden-draft-coupe'));

    const byBrand = await request('/api/v1/products?q=Ducati&sort=relevance');
    assert.equal(byBrand.status, 200);
    assert.ok(byBrand.body.data.some((item) => item.slug === 'ducati-panigale'));
  });

  it('GET /products/recommended returns featured-first public objects', async () => {
    const response = await request('/api/v1/products/recommended?limit=8');
    assert.equal(response.status, 200);
    assert.ok(Array.isArray(response.body.data));
    assert.ok(response.body.data.length >= 1);
    assert.equal(response.body.data[0].slug, 'ferrari-f40');
    assert.ok(!response.body.data.some((item) => item.slug === 'hidden-draft-coupe'));
  });

  it('GET /products/recommended filters by productType', async () => {
    const response = await request('/api/v1/products/recommended?productType=motorcycle');
    assert.equal(response.status, 200);
    assert.equal(response.body.data.length, 1);
    assert.equal(response.body.data[0].slug, 'ducati-panigale');
  });
});
