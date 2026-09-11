/**
 * Strip Mongo operator-looking keys from request bodies / queries.
 * Does not mutate nested prototypes; rebuilds plain objects.
 */
function sanitizeNode(value) {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeNode(item));
  }
  if (value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
    const clean = {};
    for (const [key, nested] of Object.entries(value)) {
      if (key.startsWith('$') || key.includes('.')) continue;
      clean[key] = sanitizeNode(nested);
    }
    return clean;
  }
  return value;
}

export function sanitizeRequest(req, _res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeNode(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeNode(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeNode(req.params);
  }
  return next();
}

export default sanitizeRequest;
