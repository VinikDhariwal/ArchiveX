import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcryptjs';
import request from '../testSupport/http.js';
import { User } from '../models/index.js';
import { hashPassword } from '../utils/password.js';

describe('Phase 18 security hardening', () => {
  /** @type {MongoMemoryServer} */
  let mongod;

  before(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri(), { dbName: 'archivex-phase18-test' });
    process.env.JWT_ACCESS_SECRET = 'test-access-secret-phase18-xxxxxxxx';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-phase18-xxxxxxx';
    process.env.RATE_LIMIT_ENABLED = 'true';
    process.env.RATE_LIMIT_AUTH_MAX = '5';

    const passwordHash = await hashPassword('password123');
    await User.create({
      name: 'Secure User',
      firstName: 'Secure',
      lastName: 'User',
      username: 'secure_user',
      email: 'secure@test.local',
      passwordHash,
      role: 'user',
      status: 'active',
    });
  });

  after(async () => {
    process.env.RATE_LIMIT_ENABLED = 'false';
    delete process.env.RATE_LIMIT_AUTH_MAX;
    await mongoose.disconnect();
    if (mongod) await mongod.stop();
  });

  it('stores only bcrypt digests for passwords (never plaintext)', async () => {
    const user = await User.findOne({ email: 'secure@test.local' }).select('+passwordHash');
    assert.ok(user.passwordHash);
    assert.notEqual(user.passwordHash, 'password123');
    assert.match(user.passwordHash, /^\$2[aby]\$\d{2}\$/);
    assert.equal(await bcrypt.compare('password123', user.passwordHash), true);
  });

  it('omits passwordHash from default queries', async () => {
    const user = await User.findOne({ email: 'secure@test.local' }).lean();
    assert.equal(user.passwordHash, undefined);
  });

  it('rejects oversized passwords on register', async () => {
    const response = await request('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Too',
        lastName: 'Long',
        username: 'toolong_pw',
        email: 'toolong@test.local',
        password: 'x'.repeat(73),
      }),
    });
    assert.equal(response.status, 400);
    assert.equal(response.body.error?.code, 'VALIDATION_ERROR');
  });

  it('rate-limits repeated auth attempts', async () => {
    let limited = null;
    for (let i = 0; i < 8; i += 1) {
      const response = await request('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: 'missing-rate@test.local',
          password: 'password123',
        }),
      });
      if (response.status === 429) {
        limited = response;
        break;
      }
    }
    assert.ok(limited, 'expected 429 after auth rate ceiling');
    assert.equal(limited.body.error?.code, 'RATE_LIMITED');
  });
});
