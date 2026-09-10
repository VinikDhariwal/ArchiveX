import { errorResponse } from '../utils/response.js';
import env from '../config/env.js';
import multer from 'multer';

// eslint-disable-next-line no-unused-vars
export function errorMiddleware(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let code = err.code || (statusCode === 404 ? 'NOT_FOUND' : 'INTERNAL_ERROR');
  let message =
    statusCode >= 500 && env.nodeEnv === 'production'
      ? 'An unexpected error occurred'
      : err.message || 'An unexpected error occurred';

  if (err instanceof multer.MulterError) {
    statusCode = 400;
    code = 'UPLOAD_ERROR';
    message = err.code === 'LIMIT_FILE_SIZE' ? 'Image exceeds the 5MB upload limit' : err.message;
  }

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
