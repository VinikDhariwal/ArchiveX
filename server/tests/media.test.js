import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcryptjs';
import request from '../testSupport/http.js';
import { MediaAsset, User } from '../models/index.js';

function tinyPngBuffer() {
  return Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64'
  );
}

const jsonHeaders = (token) => ({
  'content-type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

describe('Phase 14 media APIs', () => {
  /** @type {MongoMemoryServer} */
  let mongod;
  let adminToken;

  before(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri(), { dbName: 'archivex-media-test' });
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    process.env.PUBLIC_ORIGIN = 'http://127.0.0.1:5001';

    const passwordHash = await bcrypt.hash('ArchiveX!admin', 10);
    await User.create({
      name: 'Admin',
      firstName: 'Media',
      lastName: 'Admin',
      username: 'media_admin',
      email: 'admin@media.test',
      passwordHash,
      role: 'admin',
      status: 'active',
    });

    const login = await request('/api/v1/auth/login', {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify({ email: 'admin@media.test', password: 'ArchiveX!admin' }),
    });
    adminToken = login.body.data.accessToken;
  });

  after(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  it('registers a remote media URL', async () => {
    const response = await request('/api/v1/admin/media/url', {
      method: 'POST',
      headers: jsonHeaders(adminToken),
      body: JSON.stringify({
        url: 'https://images.example.com/plates/f40.jpg',
        alt: 'Ferrari F40',
        type: 'hero',
      }),
    });
    assert.equal(response.status, 201);
    assert.equal(response.body.data.url, 'https://images.example.com/plates/f40.jpg');
    assert.equal(response.body.data.storage, 'remote');
  });

  it('uploads an image into Atlas GridFS and streams it back', async () => {
    const form = new FormData();
    const blob = new Blob([tinyPngBuffer()], { type: 'image/png' });
    form.append('file', blob, 'plate.png');
    form.append('alt', 'Archive plate');
    form.append('type', 'gallery');

    const response = await request('/api/v1/admin/media/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: form,
    });

    assert.equal(response.status, 201);
    assert.equal(response.body.data.storage, 'atlas');
    assert.match(response.body.data.url, /\/api\/v1\/media\/files\//);

    const asset = await MediaAsset.findById(response.body.data.id).lean();
    assert.ok(asset.gridFsId);

    const files = await mongoose.connection.db
      .collection('archivex_media.files')
      .find({ _id: asset.gridFsId })
      .toArray();
    assert.equal(files.length, 1);

    // Stream endpoint should return the PNG bytes (not JSON).
    const app = (await import('../app.js')).default;
    const binary = await new Promise((resolve, reject) => {
      const server = app.listen(0, async () => {
        try {
          const { port } = server.address();
          const res = await fetch(
            `http://127.0.0.1:${port}/api/v1/media/files/${response.body.data.id}`
          );
          const buffer = Buffer.from(await res.arrayBuffer());
          resolve({ status: res.status, contentType: res.headers.get('content-type'), buffer });
        } catch (error) {
          reject(error);
        } finally {
          server.close();
        }
      });
    });
    assert.equal(binary.status, 200);
    assert.match(binary.contentType || '', /image\/png/);
    assert.ok(binary.buffer.length > 0);
  });

  it('lists media assets for staff', async () => {
    const response = await request('/api/v1/admin/media', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(response.status, 200);
    assert.ok(response.body.data.length >= 2);
  });
});
