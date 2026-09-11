import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from '../testSupport/http.js';
import { User } from '../models/index.js';
import bcrypt from 'bcryptjs';

describe('Phase 6 auth APIs', () => {
  /** @type {MongoMemoryServer} */
  let mongod;

  before(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri(), { dbName: 'archivex-auth-test' });
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
  });

  after(async () => {
    await mongoose.disconnect();
    if (mongod) await mongod.stop();
  });

  it('registers a collector account with first/last name and username', async () => {
    const response = await request('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'Collector',
        username: 'test_collector',
        email: 'collector@test.local',
        password: 'password123',
      }),
    });

    assert.equal(response.status, 201);
    assert.equal(response.body.data.user.role, 'user');
    assert.equal(response.body.data.user.username, 'test_collector');
    assert.equal(response.body.data.user.firstName, 'Test');
    assert.equal(response.body.data.user.lastName, 'Collector');
    assert.equal(response.body.data.user.name, 'Test Collector');
    assert.ok(response.body.data.accessToken);
  });

  it('rejects duplicate usernames', async () => {
    const response = await request('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Other',
        lastName: 'Person',
        username: 'test_collector',
        email: 'other@test.local',
        password: 'password123',
      }),
    });

    assert.equal(response.status, 409);
    assert.equal(response.body.error?.code, 'USERNAME_IN_USE');
  });

  it('rejects staff-only login for collector accounts', async () => {
    const response = await request('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: 'collector@test.local',
        password: 'password123',
        staffOnly: true,
      }),
    });

    assert.equal(response.status, 403);
    assert.equal(response.body.error?.code, 'STAFF_REQUIRED');
  });

  it('logs in with valid credentials', async () => {
    const hash = await bcrypt.hash('password123', 10);
    await User.create({
      name: 'Login User',
      firstName: 'Login',
      lastName: 'User',
      username: 'login_user',
      email: 'login@test.local',
      passwordHash: hash,
      role: 'user',
      status: 'active',
    });

    const response = await request('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: 'login@test.local',
        password: 'password123',
      }),
    });

    assert.equal(response.status, 200);
    assert.ok(response.body.data.accessToken);
  });

  it('rejects invalid login', async () => {
    const response = await request('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: 'login@test.local',
        password: 'wrong-password',
      }),
    });

    assert.equal(response.status, 401);
    assert.equal(response.body.error?.code, 'INVALID_CREDENTIALS');
  });

  it('reports when login email has no account', async () => {
    const response = await request('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: 'missing@test.local',
        password: 'password123',
      }),
    });

    assert.equal(response.status, 404);
    assert.equal(response.body.error?.code, 'ACCOUNT_NOT_FOUND');
  });

  it('returns me for authenticated users', async () => {
    const login = await request('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: 'login@test.local',
        password: 'password123',
      }),
    });

    const response = await request('/api/v1/auth/me', {
      headers: {
        authorization: `Bearer ${login.body.data.accessToken}`,
      },
    });

    assert.equal(response.status, 200);
    assert.equal(response.body.data.user.email, 'login@test.local');
    assert.equal(response.body.data.user.username, 'login_user');
  });

  it('requires auth for /me', async () => {
    const response = await request('/api/v1/auth/me');
    assert.equal(response.status, 401);
  });
});
