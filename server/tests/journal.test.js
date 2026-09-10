import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from '../testSupport/http.js';
import { Article, Brand, Product } from '../models/index.js';

describe('Phase 10 journal APIs', () => {
  /** @type {MongoMemoryServer} */
  let mongod;
  let ferrariId;
  let f40Id;

  before(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri(), { dbName: 'archivex-journal-test' });

    const ferrari = await Brand.create({
      name: 'Ferrari',
      slug: 'ferrari',
      primaryDomains: ['car'],
      status: 'active',
    });
    ferrariId = String(ferrari._id);

    const f40 = await Product.create({
      name: 'Ferrari F40',
      slug: 'ferrari-f40',
      productType: 'car',
      brand: ferrari._id,
      shortDescription: 'Twin-turbo legend',
      status: 'approved',
      rarity: 'ICONIC',
    });
    f40Id = String(f40._id);

    await Product.create({
      name: 'Pending Plate',
      slug: 'pending-plate',
      productType: 'car',
      brand: ferrari._id,
      status: 'pending',
    });

    await Article.create({
      title: 'The private garage as museum',
      slug: 'the-private-garage-as-museum',
      articleType: 'Archive Essay',
      excerpt: 'How collectors curate mechanical memory beyond the sales floor.',
      featured: true,
      domains: ['car'],
      relatedProducts: [f40._id],
      heroImage: {
        url: 'https://images.unsplash.com/photo-1726739569681-14cc0392b4bc',
        alt: 'Garage atmosphere',
        type: 'editorial',
        width: 1200,
        height: 750,
      },
      sections: [
        {
          heading: 'A quieter inventory',
          body: 'Collectors begin with a room that holds machines like evidence.',
        },
      ],
      status: 'approved',
      publishedAt: new Date('2026-09-09T16:00:00.000Z'),
    });

    await Article.create({
      title: 'Draft only',
      slug: 'draft-only',
      articleType: 'Collector Note',
      excerpt: 'Should never appear publicly.',
      relatedProducts: [f40._id],
      sections: [{ body: 'Hidden draft.' }],
      status: 'draft',
      publishedAt: null,
    });

    await Article.create({
      title: 'Italian superbike memory',
      slug: 'italian-superbike-memory',
      articleType: 'Model History',
      excerpt: 'Form, sound, and racing inheritance.',
      domains: ['motorcycle'],
      sections: [{ body: 'Bologna craft and track myth.' }],
      status: 'approved',
      publishedAt: new Date('2026-09-08T16:00:00.000Z'),
    });
  });

  after(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  it('GET /articles returns approved essays only', async () => {
    const response = await request('/api/v1/articles');
    assert.equal(response.status, 200);
    assert.ok(Array.isArray(response.body.data));
    assert.equal(response.body.data.length, 2);
    assert.ok(response.body.data.every((item) => item.slug !== 'draft-only'));
    assert.equal(response.body.data[0].slug, 'the-private-garage-as-museum');
    assert.equal(response.body.data[0].type, 'Archive Essay');
    assert.ok(response.body.data[0].image?.url);
  });

  it('GET /articles filters by domain', async () => {
    const response = await request('/api/v1/articles?domain=motorcycle');
    assert.equal(response.status, 200);
    assert.equal(response.body.data.length, 1);
    assert.equal(response.body.data[0].slug, 'italian-superbike-memory');
  });

  it('GET /articles/:slug returns essay with related approved products', async () => {
    const response = await request('/api/v1/articles/the-private-garage-as-museum');
    assert.equal(response.status, 200);
    assert.equal(response.body.data.slug, 'the-private-garage-as-museum');
    assert.ok(response.body.data.sections?.length);
    assert.ok(response.body.data.relatedProducts.some((item) => item.id === f40Id));
    assert.ok(!response.body.data.relatedProducts.some((item) => item.status === 'pending'));
  });

  it('GET /articles/:slug hides draft essays', async () => {
    const response = await request('/api/v1/articles/draft-only');
    assert.equal(response.status, 404);
  });

  it('GET /products/:id/journal returns linked approved essays', async () => {
    const response = await request(`/api/v1/products/${f40Id}/journal`);
    assert.equal(response.status, 200);
    assert.equal(response.body.data.length, 1);
    assert.equal(response.body.data[0].slug, 'the-private-garage-as-museum');
    assert.equal(response.body.meta.total, 1);
    assert.equal(response.body.meta.note, undefined);
    assert.ok(ferrariId);
  });
});
