export function successResponse(res, data = null, meta = undefined, statusCode = 200) {
  const payload = {
    success: true,
    data,
  };

  if (meta !== undefined) {
    payload.meta = meta;
  }

  return res.status(statusCode).json(payload);
}

export function errorResponse(res, error, requestId) {
  const statusCode = error.statusCode || 500;
  const payload = {
    success: false,
    error: {
      code: error.code || 'INTERNAL_ERROR',
      message: error.message || 'An unexpected error occurred',
    },
  };

  if (error.details) {
    payload.error.details = error.details;
  }

  if (requestId) {
    payload.requestId = requestId;
  }

  return res.status(statusCode).json(payload);
}
