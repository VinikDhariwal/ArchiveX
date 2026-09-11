import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcryptjs';
import request from '../testSupport/http.js';
import { Brand, Product, User, buildSpecifications } from '../models/index.js';

describe('Phase 17 recently viewed + collection edges', () => {
  /** @type {MongoMemoryServer} */
  let mongod;
  let ownerToken;
  let otherToken;
  let productId;
  let collectionId;

  before(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri(), { dbName: 'archivex-phase17-collector-test' });
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

    const passwordHash = await bcrypt.hash('password123', 10);
    await User.create({
      name: 'Owner',
      firstName: 'Owner',
      lastName: 'One',
      username: 'owner_one',
      email: 'owner17@test.local',
      passwordHash,
      role: 'user',
      status: 'active',
    });
    await User.create({
      name: 'Other',
      firstName: 'Other',
      lastName: 'Two',
      username: 'other_two',
      email: 'other17@test.local',
      passwordHash,
      role: 'user',
      status: 'active',
    });

    const ownerLogin = await request('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'owner17@test.local', password: 'password123' }),
    });
    ownerToken = ownerLogin.body.data.accessToken;

    const otherLogin = await request('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'other17@test.local', password: 'password123' }),
    });
    otherToken = otherLogin.body.data.accessToken;

    const create = await request('/api/v1/collections', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${ownerToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ name: 'Garage', visibility: 'private' }),
    });
    collectionId = create.body.data.id;
  });

  after(async () => {
    await mongoose.disconnect();
    if (mongod) await mongod.stop();
  });

  it('lists recently viewed products for a session key', async () => {
    const sessionKey = 'sess_phase17_test';

    const view = await request(`/api/v1/products/${productId}/view`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sessionKey, source: 'detail' }),
    });
    assert.equal(view.status, 201);

    const recent = await request(
      `/api/v1/products/recently-viewed?sessionKey=${encodeURIComponent(sessionKey)}&limit=8`
    );
    assert.equal(recent.status, 200);
    assert.ok(recent.body.data.length >= 1);
    assert.equal(recent.body.data[0].slug, 'ferrari-f40');
  });

  it('lists recently viewed products for an authenticated user', async () => {
    const view = await request(`/api/v1/products/${productId}/view`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${ownerToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ source: 'detail' }),
    });
    assert.equal(view.status, 201);

    const recent = await request('/api/v1/products/recently-viewed?limit=8', {
      headers: { authorization: `Bearer ${ownerToken}` },
    });
    assert.equal(recent.status, 200);
    assert.ok(recent.body.data.some((item) => item.slug === 'ferrari-f40'));
  });

  it('patches collection name and visibility', async () => {
    const response = await request(`/api/v1/collections/${collectionId}`, {
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${ownerToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Night Garage',
        visibility: 'shared',
        description: 'Evening plates',
      }),
    });

    assert.equal(response.status, 200);
    assert.equal(response.body.data.name, 'Night Garage');
    assert.equal(response.body.data.visibility, 'shared');
    assert.equal(response.body.data.description, 'Evening plates');
  });

  it('rejects unauthenticated collection create', async () => {
    const response = await request('/api/v1/collections', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'Ghost' }),
    });
    assert.equal(response.status, 401);
  });

  it('isolates collections from other users', async () => {
    const response = await request(`/api/v1/collections/${collectionId}`, {
      headers: { authorization: `Bearer ${otherToken}` },
    });
    assert.ok([403, 404].includes(response.status));
  });

  it('rejects adding an invalid product id to a collection', async () => {
    const response = await request(
      `/api/v1/collections/${collectionId}/products/000000000000000000000000`,
      {
        method: 'POST',
        headers: { authorization: `Bearer ${ownerToken}` },
      }
    );
    assert.ok([400, 404].includes(response.status));
  });
});
