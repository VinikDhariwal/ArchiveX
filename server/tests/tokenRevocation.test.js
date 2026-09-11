import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcryptjs';
import request from '../testSupport/http.js';
import { User } from '../models/index.js';

const auth = (token) => ({ authorization: `Bearer ${token}` });

async function login(email, password = 'password123') {
  const response = await request('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  assert.equal(response.status, 200, `login failed for ${email}`);
  return response.body.data.accessToken;
}

describe('Access token revocation', () => {
  /** @type {MongoMemoryServer} */
  let mongod;

  before(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri(), { dbName: 'archivex-token-revocation-test' });
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';

    const passwordHash = await bcrypt.hash('password123', 10);
    for (const [first, email] of [
      ['Logout', 'logout@test.local'],
      ['Disabled', 'disabled@test.local'],
    ]) {
      await User.create({
        name: `${first} Case`,
        firstName: first,
        lastName: 'Case',
        username: `${first.toLowerCase()}_case`,
        email,
        passwordHash,
        role: 'user',
        status: 'active',
      });
    }
  });

  after(async () => {
    await mongoose.disconnect();
    if (mongod) await mongod.stop();
  });

  it('logout revokes the access token immediately', async () => {
    const token = await login('logout@test.local');

    const beforeLogout = await request('/api/v1/favorites', { headers: auth(token) });
    assert.equal(beforeLogout.status, 200);

    const logout = await request('/api/v1/auth/logout', {
      method: 'POST',
      headers: auth(token),
    });
    assert.equal(logout.status, 200);

    const afterLogout = await request('/api/v1/favorites', { headers: auth(token) });
    assert.equal(afterLogout.status, 401);
    assert.equal(afterLogout.body.error?.code, 'TOKEN_REVOKED');
  });

  it('disabling an account revokes its access token immediately', async () => {
    const token = await login('disabled@test.local');

    const beforeDisable = await request('/api/v1/auth/me', { headers: auth(token) });
    assert.equal(beforeDisable.status, 200);

    await User.updateOne({ email: 'disabled@test.local' }, { status: 'disabled' });

    const afterDisable = await request('/api/v1/favorites', { headers: auth(token) });
    assert.equal(afterDisable.status, 401);
  });

  it('optionalAuth treats a revoked token as anonymous instead of failing', async () => {
    // The logout test above revoked this token; recently-viewed uses optionalAuth.
    const token = await login('logout@test.local');
    await request('/api/v1/auth/logout', { method: 'POST', headers: auth(token) });

    const response = await request('/api/v1/products/recently-viewed?sessionKey=anon-probe', {
      headers: auth(token),
    });
    assert.equal(response.status, 200);
    assert.deepEqual(response.body.data, []);
  });
});
