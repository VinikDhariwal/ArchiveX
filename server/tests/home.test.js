import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcryptjs';
import request from '../testSupport/http.js';
import { Article, Brand, HomePageConfig, Product, User } from '../models/index.js';

const jsonHeaders = (token) => ({
  'content-type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

describe('Home page CMS', () => {
  /** @type {MongoMemoryServer} */
  let mongod;
  let adminToken;
  let productId;
  let articleId;

  before(async () => {
    // Disable unix sockets so mongod can start under restricted sandboxes
    // that block /tmp/*.sock binds (exit code 48).
    mongod = await MongoMemoryServer.create({
      instance: { args: ['--nounixsocket'] },
    });
    await mongoose.connect(mongod.getUri(), { dbName: 'archivex-home-test' });
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';

    const passwordHash = await bcrypt.hash('ArchiveX!admin', 10);
    await User.create({
      name: 'Admin',
      firstName: 'Archive',
      lastName: 'Admin',
      username: 'home_admin',
      email: 'home-admin@archivex.local',
      passwordHash,
      role: 'admin',
      status: 'active',
    });

    const brand = await Brand.create({
      name: 'Ferrari',
      slug: 'ferrari-home',
      primaryDomains: ['car'],
      status: 'active',
    });

    const product = await Product.create({
      name: 'Ferrari F40 Home',
      slug: 'ferrari-f40-home',
      productType: 'car',
      brand: brand._id,
      status: 'approved',
      rarity: 'ICONIC',
      featured: true,
      shortDescription: 'Home CMS plate',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=max&w=1600&q=80',
          alt: 'Ferrari',
          type: 'hero',
          width: 1600,
          height: 1200,
        },
      ],
    });
    productId = String(product._id);

    const article = await Article.create({
      title: 'Home essay',
      slug: 'home-essay',
      articleType: 'Archive Essay',
      excerpt: 'Pinned editorial',
      status: 'approved',
      featured: true,
      publishedAt: new Date(),
      sections: [{ heading: '', body: 'Body' }],
      heroImage: {
        url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=max&w=1400&q=80',
        alt: 'Essay',
        type: 'editorial',
      },
    });
    articleId = String(article._id);

    const adminLogin = await request('/api/v1/auth/login', {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify({ email: 'home-admin@archivex.local', password: 'ArchiveX!admin' }),
    });
    adminToken = adminLogin.body.data.accessToken;
  });

  after(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  it('creates defaults on first public GET /home', async () => {
    await HomePageConfig.deleteMany({});
    const response = await request('/api/v1/home');
    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    assert.equal(response.body.data.hero.enabled, true);
    assert.ok(response.body.data.hero.plates.length >= 1);
    assert.equal(response.body.data.promise.title.includes('chamber'), true);

    const stored = await HomePageConfig.findOne({ key: 'home' });
    assert.ok(stored);
  });

  it('returns admin home and accepts PATCH for a section', async () => {
    const getResponse = await request('/api/v1/admin/home', {
      headers: jsonHeaders(adminToken),
    });
    assert.equal(getResponse.status, 200);
    assert.equal(getResponse.body.data.key, 'home');

    const patchResponse = await request('/api/v1/admin/home', {
      method: 'PATCH',
      headers: jsonHeaders(adminToken),
      body: JSON.stringify({
        hero: {
          ...getResponse.body.data.hero,
          brand: 'ArchiveX CMS',
          headlineLine1: 'Edited',
          plateProductIds: [productId],
        },
        signatures: {
          ...getResponse.body.data.signatures,
          title: 'Edited signatures',
        },
        editorial: {
          ...getResponse.body.data.editorial,
          articleId,
          cta: 'Read pinned',
        },
        featured: {
          enabled: true,
          slots: [
            {
              productId,
              productType: 'car',
              eyebrow: 'Plate · Test',
              flipped: false,
            },
          ],
        },
      }),
    });

    assert.equal(patchResponse.status, 200);
    assert.equal(patchResponse.body.data.hero.brand, 'ArchiveX CMS');
    assert.equal(patchResponse.body.data.hero.headlineLine1, 'Edited');
    assert.deepEqual(patchResponse.body.data.hero.plateProductIds, [productId]);
    assert.equal(patchResponse.body.data.signatures.title, 'Edited signatures');
    assert.equal(patchResponse.body.data.editorial.articleId, articleId);
  });

  it('hydrates public home from pinned product and article', async () => {
    const response = await request('/api/v1/home');
    assert.equal(response.status, 200);
    const { hero, featured, editorial, signatures } = response.body.data;
    assert.equal(signatures.title, 'Edited signatures');
    assert.ok(hero.plates.some((plate) => plate.slug === 'ferrari-f40-home'));
    assert.equal(featured.slots[0]?.product?.slug, 'ferrari-f40-home');
    assert.equal(editorial.title, 'Home essay');
    assert.equal(editorial.cta, 'Read pinned');
    assert.equal(editorial.href, '/journal/home-essay');
  });

  it('honours disabled sections in public payload', async () => {
    const patchResponse = await request('/api/v1/admin/home', {
      method: 'PATCH',
      headers: jsonHeaders(adminToken),
      body: JSON.stringify({
        brands: { enabled: false, label: 'Hidden brands', ctaLabel: 'X', ctaHref: '/brands' },
      }),
    });
    assert.equal(patchResponse.status, 200);
    assert.equal(patchResponse.body.data.brands.enabled, false);

    const publicResponse = await request('/api/v1/home');
    assert.equal(publicResponse.body.data.brands.enabled, false);
  });

  it('rejects non-staff from admin home', async () => {
    const response = await request('/api/v1/admin/home');
    assert.equal(response.status, 401);
  });
});
