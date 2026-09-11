import { Router } from 'express';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import asyncHandler from '../utils/asyncHandler.js';
import { successResponse } from '../utils/response.js';

const router = Router();

const __dirname = dirname(fileURLToPath(import.meta.url));
const OPENAPI_PATH = join(__dirname, '../../docs/openapi.json');

let cachedDocument = null;

function loadOpenApiDocument() {
  if (!cachedDocument) {
    cachedDocument = JSON.parse(readFileSync(OPENAPI_PATH, 'utf8'));
  }
  return cachedDocument;
}

/** Machine-readable OpenAPI 3.0 document (raw JSON, not success envelope). */
router.get(
  '/openapi.json',
  asyncHandler(async (_req, res) => {
    const document = loadOpenApiDocument();
    res.type('application/json').status(200).send(document);
  })
);

/** Discoverability helper for humans and clients. */
router.get(
  '/docs',
  asyncHandler(async (_req, res) => {
    return successResponse(res, {
      title: 'ArchiveX API documentation',
      openapi: '/api/v1/openapi.json',
      reference: 'See docs/API.md and docs/openapi.json in the repository',
      version: loadOpenApiDocument().info?.version || '1.0.0',
    });
  })
);

export default router;
