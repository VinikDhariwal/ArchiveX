import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcryptjs';
import request from '../testSupport/http.js';
import { User } from '../models/index.js';
import { getUploadRoot } from '../services/mediaService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturePath = path.join(__dirname, 'fixtures', 'plate.png');

function tinyPngBuffer() {
  // 1x1 PNG
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

    fs.mkdirSync(path.dirname(fixturePath), { recursive: true });
    fs.writeFileSync(fixturePath, tinyPngBuffer());

    const passwordHash = await bcrypt.hash('ArchiveX!admin', 10);
    await User.create({
      name: 'Admin',
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
    try {
      fs.rmSync(path.dirname(fixturePath), { recursive: true, force: true });
    } catch {
      /* ignore */
    }
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
    assert.equal(response.body.data.type, 'hero');
  });

  it('uploads an image file into the media library', async () => {
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
    assert.match(response.body.data.url, /\/media\//);
    assert.equal(response.body.data.type, 'gallery');

    const filename = response.body.data.filename;
    const diskPath = path.join(getUploadRoot(), filename);
    assert.equal(fs.existsSync(diskPath), true);
  });

  it('lists media assets for staff', async () => {
    const response = await request('/api/v1/admin/media', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(response.status, 200);
    assert.ok(response.body.data.length >= 2);
  });
});
