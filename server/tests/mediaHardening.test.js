import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcryptjs';
import request from '../testSupport/http.js';
import { User } from '../models/index.js';

describe('Media hardening', () => {
  /** @type {MongoMemoryServer} */
  let mongod;
  let adminToken;

  before(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri(), { dbName: 'archivex-media-hardening-test' });
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';

    const passwordHash = await bcrypt.hash('password123', 10);
    await User.create({
      name: 'Media Admin',
      firstName: 'Media',
      lastName: 'Admin',
      username: 'media_admin',
      email: 'media-admin@test.local',
      passwordHash,
      role: 'admin',
      status: 'active',
    });

    const login = await request('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: 'media-admin@test.local',
        password: 'password123',
        staffOnly: true,
      }),
    });
    assert.equal(login.status, 200);
    adminToken = login.body.data.accessToken;
  });

  after(async () => {
    await mongoose.disconnect();
    if (mongod) await mongod.stop();
  });

  it('rejects SVG uploads (stored-XSS vector)', async () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>';
    const form = new FormData();
    form.append('file', new Blob([svg], { type: 'image/svg+xml' }), 'evil.svg');

    const response = await request('/api/v1/admin/media/upload', {
      method: 'POST',
      headers: { authorization: `Bearer ${adminToken}` },
      body: form,
    });

    assert.equal(response.status, 400);
    assert.equal(response.body.error?.code, 'INVALID_MEDIA_TYPE');
  });

  it('rejects non-image MIME types on upload', async () => {
    const form = new FormData();
    form.append('file', new Blob(['<html></html>'], { type: 'text/html' }), 'page.html');

    const response = await request('/api/v1/admin/media/upload', {
      method: 'POST',
      headers: { authorization: `Bearer ${adminToken}` },
      body: form,
    });

    assert.equal(response.status, 400);
    assert.equal(response.body.error?.code, 'INVALID_MEDIA_TYPE');
  });

  it('rejects non-http(s) URLs when registering remote media', async () => {
    for (const url of ['javascript:alert(1)', 'data:text/html,<script>1</script>', 'file:///etc/passwd']) {
      const response = await request('/api/v1/admin/media/url', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ url }),
      });
      assert.equal(response.status, 400, `${url} was accepted`);
      assert.equal(response.body.error?.code, 'INVALID_URL');
    }
  });

  it('still accepts valid https remote media URLs', async () => {
    const response = await request('/api/v1/admin/media/url', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ url: 'https://example.com/photo.jpg', alt: 'Photo' }),
    });
    assert.equal(response.status, 201);
    assert.equal(response.body.data.storage, 'remote');
  });

  it('returns 400 (not 500) when deleting media with a malformed id', async () => {
    const response = await request('/api/v1/admin/media/not-an-object-id', {
      method: 'DELETE',
      headers: { authorization: `Bearer ${adminToken}` },
    });
    assert.equal(response.status, 400);
    assert.equal(response.body.error?.code, 'INVALID_ID');
  });

  it('stops streaming soft-deleted media assets', async () => {
    const created = await request('/api/v1/admin/media/url', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ url: 'https://example.com/vanish.jpg', alt: 'Vanish' }),
    });
    assert.equal(created.status, 201);
    const mediaId = created.body.data.id;

    const del = await request(`/api/v1/admin/media/${mediaId}`, {
      method: 'DELETE',
      headers: { authorization: `Bearer ${adminToken}` },
    });
    assert.equal(del.status, 200);

    const stream = await request(`/api/v1/media/files/${mediaId}`);
    assert.equal(stream.status, 404);
  });
});
