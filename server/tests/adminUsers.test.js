import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcryptjs';
import request from '../testSupport/http.js';
import { User } from '../models/index.js';

const json = (token) => ({
  'content-type': 'application/json',
  ...(token ? { authorization: `Bearer ${token}` } : {}),
});

async function login(email, password = 'password123') {
  const response = await request('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password, staffOnly: true }),
  });
  assert.equal(response.status, 200, `login failed for ${email}`);
  return response.body.data.accessToken;
}

describe('Admin user management privilege ceiling', () => {
  /** @type {MongoMemoryServer} */
  let mongod;
  let adminToken;
  let superToken;
  let adminId;
  let superId;
  let collectorId;

  before(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri(), { dbName: 'archivex-admin-users-test' });
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';

    const passwordHash = await bcrypt.hash('password123', 10);
    const admin = await User.create({
      name: 'Plain Admin',
      firstName: 'Plain',
      lastName: 'Admin',
      username: 'plain_admin',
      email: 'admin@test.local',
      passwordHash,
      role: 'admin',
      status: 'active',
    });
    adminId = String(admin._id);

    const superadmin = await User.create({
      name: 'Root Admin',
      firstName: 'Root',
      lastName: 'Admin',
      username: 'root_admin',
      email: 'super@test.local',
      passwordHash,
      role: 'superadmin',
      status: 'active',
    });
    superId = String(superadmin._id);

    const collector = await User.create({
      name: 'Plain Collector',
      firstName: 'Plain',
      lastName: 'Collector',
      username: 'plain_collector',
      email: 'collector@test.local',
      passwordHash,
      role: 'user',
      status: 'active',
    });
    collectorId = String(collector._id);

    adminToken = await login('admin@test.local');
    superToken = await login('super@test.local');
  });

  after(async () => {
    await mongoose.disconnect();
    if (mongod) await mongod.stop();
  });

  it('blocks an admin from creating a superadmin account', async () => {
    const response = await request('/api/v1/admin/users', {
      method: 'POST',
      headers: json(adminToken),
      body: JSON.stringify({
        firstName: 'Sneaky',
        lastName: 'Escalation',
        email: 'sneaky@test.local',
        password: 'password123',
        role: 'superadmin',
      }),
    });

    assert.equal(response.status, 403);
    assert.equal(response.body.error?.code, 'FORBIDDEN');
    const created = await User.findOne({ email: 'sneaky@test.local' });
    assert.equal(created, null);
  });

  it('blocks an admin from promoting a user to superadmin', async () => {
    const response = await request(`/api/v1/admin/users/${collectorId}`, {
      method: 'PATCH',
      headers: json(adminToken),
      body: JSON.stringify({ role: 'superadmin' }),
    });

    assert.equal(response.status, 403);
    const user = await User.findById(collectorId);
    assert.equal(user.role, 'user');
  });

  it('blocks an admin from modifying an existing superadmin', async () => {
    const demote = await request(`/api/v1/admin/users/${superId}`, {
      method: 'PATCH',
      headers: json(adminToken),
      body: JSON.stringify({ role: 'user' }),
    });
    assert.equal(demote.status, 403);

    const disable = await request(`/api/v1/admin/users/${superId}`, {
      method: 'PATCH',
      headers: json(adminToken),
      body: JSON.stringify({ status: 'disabled' }),
    });
    assert.equal(disable.status, 403);

    const untouched = await User.findById(superId);
    assert.equal(untouched.role, 'superadmin');
    assert.equal(untouched.status, 'active');
  });

  it('blocks staff from changing their own role or status', async () => {
    const response = await request(`/api/v1/admin/users/${adminId}`, {
      method: 'PATCH',
      headers: json(adminToken),
      body: JSON.stringify({ role: 'superadmin' }),
    });
    assert.equal(response.status, 403);

    const self = await User.findById(adminId);
    assert.equal(self.role, 'admin');
  });

  it('still allows an admin to manage non-superadmin users', async () => {
    const promote = await request(`/api/v1/admin/users/${collectorId}`, {
      method: 'PATCH',
      headers: json(adminToken),
      body: JSON.stringify({ role: 'editor' }),
    });
    assert.equal(promote.status, 200);
    assert.equal(promote.body.data.role, 'editor');

    const demote = await request(`/api/v1/admin/users/${collectorId}`, {
      method: 'PATCH',
      headers: json(adminToken),
      body: JSON.stringify({ role: 'user' }),
    });
    assert.equal(demote.status, 200);
    assert.equal(demote.body.data.role, 'user');
  });

  it('allows a superadmin to create and manage superadmin accounts', async () => {
    const create = await request('/api/v1/admin/users', {
      method: 'POST',
      headers: json(superToken),
      body: JSON.stringify({
        firstName: 'Second',
        lastName: 'Root',
        email: 'root2@test.local',
        password: 'password123',
        role: 'superadmin',
      }),
    });
    assert.equal(create.status, 201);
    assert.equal(create.body.data.role, 'superadmin');

    const demote = await request(`/api/v1/admin/users/${create.body.data.id}`, {
      method: 'PATCH',
      headers: json(superToken),
      body: JSON.stringify({ role: 'admin' }),
    });
    assert.equal(demote.status, 200);
    assert.equal(demote.body.data.role, 'admin');
  });
});
