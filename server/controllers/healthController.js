import { successResponse } from '../utils/response.js';
import { getDatabaseStatus } from '../config/database.js';
import env from '../config/env.js';

export function getHealth(req, res) {
  return successResponse(res, {
    status: 'ok',
    service: env.apiServiceId,
    version: env.apiVersion,
    timestamp: new Date().toISOString(),
    database: getDatabaseStatus(),
  });
}
