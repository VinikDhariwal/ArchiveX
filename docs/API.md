# ArchiveX API reference

**Phase 16** · OpenAPI 3.0 machine document: [`openapi.json`](./openapi.json)  
**Live (local):** `GET http://localhost:5001/api/v1/openapi.json` · index `GET /api/v1/docs`  
**Living product docs:** [WEBSITE_DOCUMENTATION.md](./WEBSITE_DOCUMENTATION.md)

## Conventions

| Topic | Detail |
| --- | --- |
| Base URL | `/api/v1` |
| Success | `{ "success": true, "data": …, "meta"?: … }` |
| Error | `{ "success": false, "error": { "code", "message", "details"? }, "requestId"? }` |
| Access auth | `Authorization: Bearer <accessToken>` |
| Refresh | HttpOnly cookie `archivex_refresh` (path `/api/v1/auth`) |
| Public catalog | Approved / active content only |
| Staff CMS | `/admin/*` — roles `editor` \| `moderator` \| `admin` \| `superadmin` |
| Managers | Soft-deletes + user admin — `admin` \| `superadmin` |
| Status moderation | `PATCH …/status` — `moderator` \| `admin` \| `superadmin` |

Exception: `GET /media/files/:id` returns raw image bytes (not the JSON envelope).

## Quick start

```bash
# Health
curl http://localhost:5001/api/v1/health

# OpenAPI document
curl http://localhost:5001/api/v1/openapi.json

# Collector login
curl -c cookies.txt -X POST http://localhost:5001/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"you@example.com","password":"your-password"}'

# Authenticated call
curl -b cookies.txt http://localhost:5001/api/v1/auth/me \
  -H "Authorization: Bearer <accessToken>"
```

Staff login uses the same endpoint with `"staffOnly": true` (collector accounts are rejected).

## Endpoint map

Import [`openapi.json`](./openapi.json) into Swagger UI, Postman, Insomnia, or Redoc for interactive docs.

### Public

- `GET /health` — liveness + DB
- `GET /docs` · `GET /openapi.json` — this documentation
- `GET /products` · `/products/filters/schema` · `/products/recommended` · `/products/recently-viewed`
- `GET /products/:slug` · `POST /products/:id/view` · `GET /products/:id/related` · `GET /products/:id/journal`
- `GET /brands` · `/brands/:slug`
- `GET /categories` · `/categories/:slug`
- `GET /articles` · `/articles/:slug`
- `GET /media/files/:id` — GridFS image stream

### Auth

- `POST /auth/register` · `/auth/login` · `/auth/refresh` · `/auth/logout`
- `GET|PATCH /auth/me` · `PATCH /auth/me/email` · `PATCH /auth/me/password` · `DELETE /auth/me`

### Collector (Bearer required)

- `GET|POST|DELETE /favorites…`
- `GET|POST|PATCH|DELETE /collections…` (+ product membership)
- `GET|POST /contributions/products` · `GET|PATCH|DELETE /contributions/products/:id` — submit / list / edit / withdraw own pending or rejected products (always created as `pending`; no public leak until staff approve)

### Admin (Bearer + staff role)

- `GET /admin/overview` · `/admin/analytics` · `/admin/audit`
- Products / brands / categories / articles CRUD + product status
- Media upload (multipart), remote URL register, soft-delete
- Users list/create/patch (`admin+`)

## Maintaining the spec

When you add or change an HTTP route:

1. Update `docs/openapi.json` (paths, schemas, auth).
2. Mention the change in `docs/WEBSITE_DOCUMENTATION.md` §2 / §9.
3. Keep this file’s endpoint map in sync if the surface area changes.

Do not put secrets, seed passwords, or Atlas URIs in the OpenAPI document.
