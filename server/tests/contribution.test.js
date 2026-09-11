import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcryptjs';
import request from '../testSupport/http.js';
import { Brand, Product, User } from '../models/index.js';

describe('Collector product contributions', () => {
  /** @type {MongoMemoryServer} */
  let mongod;
  let ownerToken;
  let otherToken;
  let brandSlug;
  let inactiveBrandSlug;

  before(async () => {
    // Disable unix sockets so mongod can start under restricted sandboxes
    // that block /tmp/*.sock binds (exit code 48).
    mongod = await MongoMemoryServer.create({
      instance: { args: ['--nounixsocket'] },
    });
    await mongoose.connect(mongod.getUri(), { dbName: 'archivex-contribution-test' });
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';

    const brand = await Brand.create({
      name: 'Porsche',
      slug: 'porsche',
      primaryDomains: ['car'],
      status: 'active',
    });
    brandSlug = brand.slug;

    const inactive = await Brand.create({
      name: 'Dormant House',
      slug: 'dormant-house',
      primaryDomains: ['car'],
      status: 'inactive',
    });
    inactiveBrandSlug = inactive.slug;

    const hash = await bcrypt.hash('password123', 10);
    await User.create({
      name: 'Owner Collector',
      firstName: 'Owner',
      lastName: 'Collector',
      username: 'owner_contrib',
      email: 'owner-contrib@test.local',
      passwordHash: hash,
      role: 'user',
      status: 'active',
    });
    await User.create({
      name: 'Other Collector',
      firstName: 'Other',
      lastName: 'Collector',
      username: 'other_contrib',
      email: 'other-contrib@test.local',
      passwordHash: hash,
      role: 'user',
      status: 'active',
    });

    const ownerLogin = await request('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: 'owner-contrib@test.local',
        password: 'password123',
      }),
    });
    ownerToken = ownerLogin.body.data.accessToken;

    const otherLogin = await request('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: 'other-contrib@test.local',
        password: 'password123',
      }),
    });
    otherToken = otherLogin.body.data.accessToken;
  });

  after(async () => {
    await mongoose.disconnect();
    if (mongod) await mongod.stop();
  });

  it('creates a pending contribution and hides it from public slug until approved', async () => {
    const create = await request('/api/v1/contributions/products', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${ownerToken}`,
      },
      body: JSON.stringify({
        name: '959 Prototype',
        productType: 'car',
        brandSlug,
        shortDescription: 'Group B homologation legend in waiting.',
        images: [{ url: 'https://example.com/959.jpg', alt: '959', type: 'hero' }],
        status: 'approved',
        featured: true,
      }),
    });
    assert.equal(create.status, 201);
    const product = create.body.data.product;
    assert.equal(product.status, 'pending');
    assert.equal(product.featured, false);
    assert.ok(product.slug);

    const publicGet = await request(`/api/v1/products/${product.slug}`);
    assert.equal(publicGet.status, 404);

    await Product.updateOne({ _id: product.id }, { $set: { status: 'approved' } });
    const afterApprove = await request(`/api/v1/products/${product.slug}`);
    assert.equal(afterApprove.status, 200);
    assert.equal(afterApprove.body.data.name, '959 Prototype');
  });

  it('lists and loads own submissions; other users cannot read or patch', async () => {
    const list = await request('/api/v1/contributions/products', {
      headers: { authorization: `Bearer ${ownerToken}` },
    });
    assert.equal(list.status, 200);
    assert.ok(list.body.data.length >= 1);
    const id = list.body.data[0].id;

    const mine = await request(`/api/v1/contributions/products/${id}`, {
      headers: { authorization: `Bearer ${ownerToken}` },
    });
    assert.equal(mine.status, 200);
    assert.equal(mine.body.data.product.id, id);

    const foreignGet = await request(`/api/v1/contributions/products/${id}`, {
      headers: { authorization: `Bearer ${otherToken}` },
    });
    assert.equal(foreignGet.status, 404);

    const foreignPatch = await request(`/api/v1/contributions/products/${id}`, {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${otherToken}`,
      },
      body: JSON.stringify({ name: 'Hijacked' }),
    });
    assert.equal(foreignPatch.status, 404);
  });

  it('rejects inactive brands and non-http image URLs', async () => {
    const badBrand = await request('/api/v1/contributions/products', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${ownerToken}`,
      },
      body: JSON.stringify({
        name: 'Ghost Car',
        productType: 'car',
        brandSlug: inactiveBrandSlug,
        shortDescription: 'Should not land under an inactive house.',
      }),
    });
    assert.equal(badBrand.status, 404);

    const badImage = await request('/api/v1/contributions/products', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${ownerToken}`,
      },
      body: JSON.stringify({
        name: 'Bad Image Plate',
        productType: 'car',
        brandSlug,
        shortDescription: 'Image URL must be absolute http(s).',
        images: [{ url: 'javascript:alert(1)', alt: 'nope' }],
      }),
    });
    assert.equal(badImage.status, 400);
    assert.equal(badImage.body.error.code, 'INVALID_URL');
  });

  it('allows owner to edit and withdraw pending submissions', async () => {
    const create = await request('/api/v1/contributions/products', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${ownerToken}`,
      },
      body: JSON.stringify({
        name: 'Withdraw Me',
        productType: 'car',
        brandSlug,
        shortDescription: 'Temporary proposal for withdraw test.',
      }),
    });
    assert.equal(create.status, 201);
    const id = create.body.data.product.id;

    const patch = await request(`/api/v1/contributions/products/${id}`, {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${ownerToken}`,
      },
      body: JSON.stringify({
        name: 'Withdraw Me Revised',
        shortDescription: 'Updated short description for pending edit.',
      }),
    });
    assert.equal(patch.status, 200);
    assert.equal(patch.body.data.product.name, 'Withdraw Me Revised');
    assert.equal(patch.body.data.product.status, 'pending');

    const withdraw = await request(`/api/v1/contributions/products/${id}`, {
      method: 'DELETE',
      headers: { authorization: `Bearer ${ownerToken}` },
    });
    assert.equal(withdraw.status, 200);
    assert.equal(withdraw.body.data.withdrawn, true);

    const gone = await request(`/api/v1/contributions/products/${id}`, {
      headers: { authorization: `Bearer ${ownerToken}` },
    });
    assert.equal(gone.status, 404);
  });

  it('locks approved submissions from collector edit', async () => {
    const create = await request('/api/v1/contributions/products', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${ownerToken}`,
      },
      body: JSON.stringify({
        name: 'Already Approved',
        productType: 'car',
        brandSlug,
        shortDescription: 'Will be approved then locked.',
      }),
    });
    const id = create.body.data.product.id;
    await Product.updateOne({ _id: id }, { $set: { status: 'approved' } });

    const patch = await request(`/api/v1/contributions/products/${id}`, {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${ownerToken}`,
      },
      body: JSON.stringify({ name: 'Should Fail' }),
    });
    assert.equal(patch.status, 403);
    assert.equal(patch.body.error.code, 'SUBMISSION_LOCKED');
  });
});
