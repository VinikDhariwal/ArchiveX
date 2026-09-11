import app from '../app.js';

/**
 * Parse Set-Cookie header values into a name → value map.
 * @param {string[]} setCookieHeaders
 */
export function parseSetCookies(setCookieHeaders = []) {
  const cookies = {};
  for (const header of setCookieHeaders) {
    const [pair] = String(header).split(';');
    const eq = pair.indexOf('=');
    if (eq === -1) continue;
    const name = pair.slice(0, eq).trim();
    const value = pair.slice(eq + 1).trim();
    if (name) cookies[name] = value;
  }
  return cookies;
}

/** Build a Cookie request header from a name → value map. */
export function cookieHeader(cookies = {}) {
  return Object.entries(cookies)
    .map(([name, value]) => `${name}=${value}`)
    .join('; ');
}

/**
 * Lightweight HTTP helper for API tests.
 * @returns {Promise<{ status: number, body: any, headers: Headers, cookies: Record<string, string> }>}
 */
export default function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, async () => {
      try {
        const { port } = server.address();
        const response = await fetch(`http://127.0.0.1:${port}${path}`, options);
        const setCookie =
          typeof response.headers.getSetCookie === 'function'
            ? response.headers.getSetCookie()
            : [];
        const cookies = parseSetCookies(setCookie);

        const contentType = response.headers.get('content-type') || '';
        let body = null;
        if (contentType.includes('application/json')) {
          body = await response.json();
        } else {
          const text = await response.text();
          body = text.length ? text : null;
        }

        resolve({
          status: response.status,
          body,
          headers: response.headers,
          cookies,
        });
      } catch (error) {
        reject(error);
      } finally {
        server.close();
      }
    });
  });
}
