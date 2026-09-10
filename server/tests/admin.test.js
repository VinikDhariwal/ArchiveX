import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcryptjs';
import request from '../testSupport/http.js';
import { Brand, Product, User } from '../models/index.js';

const jsonHeaders = (token) => ({
  'content-type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

describe('Phase 13 admin CMS APIs', () => {
  /** @type {MongoMemoryServer} */
  let mongod;
  let adminToken;
  let userToken;
  let brandId;
  let pendingId;

  before(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri(), { dbName: 'archivex-admin-test' });
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';

    const passwordHash = await bcrypt.hash('ArchiveX!admin', 10);
    await User.create({
      name: 'Admin',
      email: 'admin@archivex.local',
      passwordHash,
      role: 'admin',
      status: 'active',
    });
    await User.create({
      name: 'Collector',
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
    brandId = String(brand._id);

    const pending = await Product.create({
      name: 'Pending Plate',
      slug: 'pending-plate',
      productType: 'car',
      brand: brand._id,
      status: 'pending',
      rarity: 'RARE',
    });
    pendingId = String(pending._id);

    await Product.create({
      name: 'Ferrari F40',
      slug: 'ferrari-f40',
      productType: 'car',
      brand: brand._id,
      status: 'approved',
      rarity: 'ICONIC',
      featured: true,
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

  it('rejects non-staff from admin overview', async () => {
    const response = await request('/api/v1/admin/overview', {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert.equal(response.status, 403);
  });

  it('returns overview counts for admin', async () => {
    const response = await request('/api/v1/admin/overview', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(response.status, 200);
    assert.equal(response.body.data.productsPending, 1);
    assert.ok(response.body.data.productsTotal >= 2);
    assert.ok(response.body.data.brandsTotal >= 1);
  });

  it('lists pending products and approves them', async () => {
    const list = await request('/api/v1/admin/products?status=pending', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(list.status, 200);
    assert.ok(list.body.data.some((item) => item.id === pendingId));

    const approve = await request(`/api/v1/admin/products/${pendingId}/status`, {
      method: 'PATCH',
      headers: jsonHeaders(adminToken),
      body: JSON.stringify({ status: 'approved' }),
    });
    assert.equal(approve.status, 200);
    assert.equal(approve.body.data.status, 'approved');

    const publicProduct = await request('/api/v1/products/pending-plate');
    assert.equal(publicProduct.status, 200);
  });

  it('creates a brand and product via admin', async () => {
    const brand = await request('/api/v1/admin/brands', {
      method: 'POST',
      headers: jsonHeaders(adminToken),
      body: JSON.stringify({
        name: 'Lotus',
        slug: 'lotus',
        country: 'United Kingdom',
        primaryDomains: ['car'],
      }),
    });
    assert.equal(brand.status, 201);
    assert.equal(brand.body.data.slug, 'lotus');

    const product = await request('/api/v1/admin/products', {
      method: 'POST',
      headers: jsonHeaders(adminToken),
      body: JSON.stringify({
        name: 'Lotus Elise',
        productType: 'car',
        brand: 'lotus',
        status: 'approved',
        shortDescription: 'Light sports car',
      }),
    });
    assert.equal(product.status, 201);
    assert.equal(product.body.data.status, 'approved');
    assert.ok(product.body.data.slug);
    assert.ok(brandId);
  });

  it('writes audit events for admin actions', async () => {
    const response = await request('/api/v1/admin/audit?limit=20', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(response.status, 200);
    assert.ok(response.body.data.length >= 1);
    assert.ok(response.body.data.some((row) => row.action.includes('product')));
  });
});
