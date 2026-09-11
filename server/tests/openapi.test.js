import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import request from '../testSupport/http.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OPENAPI_PATH = join(__dirname, '../../docs/openapi.json');

describe('Phase 16 API documentation', () => {
  it('ships a valid OpenAPI 3.0 document covering core surfaces', () => {
    const doc = JSON.parse(readFileSync(OPENAPI_PATH, 'utf8'));

    assert.equal(doc.openapi, '3.0.3');
    assert.equal(doc.info?.title, 'ArchiveX API');
    assert.ok(doc.paths['/health']?.get);
    assert.ok(doc.paths['/auth/login']?.post);
    assert.ok(doc.paths['/products']?.get);
    assert.ok(doc.paths['/favorites']?.get);
    assert.ok(doc.paths['/contributions/products']?.post);
    assert.ok(doc.paths['/admin/analytics']?.get);
    assert.ok(doc.paths['/openapi.json']?.get);
    assert.ok(doc.components?.securitySchemes?.bearerAuth);

    const operationCount = Object.values(doc.paths).reduce(
      (count, pathItem) =>
        count +
        Object.keys(pathItem).filter((method) =>
          ['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'trace'].includes(method)
        ).length,
      0
    );
    assert.ok(operationCount >= 60, `expected ≥60 operations, got ${operationCount}`);
  });

  it('serves OpenAPI JSON and docs index publicly', async () => {
    const openapi = await request('/api/v1/openapi.json');
    assert.equal(openapi.status, 200);
    assert.equal(openapi.body.openapi, '3.0.3');
    assert.ok(openapi.body.paths['/health']);

    const docs = await request('/api/v1/docs');
    assert.equal(docs.status, 200);
    assert.equal(docs.body.success, true);
    assert.equal(docs.body.data.openapi, '/api/v1/openapi.json');
  });
});
