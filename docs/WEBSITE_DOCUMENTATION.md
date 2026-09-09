# ArchiveX — Living Website Documentation

**Status:** Living document — update this file whenever libraries, routes, components, APIs, or product behavior change.  
**Last updated:** 2026-09-09 (Phase 7 discovery)
**Companion rules:** [PROJECT_RULES.md](./PROJECT_RULES.md) (product/tech contract; do not replace it)  
**Setup guide:** [../README.md](../README.md)

### How to maintain this doc

| When you… | Update… |
| --- | --- |
| Add/remove an npm package | §3 Libraries |
| Add a page, component, hook, or Redux piece | §5 Client |
| Add a route, model, controller, service, middleware | §4 Server |
| Change env vars | §7 Environment |
| Finish a phase or change public UX | §2 Current state + §9 Changelog |
| Change design tokens / major CSS patterns | §6 Styles |

---

## 1. What ArchiveX is

ArchiveX is a premium **website** for luxury **discovery**, **archive**, **editorial**, and **collector** study.

- **Not** ecommerce (no cart/checkout)
- **Not** a SaaS dashboard for the public UI
- **Primary domains:** cars, motorcycles  
- **Secondary domain:** watches  
- **Publisher identity:** ArchiveX  
- Public guests see **approved** catalog content only; contributor submissions require **admin approval** via `/admin`

---

## 2. Current implementation state (honest snapshot)

| Area | State |
| --- | --- |
| Phase 0–1 foundation | Done (Express health, Vite/React, Redux, env, MVC folders) |
| Phase 2–3 Ivory Museum UI + routing shells | Done (demo catalog still drives public UI) |
| MongoDB Atlas connection | Done |
| Phase 4 Mongoose models | Done — User, Brand, Category, Tag, Product + controlled specs |
| Phase 4 seed → Atlas | Done — 16 approved products (6 cars, 6 motorcycles, 4 watches) |
| Phase 5 public REST APIs | Done — products/brands/categories (approved/active only) |
| Client wired to API | Done — Home signatures, Discover, Product detail, Brand marquee |
| Phase 6 Authentication | Done — register/login/refresh/logout/me, JWT, route guards |
| Phase 7 Discovery | Done — search, domain-aware filters, sort, pagination, URL sync |
| Admin CMS | Layout shell only (auth-gated; CRUD in Phase 13) |

**Migrate / re-seed Atlas**

```bash
npm run seed --prefix server
```

**Public API (Phase 5)**

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/api/v1/health` | Liveness + DB status |
| GET | `/api/v1/products` | Approved only; search/filters/sort/pagination (see Phase 7) |
| GET | `/api/v1/products/filters/schema` | Domain-aware filter metadata for Discover UI |
| GET | `/api/v1/products/:slug` | Approved only |
| GET | `/api/v1/brands` | Active brands; optional `domain` |
| GET | `/api/v1/brands/:slug` | Active brand |
| GET | `/api/v1/categories` | Active categories; optional `productType` |
| GET | `/api/v1/categories/:slug` | Active category |
| POST | `/api/v1/auth/register` | Create collector account |
| POST | `/api/v1/auth/login` | Access token + httpOnly refresh cookie |
| POST | `/api/v1/auth/refresh` | Rotate tokens via refresh cookie |
| POST | `/api/v1/auth/logout` | Revoke refresh (tokenVersion++) + clear cookie |
| GET | `/api/v1/auth/me` | Current user (Bearer access token) |

**Seed admin (local/dev):** `editor@archivex.local` / `ArchiveX!admin`

---

## 3. Libraries (every package)

### 3.1 Root (`package.json`)

| Package | Role |
| --- | --- |
| `concurrently` | Runs API and Vite client together via `npm start` / `npm run dev` |

**Scripts:** `start`, `dev` (= start), `client`, `server`, `build`, `test`, `lint`

### 3.2 Server (`server/package.json`)

| Package | Role in ArchiveX |
| --- | --- |
| `express` | HTTP server, routing, middleware stack |
| `mongoose` | MongoDB Atlas ODM — models + connection live |
| `dotenv` | Loads `server/.env` from `config/constants.js` (absolute path) |
| `cors` | Allows browser origin `CLIENT_ORIGIN` with credentials |
| `helmet` | Secure HTTP headers |
| `compression` | Gzip responses |
| `morgan` | Request logging (`dev` / `combined`) |
| `eslint` (dev) | Lint (non-blocking `\|\| true`) |
| `mongodb-memory-server` (dev) | In-memory Mongo for `tests/models.test.js` |

**Scripts:** `dev` / `start` → `node server.js`; `seed` → `seeds/seedDemo.js`; `test`; `lint`

### 3.3 Client (`client/package.json`)

| Package | Role in ArchiveX |
| --- | --- |
| `react` / `react-dom` | UI rendering |
| `react-router-dom` | Routes, layouts, navigation, lazy pages |
| `@reduxjs/toolkit` | Store, slices, RTK Query `createApi` |
| `react-redux` | Store `<Provider>` |
| `vite` | Dev server + production bundler (port 5173) |
| `@vitejs/plugin-react` | JSX + Fast Refresh |
| `vitest` | Unit tests (passWithNoTests for now) |
| `eslint` + React ESLint plugins | Client lint |

**Fonts (CDN in `index.html`):** Cormorant Garamond, DM Serif Display, Fraunces, IBM Plex Mono/Sans, Manrope — Ivory Museum typography.

---

## 4. Server — architecture & every module

### 4.1 Request flow

```text
Client → Express app.js
       → requestId → helmet → cors → compression → json → morgan
       → /  or  /api/v1/*
       → notFound → errorMiddleware
```

Boot (`server.js`): `connectDatabase()` then `app.listen(PORT)`.

### 4.2 Entry & config

| File | Exports / behavior |
| --- | --- |
| `server.js` | Starts DB + HTTP; SIGINT/SIGTERM shutdown |
| `app.js` | Builds Express app; `GET /` returns API identity + domains |
| `config/constants.js` | Loads dotenv; app identity; product types; roles; statuses; rarity; image types; **controlled `SPEC_FIELDS_BY_TYPE`** |
| `config/env.js` | `env` object: `port`, `clientOrigin`, `mongodbUri`, `mongodbDbName`, API identity |
| `config/database.js` | `connectDatabase()`, `getDatabaseStatus()` — skips connect if URI empty |

### 4.3 Routes & controllers

| File | Function | Purpose |
| --- | --- | --- |
| `routes/index.js` | mounts routers | `/api/v1` |
| `routes/healthRoutes.js` | `GET /health` | Liveness |
| `controllers/healthController.js` | `getHealth` | JSON OK + DB configured/connected flags |

### 4.4 Middleware

| File | Function | Purpose |
| --- | --- | --- |
| `requestIdMiddleware.js` | `requestIdMiddleware` | Sets/propagates `x-request-id` |
| `notFoundMiddleware.js` | `notFoundMiddleware` | 404 → `ApiError` |
| `errorMiddleware.js` | `errorMiddleware` | Central JSON error envelope |

### 4.5 Utils

| File | Exports | Purpose |
| --- | --- | --- |
| `utils/ApiError.js` | `ApiError` | Typed HTTP errors |
| `utils/asyncHandler.js` | `asyncHandler` | Wraps async controllers |
| `utils/response.js` | `successResponse`, `errorResponse` | Consistent JSON envelopes |

### 4.6 Models / services / seeds / validators

| Path | Status |
| --- | --- |
| `models/User.js` | Users + roles/status |
| `models/Brand.js` | Brands with primaryDomains |
| `models/Category.js` | Categories scoped by productType |
| `models/Tag.js` | Tags |
| `models/Product.js` | Domain-neutral Product + images, status gate, specs |
| `models/shared/productSubdocuments.js` | `buildSpecifications`, `assertValidSpecifications` |
| `models/index.js` | Barrel exports |
| `services/searchService.js` | Public discovery filters, sort modes, shuffle, field selection |
| `services/productService.js` | Public product list/detail + serialize via searchService |
| `services/brandService.js` | Public brand list/detail |
| `services/categoryService.js` | Public category list/detail |
| `controllers/productController.js` | Thin product handlers |
| `controllers/brandController.js` | Thin brand handlers |
| `controllers/categoryController.js` | Thin category handlers |
| `routes/productRoutes.js` | `/products` |
| `routes/brandRoutes.js` | `/brands` |
| `routes/categoryRoutes.js` | `/categories` |
| `seeds/seedDemo.js` | Migrates website demo catalog into Atlas (approved) |
| `validators/` | Empty |
| `tests/health.test.js` | Health endpoint |
| `tests/models.test.js` | Spec validation + model CRUD (memory Mongo) |
| `tests/catalogApi.test.js` | Public catalog approval gate |
| `testSupport/http.js` | Ephemeral listen + fetch helper |

### 4.7 Domain constants (server)

- **Primary types:** `car`, `motorcycle`
- **Secondary:** `watch`
- **Future types reserved:** jet, helicopter, yacht, bag, fashion, jewellery, art, audio, furniture, collectible
- **Product statuses (for approval gate):** pending, approved, rejected, draft, archived
- **Roles:** user, editor, moderator, admin, superadmin

---

## 5. Client — architecture & every module

### 5.1 Boot

```text
main.jsx → <Provider store> → <App />
App.jsx → global CSS → AppRoutes
```

### 5.2 State & API

| File | Exports | Purpose |
| --- | --- | --- |
| `app/store.js` | `store` | RTK store |
| `app/rootReducer.js` | default | Combines `api` + `favorites` |
| `app/api.js` | `api`, `useGetHealthQuery` | RTK Query; **health only** today; tagTypes ready for Product/Brand/… |
| `features/favorites/favoriteSlice.js` | `toggleFavorite`, selectors | Local favorite IDs (UI wiring light) |
| `config/clientConfig.js` | `clientConfig` | `VITE_*` → name, tagline, `apiBaseUrl` |

### 5.3 Hooks

| File | Purpose |
| --- | --- |
| `hooks/useDocumentTitle.js` | Sets `document.title` to `{page} · ArchiveX` |
| `hooks/useSectionReveal.js` | Scroll reveal via `[data-reveal]` + IntersectionObserver |

### 5.4 Layouts

| File | Purpose |
| --- | --- |
| `layouts/PublicLayout.jsx` | Public chrome + Suspense |
| `layouts/AuthenticatedLayout.jsx` | Same chrome + “auth later” banner |
| `layouts/AdminLayout.jsx` | Admin nav shell (no real auth yet) |

### 5.5 Routes (`routes/AppRoutes.jsx`)

| Path | Page | Notes |
| --- | --- | --- |
| `/`, `/home` | `HomePage` | Full Ivory Museum composition |
| `/discover` | `DiscoverPage` | Search + domain-aware filters + sort + masonry feed |
| `/products/:slug` | `ProductDetailPage` | Gallery + metadata from API |
| `/search`, `/brands`, `/brands/:slug`, `/categories`, `/categories/:slug`, `/journal`, `/journal/:slug` | `RouteShellPage` | Structural placeholders |
| `/compare` | redirect | → `/discover` (compare removed from public UX) |
| `/account`, `/favorites`, `/collections`… | shells | Authenticated layout |
| `/admin/*` | shells | Admin layout |
| `/unauthorized` | `UnauthorizedPage` | Forbidden placeholder |
| `*` | `NotFoundPage` | 404 |

### 5.6 Pages

| File | Role |
| --- | --- |
| `HomePage.jsx` | Hero → marquee → promise → chambers → signatures → editorial → close |
| `DiscoverPage.jsx` | URL-synced discovery: search, filters, sort, pagination, masonry |
| `LoginPage.jsx` / `RegisterPage.jsx` / `AccountPage.jsx` | Auth surfaces |
| `ProductDetailPage.jsx` | Full object plate by slug |
| `RouteShellPage.jsx` | Wide placeholder for unfinished routes |
| `NotFoundPage.jsx` / `UnauthorizedPage.jsx` / `ErrorPage.jsx` / `LoadingPage.jsx` | System states |

### 5.7 Discover components

| File | Role |
| --- | --- |
| `ProductFilters.jsx` | Domain-aware filter rail (shared + car/moto/watch specs) |
| `ProductSort.jsx` | Sort control + result count |
| `ProductGrid.jsx` / `ProductCard.jsx` | Masonry grid wrappers around `ObjectCard` |
| `ProductGridSkeleton.jsx` | Loading skeleton for Discover |

### 5.8 Archive components

| File | Role |
| --- | --- |
| `ArchiveHero.jsx` | Autoplay plate carousel, orbit peeks, CTAs; navigates to product on plate click |
| `BrandMarquee.jsx` | Endless brand ribbon |
| `ArchivePromise.jsx` | Mission + quote |
| `DomainPaths.jsx` | Three **bordered chamber cards** (Cars / Motorcycles / Watches) |
| `FeaturedObject.jsx` | Signature spread in **same soft bordered box**; opens Details modal only (no “View” link) |
| `EditorialStory.jsx` | Journal teaser |
| `HomeClose.jsx` | Discover / Journal closing paths |
| `ObjectCard.jsx` | Discover card; opens `ObjectDetailModal` |
| `ObjectDetailModal.jsx` | Portal details dialog; close / back to feed |
| `ProductGallery.jsx` | Multi-image gallery with keyboard arrows |
| `MuseumFrame.jsx` | Subtle museum media frame |
| `BrandIndex.jsx` / `JournalPreview.jsx` | Available brand/journal UI blocks |

### 5.9 Layout & feedback components

| File | Role |
| --- | --- |
| `AppShell.jsx` | Sticky header + main + footer |
| `DesktopHeader.jsx` / `MobileHeader.jsx` | Navigation |
| `Footer.jsx` | Site footer |
| `Breadcrumbs.jsx` | Trail |
| `Skeleton.jsx` / `PageSkeleton.jsx` | Loading placeholders |
| `LoadingState.jsx` / `ErrorState.jsx` | Inline states |
| `RouteErrorBoundary.jsx` | Catches render errors in routes |
| `RequireAuth.jsx` / `RequireAdmin.jsx` | Route guards |

### 5.10 Redux features

| File | Role |
| --- | --- |
| `features/auth/authSlice.js` | Access token + user credentials |
| `features/discover/filterSlice.js` | Mobile filter drawer + draft search query |
| `features/favorites/favoriteSlice.js` | Local favorite ids (persistence in Phase 9) |
| `features/products/productApi.js` | Discover URL ↔ query helpers |
| `features/products/productSelectors.js` | Product list selectors |

### 5.11 Demo data (`data/demoData.js`)

**Purpose:** Hero plates and editorial copy still local until CMS. Catalog reads from Atlas APIs.

| Export | Purpose |
| --- | --- |
| `hero` | Hero copy + `plates[]` carousel objects |
| `archivePromise` | Promise section copy |
| `domainPaths` | Chamber cards (car / motorcycle / watch) |
| `objects` | Legacy demo catalog (mostly superseded by API) |
| `featuredCarId` / `featuredMotorcycleId` | Home signature picks (demo ids) |
| `editorialStory` / `homeClose` | Home narrative blocks |
| `brands` / `journalArticles` / `navLinks` | Supporting lists |
| `DEMO_DISCLAIMER` | Non-claim disclaimer |
---

## 6. Styles

| File | Covers |
| --- | --- |
| `styles/tokens.css` | Ivory Museum tokens: paper/blush/ink/navy/brass/forest/oxide; fonts; spacing; motion; reduced-motion |
| `styles/global.css` | Reset, page chrome, typography utilities, CTAs, shells, skeletons |
| `styles/archive.css` | Header, hero, marquee, chambers, **featured bordered cards**, discover masonry, object cards, detail modal, product detail |

**Design notes in force**

- Soft bordered “chamber” card language reused for signature featured objects
- Discover masonry: avoid `transform` on cards (breaks CSS columns)
- No hover photo-swap that breaks title↔image binding
- Details modal replaces Compare/Save in public UX for now

---

## 7. Environment variables

### Server (`server/.env`)

| Variable | Purpose |
| --- | --- |
| `PORT` | API port (default `5001`) |
| `NODE_ENV` | `development` / `production` |
| `CLIENT_ORIGIN` | CORS origin (required in production) |
| `MONGODB_URI` | Atlas connection string |
| `MONGODB_DB_NAME` | DB name (default `archivex`) |
| `APP_NAME` / `API_NAME` / `API_SERVICE_ID` / `API_VERSION` | Identity |
| `JWT_*` | Placeholders for later auth phases |

### Client (`client/.env`)

| Variable | Purpose |
| --- | --- |
| `VITE_APP_NAME` | Branding |
| `VITE_APP_TAGLINE` | Tagline |
| `VITE_API_BASE_URL` | RTK Query base (e.g. `http://localhost:5001/api/v1`) |

**Never commit real `.env` files or Atlas passwords.**

---

## 8. Website user journeys (as built)

1. **Land on Home** — hero plates, brand marquee, promise, domain chambers, two signature objects (Details), editorial close  
2. **Enter a chamber** — domain path links into Discover filtered by domain  
3. **Discover feed** — masonry of cars/motorcycles/watches; open Details modal  
4. **Product page** — `/products/:slug` full plate + gallery (still demo data)  
5. **Journal / Brands / Search / Admin / Account** — shells until later phases  
6. **API health** — `GET /api/v1/health` (+ Mongo connected when URI set)

---

## 9. Changelog (append newest on top)

### 2026-09-09 (night) — Phase 7 Discovery

- `searchService.js` builds public product filters: text search (name/reference/description/brand/category/tags), shared filters, and domain-aware specification filters.
- Product list supports sort (`shuffle`, `popularity`, `newest`, `rarity`, `relevance`, `name`), pagination with correct totals, and optional `fields` projection.
- `GET /products/filters/schema` returns domain-aware filter metadata.
- Discover UI: filter rail, sort, search, URL sync, pagination, skeleton/empty/error; cars/motorcycles lead, watches secondary.
- Public UX keeps Details modal (no compare/save on cards — collector actions remain Phase 9).
- 25 server tests passing (includes discovery suite).
- Fixed `RequireAuth` import paths.

### 2026-09-09 (late) — Phase 6 Authentication

- JWT access tokens + httpOnly refresh cookies; bcrypt password hashing.
- Auth routes: register, login, refresh, logout, me.
- Client: login/register/account pages, auth slice, RTK reauth, RequireAuth / RequireAdmin.
- Account + admin layouts gated; header Sign in / Account.
- Seed admin password set to `ArchiveX!admin` (re-seed applied).
- 18 server tests passing.

### 2026-09-09 (evening) — Phase 5 MVC APIs

- Public REST: `/products`, `/brands`, `/categories` (approved/active only; pending never leaks).
- Services + thin controllers; RTK Query endpoints on the client.
- Home / Discover / Product detail / brand marquee read from Atlas via API.
- Hero / chamber editorial copy still local in `demoData.js` until CMS phase.
- Catalog API tests added (13 server tests passing).

### 2026-09-09 (evening) — Phase 4 data migration

- Added Mongoose models: User, Brand, Category, Tag, Product + controlled spec helpers.
- Seeded Atlas `archivex` from current demo catalog: **16 products** (6/6/4), 16 brands, 3 categories, 4 tags, 1 admin user — all products `approved`.
- Model tests with `mongodb-memory-server`.
- Public UI still uses `demoData.js` until Phase 5 APIs.

### 2026-09-09

- Created this living documentation file.
- Restored root `npm start` (concurrent server + client).
- Server loads `server/.env` via absolute path in `constants.js`; Atlas connection verified.
- Signature (`FeaturedObject`) cards styled like chamber cards (border, soft fill, shadow).
- Removed public “Open full plate / View” CTAs; **Details** remains.
- Demo catalog names aligned to photography (300 SL, Chiron, Huracán, Harley Heritage, Suzuki Café, Honda Scrambler, etc.).
- Compare route redirects to Discover; contribution/approval rules live in PROJECT_RULES.

---

## 10. Next documentation updates expected

When Phase 8 product detail intelligence lands, document related objects and view tracking.
When Phase 9 collector features land, document favorites/collections persistence.
