# Phase 21 — MVP acceptance

**Date:** 2026-09-11  
**Branch under review:** `deployment` @ `6b31922`  
**Scope:** MVP surfaces in [PROJECT_RULES.md](./PROJECT_RULES.md) §10B + §14.5; deploy smoke in [DEPLOYMENT.md](./DEPLOYMENT.md) §4; local E2E matrix in [E2E_LOCAL_QA_REPORT.md](./E2E_LOCAL_QA_REPORT.md).

## Verdict

**MVP accepted for product + API.** ArchiveX meets the documented MVP on the `deployment` branch: public museum surfaces, collector tools, admin CMS, infra hardening, tests, and a live Render API.

**Open residual (Phase 20 web):** the production **website** is not yet confirmed on Vercel. `https://archivex.vercel.app` resolves to an unrelated “Create Next App” title — not this repo’s Ivory Museum client. Finish Vercel (`client/`, branch `deployment`, `VITE_API_BASE_URL` → Render), then set Render `CLIENT_ORIGIN` to that exact origin and redeploy once.

| Host | URL | Status |
| --- | --- | --- |
| API (Render) | `https://archivex-dmxn.onrender.com` | **Live** — health + public catalog OK |
| Website (Vercel) | *(not confirmed for this repo)* | **Open** — placeholder/example URL is not ArchiveX |
| Local | `http://localhost:5173` → `http://localhost:5001/api/v1` | **Verified** |

---

## 1. Automated verification (2026-09-11)

| Check | Result | Notes |
| --- | --- | --- |
| `npm test` (root) | **PASS** | Server 131 · Client 7 |
| `npm run build --prefix client` | **PASS** | Vite production build |
| Local API health | **PASS** | `db=connected` |
| Local Vite SPA shells | **PASS** | `/`, discover, brands, categories, journal, search, compare, privacy, login, register, admin/login, product, contribute, favorites, collections, account → 200 |
| Local public approval gate | **PASS** | `?status=pending` does not leak pending plates |
| Local E2E substitute | **PASS** | See E2E report — 49 pass / 0 fail (Playwright webkit skipped in agent seatbelt) |
| Prod API health | **PASS** | `archivex-dmxn.onrender.com/api/v1/health` |
| Prod products / brands / categories / articles / home / openapi / recommended | **PASS** | HTTP 200 |
| Prod product detail + image URL | **PASS** | e.g. `bmw-s1000rr` |
| Prod website smoke | **FAIL / open** | No ArchiveX Vercel host confirmed |
| Prod CORS vs real web origin | **Blocked by open item** | Set after real Vercel URL exists |

---

## 2. MVP checklist

### Public

| Item | Status | Evidence |
| --- | --- | --- |
| Landing / home (CMS-backed) | **PASS** | Route + `GET /home` (local + prod API) |
| Discover (multi-domain feed) | **PASS** | Route + products API |
| Search | **PASS** | `/search` + `GET /products?q=` |
| Product detail | **PASS** | `/products/:slug` + detail API |
| Brands A–Z | **PASS** | Routes + brands API |
| Categories | **PASS** | Routes + categories API |
| Journal | **PASS** | Routes + articles API |
| Privacy | **PASS** | `/privacy` routed |
| Approved-only public catalog | **PASS** | Pending status probe does not leak |

### Authenticated (collector)

| Item | Status | Evidence |
| --- | --- | --- |
| Register / login | **PASS** | Routes + E2E / Phase 17 tests |
| Favorites | **PASS** | Route + E2E + tests |
| Collections | **PASS** | Routes + E2E + tests |
| Comparison (max 4) | **PASS** | `/compare` + compare UI wiring |
| Account / settings | **PASS** | Routes + authAccount tests |
| Recently viewed | **PASS** | Phase 17 tests |
| Contributions + submissions | **PASS** | `/contribute`, `/account/submissions` + contribution tests |

### Admin CMS

| Item | Status | Evidence |
| --- | --- | --- |
| Staff login split (`/admin/login`) | **PASS** | Route + E2E admin login API |
| Overview | **PASS** | Page + overview API (E2E) |
| Home page editor | **PASS** | `/admin/home` present |
| Products + approvals | **PASS** | Pages present; approval gates in hardening tests |
| Brands / categories / articles | **PASS** | Admin pages present |
| Media library | **PASS** | Admin media page + Phase 14 tests |
| Users / audit / analytics | **PASS** | Pages + analytics E2E read |

### Infrastructure

| Item | Status | Evidence |
| --- | --- | --- |
| MongoDB Atlas | **PASS** | Local + Render health `database.connected` |
| Express MVC + REST | **PASS** | OpenAPI + live `/api/v1/*` |
| Redux Toolkit / RTK Query | **PASS** | Client features + build |
| AuthZ server-side | **PASS** | Role gates + token revocation tests |
| Validation / sanitize | **PASS** | Phase 18 |
| Rate limiting | **PASS** | Prod `ratelimit-*` headers observed |
| Logging | **PASS** | Morgan + request ids |
| Testing | **PASS** | `npm test` green |
| Deployment documentation | **PASS** | [DEPLOYMENT.md](./DEPLOYMENT.md) |
| Production API deploy | **PASS** | Render `archivex-dmxn` |
| Production website deploy | **OPEN** | Vercel ArchiveX project not confirmed |

### Explicitly out of scope (post-MVP)

Atlas Search, advanced recommendations, price history, public collector profiles, marketplace, localization, notifications — see PROJECT_RULES §11. Not required for Phase 21.

---

## 3. Production close-out (remaining)

1. Vercel → import ArchiveX → production branch `deployment` → root `client`.
2. Env: `VITE_API_BASE_URL=https://archivex-dmxn.onrender.com/api/v1`.
3. Deploy → copy the real `https://….vercel.app` URL.
4. Render → set `CLIENT_ORIGIN` to that exact origin (no trailing slash) → redeploy.
5. Smoke: Home, Discover, product page, collector login, `/admin/login`, images, no CORS errors.

Until step 5 passes, treat the **public website host** as the only MVP residual — not a product-feature gap.

---

## 4. Sign-off

| Role | Result |
| --- | --- |
| Product MVP (features + local QA + automated tests) | **Accepted** |
| Production API | **Accepted** |
| Production website | **Deferred** — complete Vercel wiring above |

Phase 21 acceptance artifacts: this file + prior [E2E_LOCAL_QA_REPORT.md](./E2E_LOCAL_QA_REPORT.md) + [DEPLOYMENT.md](./DEPLOYMENT.md).
