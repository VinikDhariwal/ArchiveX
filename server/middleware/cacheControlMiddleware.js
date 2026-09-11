/**
 * Short browser/CDN-friendly caching for public read-only catalog GETs.
 * Auth, admin, and mutation routes must not use this middleware.
 */
export function publicCache(maxAgeSeconds = 60) {
  const maxAge = Math.max(5, Number(maxAgeSeconds) || 60);
  const stale = maxAge * 2;
  return function publicCacheMiddleware(req, res, next) {
    if (req.method === 'GET') {
      res.set(
        'Cache-Control',
        `public, max-age=${maxAge}, stale-while-revalidate=${stale}`
      );
    }
    return next();
  };
}

export default publicCache;
