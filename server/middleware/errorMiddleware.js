import { errorResponse } from '../utils/response.js';
import env from '../config/env.js';

// eslint-disable-next-line no-unused-vars
export function errorMiddleware(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const code = err.code || (statusCode === 404 ? 'NOT_FOUND' : 'INTERNAL_ERROR');
  const message =
    statusCode >= 500 && env.nodeEnv === 'production'
      ? 'An unexpected error occurred'
      : err.message || 'An unexpected error occurred';

  if (statusCode >= 500) {
    console.error(`[error] ${req.requestId || 'unknown'}`, err);
  }

  return errorResponse(
    res,
    {
      statusCode,
      code,
      message,
      details: err.details,
    },
    req.requestId
  );
}

export default errorMiddleware;
