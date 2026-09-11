import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcryptjs';
import request from '../testSupport/http.js';
import { Brand, Product, User, buildSpecifications } from '../models/index.js';

describe('Phase 9 collector APIs', () => {
  /** @type {MongoMemoryServer} */
  let mongod;
  let accessToken;
  let productId;
  let secondProductId;

  before(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri(), { dbName: 'archivex-collector-test' });
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';

    const brand = await Brand.create({
      name: 'Ferrari',
      slug: 'ferrari',
      primaryDomains: ['car'],
      status: 'active',
    });

    const product = await Product.create({
      name: 'Ferrari F40',
      slug: 'ferrari-f40',
      productType: 'car',
      brand: brand._id,
      status: 'approved',
      releaseYear: 1987,
      rarity: 'ICONIC',
      availability: 'private',
      shortDescription: 'Twin-turbo legend',
      images: [{ url: 'https://example.com/f40.jpg', alt: 'F40', type: 'hero' }],
      specifications: buildSpecifications('car', {
        engine: 'V8 twin-turbo',
        bodyStyle: 'coupe',
      }),
    });
    productId = String(product._id);

    const second = await Product.create({
      name: 'Ferrari 250 GTO',
      slug: 'ferrari-250-gto',
      productType: 'car',
      brand: brand._id,
      status: 'approved',
      releaseYear: 1962,
      rarity: 'UNIQUE',
      availability: 'private',
      shortDescription: 'Competition icon',
      images: [{ url: 'https://example.com/gto.jpg', alt: 'GTO', type: 'hero' }],
      specifications: buildSpecifications('car', {
        engine: 'V12',
        bodyStyle: 'coupe',
      }),
    });
    secondProductId = String(second._id);

    const hash = await bcrypt.hash('password123', 10);
    await User.create({
      name: 'Collector',
      firstName: 'Phase',
      lastName: 'Collector',
      username: 'collector_phase9',
      email: 'collector-phase9@test.local',
      passwordHash: hash,
      role: 'user',
      status: 'active',
    });

    const login = await request('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: 'collector-phase9@test.local',
        password: 'password123',
      }),
    });
    accessToken = login.body.data.accessToken;
  });

  after(async () => {
    await mongoose.disconnect();
    if (mongod) await mongod.stop();
  });

  it('rejects unauthenticated favorites', async () => {
    const response = await request('/api/v1/favorites');
    assert.equal(response.status, 401);
  });

  it('adds, lists, and removes favorites', async () => {
    const add = await request(`/api/v1/favorites/${productId}`, {
      method: 'POST',
      headers: { authorization: `Bearer ${accessToken}` },
    });
    assert.equal(add.status, 201);
    assert.equal(add.body.data.productId, productId);

    const list = await request('/api/v1/favorites', {
      headers: { authorization: `Bearer ${accessToken}` },
    });
    assert.equal(list.status, 200);
    assert.equal(list.body.data.length, 1);
    assert.equal(list.body.data[0].product.slug, 'ferrari-f40');

    const remove = await request(`/api/v1/favorites/${productId}`, {
      method: 'DELETE',
      headers: { authorization: `Bearer ${accessToken}` },
    });
    assert.equal(remove.status, 200);
    assert.equal(remove.body.data.removed, true);

    const empty = await request('/api/v1/favorites', {
      headers: { authorization: `Bearer ${accessToken}` },
    });
    assert.equal(empty.body.data.length, 0);
  });

  it('creates collections and manages products', async () => {
    const create = await request('/api/v1/collections', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ name: 'Icons', description: 'Primary chamber', visibility: 'private' }),
    });
    assert.equal(create.status, 201);
    assert.equal(create.body.data.name, 'Icons');
    const collectionId = create.body.data.id;

    const add = await request(`/api/v1/collections/${collectionId}/products/${productId}`, {
      method: 'POST',
      headers: { authorization: `Bearer ${accessToken}` },
    });
    assert.equal(add.status, 200);
    assert.equal(add.body.data.objectCount, 1);

    const detail = await request(`/api/v1/collections/${collectionId}`, {
      headers: { authorization: `Bearer ${accessToken}` },
    });
    assert.equal(detail.status, 200);
    assert.equal(detail.body.data.products.length, 1);
    assert.equal(detail.body.data.productIds[0], productId);

    const remove = await request(`/api/v1/collections/${collectionId}/products/${productId}`, {
      method: 'DELETE',
      headers: { authorization: `Bearer ${accessToken}` },
    });
    assert.equal(remove.status, 200);
    assert.equal(remove.body.data.objectCount, 0);

    const del = await request(`/api/v1/collections/${collectionId}`, {
      method: 'DELETE',
      headers: { authorization: `Bearer ${accessToken}` },
    });
    assert.equal(del.status, 200);
    assert.equal(del.body.data.removed, true);
  });

  it('filters products by comma-separated ids for compare', async () => {
    const response = await request(
      `/api/v1/products?ids=${productId},${secondProductId}&limit=4`
    );
    assert.equal(response.status, 200);
    const ids = response.body.data.map((item) => item.id).sort();
    assert.deepEqual(ids, [productId, secondProductId].sort());
  });
});
