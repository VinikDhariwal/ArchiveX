import assert from 'node:assert/strict';
import test from 'node:test';
import request from '../testSupport/http.js';

test('GET /api/v1/health returns success payload', async () => {
  const response = await request('/api/v1/health');
  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.data.status, 'ok');
});
