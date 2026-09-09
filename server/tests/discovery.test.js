import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from '../testSupport/http.js';
import { Brand, Category, Product, Tag, buildSpecifications } from '../models/index.js';

describe('Phase 7 discovery APIs', () => {
  /** @type {MongoMemoryServer} */
  let mongod;

  before(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri(), { dbName: 'archivex-discovery-test' });

    const ferrari = await Brand.create({
      name: 'Ferrari',
      slug: 'ferrari',
      primaryDomains: ['car'],
      status: 'active',
    });
    const rolex = await Brand.create({
      name: 'Rolex',
      slug: 'rolex',
      primaryDomains: ['watch'],
      status: 'active',
    });
    const category = await Category.create({
      name: 'Car Icons',
      slug: 'car-icons',
      productType: 'car',
      status: 'active',
    });
    const tag = await Tag.create({ name: 'Iconic', slug: 'iconic', status: 'active' });

    await Product.create({
      name: 'Ferrari F40',
      slug: 'ferrari-f40',
      reference: 'AX-0108',
      productType: 'car',
      brand: ferrari._id,
      category: category._id,
      tags: [tag._id],
      status: 'approved',
      featured: true,
      releaseYear: 1987,
      rarity: 'ICONIC',
      availability: 'private',
      materials: ['aluminium'],
      colors: ['red'],
      shortDescription: 'Twin-turbo V8 legend',
      description: 'Enzo final road car',
      images: [{ url: 'https://example.com/f40.jpg', alt: 'F40', type: 'hero' }],
      specifications: buildSpecifications('car', {
        engine: 'V8 twin-turbo',
        bodyStyle: 'coupe',
        drivetrain: 'RWD',
        power: '478 PS',
      }),
    });

    await Product.create({
      name: 'Rolex Submariner',
      slug: 'rolex-submariner',
      reference: 'AX-5513',
      productType: 'watch',
      brand: rolex._id,
      status: 'approved',
      releaseYear: 1965,
      rarity: 'RARE',
      availability: 'private',
      shortDescription: 'Dive watch icon',
      images: [{ url: 'https://example.com/sub.jpg', alt: 'Sub', type: 'hero' }],
      specifications: buildSpecifications('watch', {
        movement: 'automatic',
        caseSize: '40mm',
        dialColor: 'black',
      }),
    });

    await Product.create({
      name: 'Pending Concept',
      slug: 'pending-concept',
      productType: 'car',
      brand: ferrari._id,
      status: 'pending',
      images: [{ url: 'https://example.com/p.jpg', alt: 'P', type: 'hero' }],
    });
  });

  after(async () => {
    await mongoose.disconnect();
    if (mongod) await mongod.stop();
  });

  it('filters by productType and excludes pending', async () => {
    const response = await request('/api/v1/products?productType=car');
    assert.equal(response.status, 200);
    const slugs = response.body.data.map((item) => item.slug);
    assert.deepEqual(slugs, ['ferrari-f40']);
    assert.equal(response.body.meta.total, 1);
  });

  it('searches across name, reference, and brand', async () => {
    const byName = await request('/api/v1/products?q=F40');
    assert.equal(byName.status, 200);
    assert.ok(byName.body.data.some((item) => item.slug === 'ferrari-f40'));

    const byBrand = await request('/api/v1/products?q=Rolex');
    assert.equal(byBrand.status, 200);
    assert.ok(byBrand.body.data.some((item) => item.slug === 'rolex-submariner'));

    const byRef = await request('/api/v1/products?q=AX-0108');
    assert.ok(byRef.body.data.some((item) => item.slug === 'ferrari-f40'));
  });

  it('applies brand and domain-aware bodyStyle filters', async () => {
    const response = await request('/api/v1/products?brand=ferrari&bodyStyle=coupe');
    assert.equal(response.status, 200);
    assert.equal(response.body.meta.total, 1);
    assert.equal(response.body.data[0].slug, 'ferrari-f40');
  });

  it('does not leak watch filters into car-only results incorrectly', async () => {
    const response = await request('/api/v1/products?productType=car&movement=automatic');
    assert.equal(response.status, 200);
    // movement is ignored for cars, so F40 still returns
    assert.equal(response.body.meta.total, 1);
    assert.equal(response.body.data[0].slug, 'ferrari-f40');
  });

  it('sorts by rarity and supports pagination meta', async () => {
    const response = await request('/api/v1/products?sort=rarity&limit=1&page=1');
    assert.equal(response.status, 200);
    assert.equal(response.body.data.length, 1);
    assert.equal(response.body.data[0].rarity, 'ICONIC');
    assert.equal(response.body.meta.total, 2);
    assert.equal(response.body.meta.totalPages, 2);
    assert.equal(response.body.meta.sort, 'rarity');
  });

  it('returns filter schema without watch-only noise for cars', async () => {
    const response = await request('/api/v1/products/filters/schema?productType=car');
    assert.equal(response.status, 200);
    const keys = response.body.data.domain.map((item) => item.key);
    assert.ok(keys.includes('bodyStyle'));
    assert.ok(keys.includes('drivetrain'));
    assert.ok(!keys.includes('movement'));
    assert.ok(!keys.includes('caseSize'));
  });

  it('supports deliberate field selection', async () => {
    const response = await request('/api/v1/products?fields=name,slug,brand&limit=1');
    assert.equal(response.status, 200);
    const item = response.body.data[0];
    assert.equal(typeof item.name, 'string');
    assert.equal(typeof item.slug, 'string');
    assert.equal(typeof item.brand, 'string');
    assert.equal(item.shortDescription, undefined);
  });
});
