# ArchiveX — Living Website Documentation

**Status:** Living document — update this file whenever libraries, routes, components, APIs, or product behavior change.  
**Last updated:** 2026-09-09 (Phase 4 seed complete)
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
| Public REST catalog APIs | **Not yet** (health only) — UI still reads `demoData.js` |
| Auth / JWT | Env placeholders only |
| Admin CMS | Layout shell only |

**Migrate / re-seed Atlas**

```bash
npm run seed --prefix server
```

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
| `seeds/seedDemo.js` | Migrates website demo catalog into Atlas (approved) |
| `services/` | Empty (Phase 5) |
| `validators/` | Empty |
| `tests/health.test.js` | Health endpoint |
| `tests/models.test.js` | Spec validation + model CRUD (memory Mongo) |
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
| `/discover` | `DiscoverPage` | Masonry feed + domain filter |
| `/products/:slug` | `ProductDetailPage` | Gallery + metadata from demo data |
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
| `DiscoverPage.jsx` | Shuffled objects; Pinterest-style CSS columns; Details modal |
| `ProductDetailPage.jsx` | Full object plate by slug |
| `RouteShellPage.jsx` | Wide placeholder for unfinished routes |
| `NotFoundPage.jsx` / `UnauthorizedPage.jsx` / `ErrorPage.jsx` / `LoadingPage.jsx` | System states |

### 5.7 Archive components

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

### 5.8 Layout & feedback components

| File | Role |
| --- | --- |
| `AppShell.jsx` | Sticky header + main + footer |
| `DesktopHeader.jsx` / `MobileHeader.jsx` | Navigation |
| `Footer.jsx` | Site footer |
| `Breadcrumbs.jsx` | Trail |
| `Skeleton.jsx` / `PageSkeleton.jsx` | Loading placeholders |
| `LoadingState.jsx` / `ErrorState.jsx` | Inline states |
| `RouteErrorBoundary.jsx` | Catches render errors in routes |

### 5.9 Demo data (`data/demoData.js`)

**Purpose:** Phase 2–3 local catalog until REST APIs exist. Titles are aligned to brand-correct Unsplash photos.

| Export | Purpose |
| --- | --- |
| `hero` | Hero copy + `plates[]` carousel objects |
| `archivePromise` | Promise section copy |
| `domainPaths` | Chamber cards (car / motorcycle / watch) |
| `objects` | Full demo catalog array |
| `featuredCarId` / `featuredMotorcycleId` | Home signature picks |
| `curatedObjectIds` | Curated subset |
| `editorialStory` / `homeClose` | Home narrative blocks |
| `brands` / `journalArticles` / `navLinks` | Supporting lists |
| `getObjectById` / `getObjectBySlug` / `getObjectsByIds` | Lookups |
| `getPrimaryImage` / `getSecondaryImage` | Image helpers |
| `getPublisher` | Defaults to `ArchiveX` |
| `getShuffledDiscoverFeed` | Deterministic shuffle for Discover |
| `DEMO_DISCLAIMER` | Non-claim disclaimer |

**Typical object fields:** `id`, `slug`, `name`, `brand`, `productType`, `year`, `rarity`, `shortDescription`, `images[]` (`url`, `alt`, `type`, `width`, `height`, `objectPosition?`).

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

When Phase 5 APIs land, document:

- Every REST endpoint, auth/public filters (`status: approved`), and which client hooks replace `demoData.js`
