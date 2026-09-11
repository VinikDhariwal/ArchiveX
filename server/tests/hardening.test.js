import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcryptjs';
import request from '../testSupport/http.js';
import { Brand, Product, User, buildSpecifications } from '../models/index.js';

const json = (token) => ({
  'content-type': 'application/json',
  ...(token ? { authorization: `Bearer ${token}` } : {}),
});

describe('Hardening: hostile input + approval gates', () => {
  /** @type {MongoMemoryServer} */
  let mongod;
  let approvedId;
  let pendingId;
  let rejectedId;
  let archivedId;
  let userToken;

  before(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri(), { dbName: 'archivex-hardening-test' });
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';

    const brand = await Brand.create({
      name: 'Ferrari',
      slug: 'ferrari',
      primaryDomains: ['car'],
      status: 'active',
    });

    const base = (name, slug, status) => ({
      name,
      slug,
      productType: 'car',
      brand: brand._id,
      status,
      releaseYear: 1987,
      rarity: 'ICONIC',
      availability: 'private',
      shortDescription: `${name} plate`,
      images: [{ url: 'https://example.com/car.jpg', alt: name, type: 'hero' }],
      specifications: buildSpecifications('car', { engine: 'V8', bodyStyle: 'coupe' }),
    });

    const approved = await Product.create(base('Ferrari F40', 'ferrari-f40', 'approved'));
    const pending = await Product.create(base('Secret Pending', 'secret-pending', 'pending'));
    const rejected = await Product.create(base('Secret Rejected', 'secret-rejected', 'rejected'));
    const archived = await Product.create(base('Secret Archived', 'secret-archived', 'archived'));
    approvedId = String(approved._id);
    pendingId = String(pending._id);
    rejectedId = String(rejected._id);
    archivedId = String(archived._id);

    const passwordHash = await bcrypt.hash('password123', 10);
    await User.create({
      name: 'Probe User',
      firstName: 'Probe',
      lastName: 'User',
      username: 'probe_user',
      email: 'probe@test.local',
      passwordHash,
      role: 'user',
      status: 'active',
    });
    const login = await request('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'probe@test.local', password: 'password123' }),
    });
    userToken = login.body.data.accessToken;
  });

  after(async () => {
    await mongoose.disconnect();
    if (mongod) await mongod.stop();
  });

  describe('approval gates cannot be bypassed', () => {
    it('compare ids= never returns non-approved products', async () => {
      const ids = [approvedId, pendingId, rejectedId, archivedId].join(',');
      const response = await request(`/api/v1/products?ids=${ids}&limit=10`);
      assert.equal(response.status, 200);
      const returned = response.body.data.map((item) => item.id);
      assert.deepEqual(returned, [approvedId]);
    });

    it('detail by slug hides pending/rejected/archived', async () => {
      for (const slug of ['secret-pending', 'secret-rejected', 'secret-archived']) {
        const response = await request(`/api/v1/products/${slug}`);
        assert.equal(response.status, 404, `${slug} should be hidden`);
      }
    });

    it('related products never include non-approved records', async () => {
      const response = await request(`/api/v1/products/${approvedId}/related?limit=10`);
      assert.equal(response.status, 200);
      const names = response.body.data.map((item) => item.name);
      assert.ok(!names.some((name) => name.startsWith('Secret')), `leaked: ${names}`);
    });

    it('search cannot surface non-approved records', async () => {
      const response = await request('/api/v1/products?q=Secret');
      assert.equal(response.status, 200);
      assert.equal(response.body.data.length, 0);
    });

    it('favorites reject non-approved products', async () => {
      const response = await request(`/api/v1/favorites/${pendingId}`, {
        method: 'POST',
        headers: json(userToken),
      });
      assert.equal(response.status, 404);
    });

    it('recording views on non-approved products is rejected', async () => {
      const response = await request(`/api/v1/products/${rejectedId}/view`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sessionKey: 'sess_probe' }),
      });
      assert.equal(response.status, 404);
    });
  });

  describe('hostile query parameters', () => {
    it('rejects or ignores NoSQL operator-shaped query params without a 500', async () => {
      const probes = [
        '/api/v1/products?brand[$ne]=x',
        '/api/v1/products?q[$regex]=.*',
        '/api/v1/products?productType[$gt]=',
        '/api/v1/products?ids[$in][]=abc',
        '/api/v1/products?yearMin[$gt]=0',
        '/api/v1/brands?q[$where]=1',
      ];
      for (const path of probes) {
        const response = await request(path);
        assert.ok(response.status < 500, `${path} returned ${response.status}`);
        if (response.status === 200) {
          const names = (response.body.data || []).map((item) => item.name || '');
          assert.ok(!names.some((name) => name.startsWith('Secret')), `${path} leaked data`);
        }
      }
    });

    it('handles regex-hostile search terms safely', async () => {
      const payloads = ['(((((', '.*.*.*.*.*.*', 'a{100000}', '\\', '(?i)x', '[', '$where'];
      for (const q of payloads) {
        const response = await request(`/api/v1/products?q=${encodeURIComponent(q)}`);
        assert.equal(response.status, 200, `q=${q} returned ${response.status}`);
      }
    });

    it('brand search survives regex-hostile input and invalid domains', async () => {
      for (const q of ['(((((', '[', '\\']) {
        const response = await request(`/api/v1/brands?q=${encodeURIComponent(q)}`);
        assert.equal(response.status, 200, `brands q=${q} returned ${response.status}`);
        assert.deepEqual(response.body.data, []);
      }
      const literal = await request('/api/v1/brands?q=Ferrari');
      assert.equal(literal.status, 200);
      assert.equal(literal.body.data.length, 1);

      const badDomain = await request('/api/v1/brands?domain[$ne]=x');
      assert.equal(badDomain.status, 400);
    });

    it('article filters reject operator-shaped and unknown values', async () => {
      const badType = await request('/api/v1/articles?type[$ne]=x');
      assert.equal(badType.status, 400);
      const badDomain = await request('/api/v1/articles?domain=bogus');
      assert.equal(badDomain.status, 400);
      const ok = await request('/api/v1/articles?domain=car');
      assert.equal(ok.status, 200);
    });

    it('caps limit and survives pathological pagination values', async () => {
      const probes = [
        ['/api/v1/products?limit=999999', 48],
        ['/api/v1/products?limit=-5', 24],
        ['/api/v1/products?limit=abc', 24],
        ['/api/v1/products?page=-1', null],
        ['/api/v1/products?page=99999999', null],
        ['/api/v1/products?page=abc', null],
      ];
      for (const [path, expectedLimit] of probes) {
        const response = await request(path);
        assert.equal(response.status, 200, `${path} returned ${response.status}`);
        if (expectedLimit) {
          assert.ok(
            response.body.meta.limit <= expectedLimit,
            `${path} limit ${response.body.meta.limit} > ${expectedLimit}`
          );
        }
      }
    });

    it('rejects invalid sort values with 400 not 500', async () => {
      const response = await request('/api/v1/products?sort=DROP%20TABLE');
      assert.equal(response.status, 400);
      assert.equal(response.body.error?.code, 'INVALID_SORT');
    });

    it('malformed ObjectIds return 400/404 not 500', async () => {
      const probes = [
        '/api/v1/products/000/related',
        '/api/v1/products/%3Cscript%3E/journal',
        '/api/v1/media/files/not-an-id',
        '/api/v1/collections/not-an-id',
      ];
      for (const path of probes) {
        const headers = path.includes('collections') ? json(userToken) : undefined;
        const response = await request(path, headers ? { headers } : {});
        assert.ok(
          [400, 404].includes(response.status),
          `${path} returned ${response.status}`
        );
      }
    });
  });

  describe('hostile body payloads', () => {
    it('register survives non-string field types', async () => {
      const bodies = [
        { firstName: ['a'], lastName: 'b', username: 'fuzz_a1', email: 'f1@test.local', password: 'password123' },
        { firstName: { $gt: '' }, lastName: 'b', username: 'fuzz_a2', email: 'f2@test.local', password: 'password123' },
        { firstName: 'a', lastName: 'b', username: { $ne: null }, email: 'f3@test.local', password: 'password123' },
        { firstName: 'a', lastName: 'b', username: 'fuzz_a4', email: { $ne: null }, password: 'password123' },
        { firstName: 'a', lastName: 'b', username: 'fuzz_a5', email: 'f5@test.local', password: 12345678 },
      ];
      for (const body of bodies) {
        const response = await request('/api/v1/auth/register', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(body),
        });
        assert.ok(response.status < 500, `register ${JSON.stringify(body)} → ${response.status}`);
      }
    });

    it('login with operator-shaped credentials cannot bypass auth', async () => {
      const response = await request('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: { $ne: null }, password: { $ne: null } }),
      });
      assert.ok([400, 401, 404].includes(response.status), `got ${response.status}`);
    });

    it('rejects oversized JSON bodies without crashing', async () => {
      const big = 'x'.repeat(1_200_000);
      const response = await request('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: big, password: big }),
      });
      assert.ok([400, 401, 413].includes(response.status), `got ${response.status}`);
    });

    it('collection create sanitizes hostile names', async () => {
      const create = await request('/api/v1/collections', {
        method: 'POST',
        headers: json(userToken),
        body: JSON.stringify({ name: '<script>alert(1)</script>', visibility: 'bogus' }),
      });
      assert.equal(create.status, 201);
      // Falls back to private when visibility is invalid; name stored as text.
      assert.equal(create.body.data.visibility, 'private');
      assert.equal(create.body.data.name, '<script>alert(1)</script>');
      // Slug must be safe regardless of the hostile name.
      assert.match(create.body.data.slug, /^[a-z0-9-]+$/);
    });
  });

  describe('unknown routes and envelopes', () => {
    it('unknown API route returns the error envelope', async () => {
      const response = await request('/api/v1/definitely-not-a-route');
      assert.equal(response.status, 404);
      assert.equal(response.body.success, false);
      assert.equal(response.body.error.code, 'NOT_FOUND');
      assert.ok(response.body.requestId);
    });

    it('unsupported method on a known route does not crash', async () => {
      const response = await request('/api/v1/products', { method: 'DELETE' });
      assert.ok([404, 405].includes(response.status), `got ${response.status}`);
    });
  });
});
