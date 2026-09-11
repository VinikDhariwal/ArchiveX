import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcryptjs';
import request, { cookieHeader } from '../testSupport/http.js';
import { User } from '../models/index.js';

describe('Phase 17 auth account APIs', () => {
  /** @type {MongoMemoryServer} */
  let mongod;
  let accessToken;
  let refreshCookie;

  before(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri(), { dbName: 'archivex-auth-account-test' });
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';

    const passwordHash = await bcrypt.hash('password123', 10);
    await User.create({
      name: 'Account Owner',
      firstName: 'Account',
      lastName: 'Owner',
      username: 'account_owner',
      email: 'owner@test.local',
      passwordHash,
      role: 'user',
      status: 'active',
    });

    const login = await request('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: 'owner@test.local',
        password: 'password123',
      }),
    });

    assert.equal(login.status, 200);
    accessToken = login.body.data.accessToken;
    refreshCookie = login.cookies.archivex_refresh;
    assert.ok(refreshCookie, 'expected refresh cookie on login');
  });

  after(async () => {
    await mongoose.disconnect();
    if (mongod) await mongod.stop();
  });

  it('updates profile first/last name and username', async () => {
    const response = await request('/api/v1/auth/me', {
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        firstName: 'Ada',
        lastName: 'Lovelace',
        username: 'Ada.Lovelace',
      }),
    });

    assert.equal(response.status, 200);
    assert.equal(response.body.data.user.firstName, 'Ada');
    assert.equal(response.body.data.user.lastName, 'Lovelace');
    assert.equal(response.body.data.user.username, 'Ada.Lovelace');
    assert.equal(response.body.data.user.name, 'Ada Lovelace');
  });

  it('changes email with current password', async () => {
    const response = await request('/api/v1/auth/me/email', {
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        email: 'ada@test.local',
        password: 'password123',
      }),
    });

    assert.equal(response.status, 200);
    assert.equal(response.body.data.user.email, 'ada@test.local');
  });

  it('rejects email change with wrong password', async () => {
    const response = await request('/api/v1/auth/me/email', {
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        email: 'other@test.local',
        password: 'wrong-password',
      }),
    });

    assert.equal(response.status, 401);
    assert.equal(response.body.error?.code, 'INVALID_CREDENTIALS');
  });

  it('changes password and reissues tokens', async () => {
    const response = await request('/api/v1/auth/me/password', {
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        currentPassword: 'password123',
        newPassword: 'password456',
      }),
    });

    assert.equal(response.status, 200);
    assert.ok(response.body.data.accessToken);
    assert.ok(response.cookies.archivex_refresh);

    accessToken = response.body.data.accessToken;
    refreshCookie = response.cookies.archivex_refresh;

    const oldLogin = await request('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: 'ada@test.local',
        password: 'password123',
      }),
    });
    assert.equal(oldLogin.status, 401);

    const newLogin = await request('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: 'ada@test.local',
        password: 'password456',
      }),
    });
    assert.equal(newLogin.status, 200);
    accessToken = newLogin.body.data.accessToken;
    refreshCookie = newLogin.cookies.archivex_refresh;
  });

  it('refreshes access token from refresh cookie', async () => {
    const response = await request('/api/v1/auth/refresh', {
      method: 'POST',
      headers: {
        cookie: cookieHeader({ archivex_refresh: refreshCookie }),
      },
    });

    assert.equal(response.status, 200);
    assert.ok(response.body.data.accessToken);
    assert.equal(response.body.data.user.email, 'ada@test.local');
    assert.ok(response.cookies.archivex_refresh);
    accessToken = response.body.data.accessToken;
    refreshCookie = response.cookies.archivex_refresh;
  });

  it('logs out and clears refresh cookie', async () => {
    const response = await request('/api/v1/auth/logout', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${accessToken}`,
        cookie: cookieHeader({ archivex_refresh: refreshCookie }),
      },
    });

    assert.equal(response.status, 200);
    assert.equal(response.body.data.ok, true);

    const refresh = await request('/api/v1/auth/refresh', {
      method: 'POST',
      headers: {
        cookie: cookieHeader({ archivex_refresh: refreshCookie }),
      },
    });
    assert.equal(refresh.status, 401);
  });

  it('soft-deletes collector account with username + password', async () => {
    const login = await request('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: 'ada@test.local',
        password: 'password456',
      }),
    });
    assert.equal(login.status, 200);
    const token = login.body.data.accessToken;
    const username = login.body.data.user.username;

    const deleted = await request('/api/v1/auth/me', {
      method: 'DELETE',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        confirmUsername: username,
        password: 'password456',
      }),
    });

    assert.equal(deleted.status, 200);
    assert.equal(deleted.body.data.ok, true);

    const again = await request('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: 'ada@test.local',
        password: 'password456',
      }),
    });
    assert.ok([401, 404].includes(again.status));
  });

  it('blocks staff self-delete via collector delete endpoint', async () => {
    const passwordHash = await bcrypt.hash('password123', 10);
    await User.create({
      name: 'Staff User',
      firstName: 'Staff',
      lastName: 'User',
      username: 'staff_user',
      email: 'staff@test.local',
      passwordHash,
      role: 'admin',
      status: 'active',
    });

    const login = await request('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: 'staff@test.local',
        password: 'password123',
        staffOnly: true,
      }),
    });
    assert.equal(login.status, 200);

    const response = await request('/api/v1/auth/me', {
      method: 'DELETE',
      headers: {
        authorization: `Bearer ${login.body.data.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        confirmUsername: 'staff_user',
        password: 'password123',
      }),
    });

    assert.equal(response.status, 403);
    assert.equal(response.body.error?.code, 'STAFF_DELETE_FORBIDDEN');
  });
});
