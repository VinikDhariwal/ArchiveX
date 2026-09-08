import { ApiError } from '../utils/ApiError.js';

export function notFoundMiddleware(req, res, next) {
  next(new ApiError(`Route not found: ${req.method} ${req.originalUrl}`, 404, 'NOT_FOUND'));
}

export default notFoundMiddleware;
