# ArchiveX

ArchiveX is a multi-domain luxury discovery, archive, editorial, and collector platform.

**Primary launch domains:** Cars, Motorcycles / Bikes  
**Secondary domain:** Luxury Watches  

Read [docs/PROJECT_RULES.md](docs/PROJECT_RULES.md) before making changes.

Living reference for libraries, modules, routes, and website behavior (keep updated):  
[docs/WEBSITE_DOCUMENTATION.md](docs/WEBSITE_DOCUMENTATION.md).

## Stack

- JavaScript only
- MERN (MongoDB Atlas, Express, React, Node.js)
- Redux Toolkit + RTK Query
- Express MVC + REST (`/api/v1`)

## Repository

- GitHub: https://github.com/VinikDhariwal/ArchiveX.git

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB Atlas URI (required to seed Phase 4 models)

## Setup

```bash
cp .env.example .env
npm install
npm install --prefix server
npm install --prefix client
```

Copy relevant values into `server/.env` and `client/.env` as needed:

```bash
cp .env.example server/.env
# Client uses Vite env vars — create client/.env with:
# VITE_API_BASE_URL=http://localhost:5001/api/v1
```

Set `MONGODB_URI` in `server/.env`, then seed the multi-domain demo catalog:

```bash
npm run seed --prefix server
```

Seed admin (Phase 6): `editor@archivex.local` / `ArchiveX!admin`

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start API and React client together |
| `npm run server` | Start Express API (default `http://localhost:5001`) |
| `npm run client` | Start React client (default `http://localhost:5173`) |
| `npm run seed --prefix server` | Seed Phase 4 User/Brand/Category/Tag/Product demo data |
| `npm run build` | Production client build |
| `npm test` | Run server and client tests |

## Health check

```bash
curl http://localhost:5001/api/v1/health
```

Expected:

```json
{
  "success": true,
  "data": {
    "status": "ok"
  }
}
```

## Environment variables

See [`.env.example`](.env.example).

| Variable | Used by | Notes |
| --- | --- | --- |
| `APP_NAME` / `API_NAME` / `API_SERVICE_ID` / `API_VERSION` | server | App identity from env/config |
| `PORT` | server | API port (default `5001` in development only) |
| `NODE_ENV` | server | `development` / `production` |
| `CLIENT_ORIGIN` | server | CORS origin (**required in production**) |
| `MONGODB_URI` | server | Atlas connection string (**required to seed**) |
| `MONGODB_DB_NAME` | server | Database name |
| `JWT_*` | server | Auth secrets (later phases) |
| `VITE_APP_NAME` / `VITE_APP_TAGLINE` | client | Branding from env |
| `VITE_API_BASE_URL` | client | REST base URL (**required in production builds**) |

Never commit real `.env` files or secrets. Do not hardcode production hosts, catalog objects, or secrets in source.

## Phase status

- Phase 0: Project rules — complete
- Phase 1: Foundation — complete
- Phase 2: Ivory Museum website — complete
- Phase 3: Routing / layouts / page shells — complete
- Phase 4: Multi-domain Mongo models + seeds — complete
- Phase 5–9: Public APIs, auth, discovery, product detail, collector features — complete
- Phase 10: Journal — complete
- Later phases: not started

## Phase 4 data model notes

- Domain-neutral `Product` with controlled `specifications` (car / motorcycle / watch)
- Cars and motorcycles are seeded most strongly; watches are secondary
- Product `status`: `pending` | `approved` | `rejected` | `draft` | `archived` (public surfaces use **approved** only)
- Publisher defaults to **ArchiveX**