import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcryptjs';
import request from '../testSupport/http.js';
import { Brand, Collection, Favorite, Product, ProductView, User } from '../models/index.js';

const jsonHeaders = (token) => ({
  'content-type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

describe('Phase 15 analytics APIs', () => {
  /** @type {MongoMemoryServer} */
  let mongod;
  let adminToken;
  let userToken;
  let productId;

  before(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri(), { dbName: 'archivex-analytics-test' });
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';

    const passwordHash = await bcrypt.hash('ArchiveX!admin', 10);
    await User.create({
      name: 'Admin',
      firstName: 'Archive',
      lastName: 'Admin',
      username: 'analytics_admin',
      email: 'admin@archivex.local',
      passwordHash,
      role: 'admin',
      status: 'active',
    });
    const collector = await User.create({
      name: 'Collector',
      firstName: 'Archive',
      lastName: 'Collector',
      username: 'analytics_user',
      email: 'user@archivex.local',
      passwordHash,
      role: 'user',
      status: 'active',
    });

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
      rarity: 'ICONIC',
      featured: true,
    });
    productId = product._id;

    await ProductView.create([
      { product: productId, source: 'detail', sessionKey: 'sess-a' },
      { product: productId, source: 'home', sessionKey: 'sess-b' },
      { product: productId, source: 'detail', sessionKey: 'sess-c' },
    ]);
    await Favorite.create({ user: collector._id, product: productId });
    await Collection.create({
      owner: collector._id,
      name: 'Garage',
      slug: 'garage',
      visibility: 'private',
      products: [productId],
      objectCount: 1,
    });

    const adminLogin = await request('/api/v1/auth/login', {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify({ email: 'admin@archivex.local', password: 'ArchiveX!admin' }),
    });
    adminToken = adminLogin.body.data.accessToken;

    const userLogin = await request('/api/v1/auth/login', {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify({ email: 'user@archivex.local', password: 'ArchiveX!admin' }),
    });
    userToken = userLogin.body.data.accessToken;
  });

  after(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  it('rejects non-staff from analytics', async () => {
    const response = await request('/api/v1/admin/analytics', {
      headers: jsonHeaders(userToken),
    });
    assert.equal(response.status, 403);
  });

  it('returns view, favorite, and catalog signals for staff', async () => {
    const response = await request('/api/v1/admin/analytics', {
      headers: jsonHeaders(adminToken),
    });
    assert.equal(response.status, 200);
    const data = response.body.data;
    assert.equal(data.views.total, 3);
    assert.ok(data.views.last7Days >= 3);
    assert.equal(data.favorites.total, 1);
    assert.equal(data.collections.total, 1);
    assert.equal(data.collections.objectsSaved, 1);
    assert.equal(data.catalog.productsApproved, 1);
    assert.equal(data.views.topProducts[0].slug, 'ferrari-f40');
    assert.equal(data.views.topProducts[0].count, 3);
    assert.equal(data.favorites.topProducts[0].count, 1);
    assert.ok(Array.isArray(data.views.bySource));
    assert.match(data.disclaimer, /Informational/);
  });
});
