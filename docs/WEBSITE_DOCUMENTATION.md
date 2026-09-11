# ArchiveX — Living Website Documentation

**Status:** Living document — update this file whenever libraries, routes, components, APIs, or product behavior change.  
**Last updated:** 2026-09-11 (Home page CMS)
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
| Change HTTP API contract | `docs/openapi.json` + `docs/API.md` |
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
| Phase 2–3 Ivory Museum UI + routing shells | Done (home copy now CMS-backed; demoData is offline fallback only) |
| MongoDB Atlas connection | Done |
| Phase 4 Mongoose models | Done — User, Brand, Category, Tag, Product + controlled specs |
| Phase 4 seed → Atlas | Done — 16 approved products (6 cars, 6 motorcycles, 4 watches) |
| Phase 5 public REST APIs | Done — products/brands/categories (approved/active only) |
| Client wired to API | Done — Home signatures, Discover, Product detail, Brand marquee |
| Phase 6 Authentication | Done — collector register (first/last/username), login, admin login split, JWT guards |
| Phase 7 Discovery | Done — search, domain-aware filters, sort, pagination, URL sync |
| Phase 7 UI polish | Done — ivory-gold pills, brand search, Discover chamber layout, reveal fix |
| Phase 8 Product detail | Done — domain-aware detail, related, views, gallery lightbox |
| Phase 9 Collector features | Done — favorites, collections, compare tray/page, recently viewed |
| Phase 10 Journal | Done — Article model, public `/articles`, `/journal` pages, product journal links |
| Phase 11 Brands / categories | Done — live A–Z brands + category taxonomy; expanded seed houses |
| Phase 12 Search / recommendations | Done — `/search` page, recommended products API, relevance results |
| Phase 13 Admin CMS | Done — `/admin` CRUD, approvals, users, audit, **Home page editor** |
| Phase 14 Media | Done — Atlas GridFS uploads + media library |
| Phase 15 Analytics | Done — staff `/admin/analytics` views, favorites, catalog health |
| Phase 16 API documentation | Done — OpenAPI 3.0 (`docs/openapi.json`), `docs/API.md`, `GET /api/v1/openapi.json` |
| Phase 17 Testing | Done — auth account + collector edge suites, client Vitest smoke (`npm test`); QA hardening suites added |
| Phase 18 Security hardening | Done — rate limits, CORS allowlist, request sanitize, bcrypt digests (`select:false`), login anti-enumeration, prod JWT secret length |
| Phase 19 Performance | Done — list/shuffle query shape, soft-delete indexes, public `Cache-Control`, RTK keepUnused, font/image budget |
| Collector contributions | Done — `/contribute` + `/account/submissions`, ownership-scoped `/contributions/products` APIs, admin submitter display |
| Home page CMS | Done — singleton `HomePageConfig`; public `GET /home`; staff `GET|PATCH /admin/home`; `/admin/home` editor |

**Migrate / re-seed Atlas**

```bash
npm run seed --prefix server
```

**Public API (Phase 5)**

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/api/v1/health` | Liveness + DB status |
| GET | `/api/v1/docs` | Docs index (links to OpenAPI) |
| GET | `/api/v1/openapi.json` | OpenAPI 3.0 machine document |
| GET | `/api/v1/products` | Approved only; search/filters/sort/pagination (see Phase 7) |
| GET | `/api/v1/products/filters/schema` | Domain-aware filter metadata for Discover UI |
| GET | `/api/v1/products/:slug` | Approved only; includes specs, rarity, market signals |
| POST | `/api/v1/products/:id/view` | Record detail view (sessionKey optional) |
| GET | `/api/v1/products/recommended` | Featured/rarity-led recommendations for Search |
| GET | `/api/v1/products/:id/related` | Related approved objects |
| GET | `/api/v1/products/:id/journal` | Approved essays linked to the product |
| GET | `/api/v1/brands` | Active brands A–Z; optional `domain`, `q`; includes `productCount` |
| GET | `/api/v1/brands/:slug` | Active brand chamber payload + `productCount` |
| GET | `/api/v1/categories` | Active categories; optional `productType`; includes `productCount` |
| GET | `/api/v1/categories/:slug` | Active category chamber payload + `productCount` |
| GET | `/api/v1/articles` | Approved journal essays; optional `type`, `domain`, `featured` |
| GET | `/api/v1/articles/:slug` | Approved essay detail + related products |
| GET | `/api/v1/home` | Public home configuration (resolved plates, domains, featured slots, editorial) |
| POST | `/api/v1/auth/register` | Public collector signup — `firstName`, `lastName`, `username` (unique), `email`, `password`; always role `user`; `name` derived as display |
| POST | `/api/v1/auth/login` | Access + refresh; unknown emails return `INVALID_CREDENTIALS` (401, no enumeration); `staffOnly` rejects collectors |
| POST | `/api/v1/auth/refresh` | Rotate tokens via refresh cookie |
| POST | `/api/v1/auth/logout` | Revoke refresh (tokenVersion++) + clear cookie |
| GET | `/api/v1/auth/me` | Current user |
| PATCH | `/api/v1/auth/me` | Update profile (`firstName`, `lastName`, `username`) |
| PATCH | `/api/v1/auth/me/email` | Change email (requires current password) |
| PATCH | `/api/v1/auth/me/password` | Change password (reissues tokens) |
| DELETE | `/api/v1/auth/me` | Soft-delete collector account (confirm username + password); staff blocked |
| GET/POST | `/api/v1/contributions/products` | Collector submit pending product / list own submissions |
| GET/PATCH/DELETE | `/api/v1/contributions/products/:id` | Own submission detail / edit / soft-withdraw (`pending`/`rejected` only) |
| GET | `/api/v1/admin/overview` | Staff counts (pending, catalog, users) |
| GET | `/api/v1/admin/analytics` | Views, favorites, collections, catalog health signals |
| GET/POST/PATCH/DELETE | `/api/v1/admin/products…` | Catalog CMS + `PATCH …/status` approvals |
| GET/POST/PATCH/DELETE | `/api/v1/admin/brands…` | Brand CMS |
| GET/POST/PATCH/DELETE | `/api/v1/admin/categories…` | Category CMS |
| GET/POST/PATCH/DELETE | `/api/v1/admin/articles…` | Journal CMS |
| GET/PATCH | `/api/v1/admin/home` | Home page CMS singleton (copy, CTAs, product/article pins, section visibility) |
| GET/POST/PATCH | `/api/v1/admin/users…` | Create users + role/status (admin+) |
| GET | `/api/v1/admin/audit` | Thin audit log |
| GET | `/api/v1/admin/media` | Media library list |
| POST | `/api/v1/admin/media/upload` | Multipart image upload (staff) |
| POST | `/api/v1/admin/media/url` | Register remote image URL |
| DELETE | `/api/v1/admin/media/:id` | Soft-delete media (admin+) |

**All durable data is on MongoDB Atlas** (`archivex`): users/admin, products, brands, categories, articles, **home page config**, favorites, collections, audit, media metadata, and uploaded image bytes (GridFS bucket `archivex_media`). There is no local MongoDB and no local upload disk. Public image URLs: `/api/v1/media/files/:id`. Remote Unsplash/CDN URLs stay as external links stored in Atlas.

**Seed admin credentials** (password for `og@archivex.com`) live only in gitignored `server/.env` / `LOCAL_CREDENTIALS.md` — the account itself is in Atlas. Public registration is closed.

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
| `vitest` | Unit tests (`formatProductType`, `authSlice` smoke) |
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
| `routes/docsRoutes.js` | `GET /docs`, `GET /openapi.json` | Phase 16 API documentation |
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
| `models/User.js` | Users — `firstName`, `lastName`, unique `username`, derived `name`, email, roles/status |
| `models/Brand.js` | Brands with primaryDomains |
| `models/Category.js` | Categories scoped by productType |
| `models/Tag.js` | Tags |
| `models/Product.js` | Domain-neutral Product + images, status, specs, rarityProfile, marketSignals, whyItMatters |
| `models/ProductView.js` | Detail view events (session/user/source) |
| `models/Favorite.js` | User ↔ product favorites |
| `models/Collection.js` | Collector collections |
| `models/Article.js` | Journal essays (status-gated, related products) |
| `models/HomePageConfig.js` | Singleton home page CMS document |
| `models/AuditLog.js` | Thin admin audit trail |
| `models/MediaAsset.js` | Uploaded / registered media library assets |
| `models/shared/productSubdocuments.js` | `buildSpecifications`, `assertValidSpecifications` |
| `models/index.js` | Barrel exports |
| `services/searchService.js` | Public discovery filters, sort modes, shuffle, field selection |
| `services/recommendationService.js` | Related objects + Search recommendations; product journal via articleService |
| `services/articleService.js` | Public article list/detail + product journal links |
| `services/adminService.js` | Admin CMS CRUD, approvals, user updates (`createAdminUser` allocates username) |
| `services/homeService.js` | Home page config get/create/update + public resolve |
| `services/homeDefaults.js` | Default museum copy for HomePageConfig seed |
| `services/contributionService.js` | Collector product submit / list / edit / withdraw (ownership-scoped; always pending) |
| `services/authService.js` | `register`, `login`, `serializeUser`, `allocateUsername`, refresh/logout/me |
| `services/auditService.js` | `recordAudit` / `listAuditLogs` |
| `services/mediaService.js` | Local upload + remote URL media library |
| `services/productService.js` | Product list/detail serialize, view recording |
| `services/brandService.js` | Public brand list/detail + product counts + name search |
| `services/categoryService.js` | Public category list/detail + product counts |
| `seeds/brandCatalog.js` | Expanded luxury house + taxonomy seed catalog |
| `seeds/seedDemo.js` | Migrates website demo catalog + journal essays + full brand/category catalog |
| `controllers/productController.js` | Thin product handlers |
| `controllers/brandController.js` | Thin brand handlers |
| `controllers/categoryController.js` | Thin category handlers |
| `controllers/articleController.js` | Thin article handlers |
| `controllers/adminController.js` | Thin admin CMS handlers |
| `controllers/homeController.js` | Public + admin home config handlers |
| `controllers/contributionController.js` | Collector contribution handlers |
| `controllers/mediaController.js` | Thin media upload/list handlers |
| `routes/productRoutes.js` | `/products` |
| `routes/brandRoutes.js` | `/brands` |
| `routes/categoryRoutes.js` | `/categories` |
| `routes/articleRoutes.js` | `/articles` |
| `routes/homeRoutes.js` | `/home` (public resolved config) |
| `routes/contributionRoutes.js` | `/contributions` (auth) |
| `routes/adminRoutes.js` | `/admin` (staff-gated; includes `/admin/home`) |
| `validators/` | Empty |
| `tests/health.test.js` | Health endpoint |
| `tests/models.test.js` | Spec validation + model CRUD (memory Mongo) |
| `tests/catalogApi.test.js` | Public catalog approved-only reads |
| `tests/auth.test.js` | Auth register/login/me |
| `tests/discovery.test.js` | Discovery filters/sort/fields |
| `tests/productDetail.test.js` | Phase 8 view/related/journal + intelligence payload |
| `tests/journal.test.js` | Phase 10 articles + product journal links |
| `tests/collector.test.js` | Favorites, collections, product ids filter |
| `tests/brandsCategories.test.js` | Phase 11 brands/categories filters, counts, approval gates |
| `tests/searchRecommend.test.js` | Phase 12 search + recommended products |
| `tests/admin.test.js` | Phase 13 admin auth gate, approvals, CRUD, audit |
| `tests/home.test.js` | Home CMS get/patch + public resolve |
| `tests/media.test.js` | Phase 14 upload + remote URL / GridFS media library |
| `tests/analytics.test.js` | Phase 15 staff analytics aggregates |
| `tests/openapi.test.js` | Phase 16 OpenAPI document + public docs routes |
| `tests/authAccount.test.js` | Phase 17 profile/email/password/refresh/logout/delete |
| `tests/phase17.test.js` | Phase 17 recently viewed + collection ownership/PATCH edges |
| `tests/contribution.test.js` | Collector product submit / ownership / public gate / withdraw |
| `tests/hardening.test.js` | Approval gates, hostile query/body, pagination/sort safety |
| `tests/tokenRevocation.test.js` | Logout/disable revoke access tokens immediately |
| `tests/adminUsers.test.js` | Superadmin privilege ceiling + self-edit block |
| `tests/mediaHardening.test.js` | SVG/MIME/remote-URL rejection |
| `testSupport/http.js` | Ephemeral listen + fetch helper (JSON/body + Set-Cookie map) |

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
| `app/api.js` | `api`, hooks | RTK Query base + all public/collector/admin endpoints including home CMS |
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
| `layouts/AdminLayout.jsx` | Staff nav shell + Sign out → `/admin/login` |

### 5.5 Routes (`routes/AppRoutes.jsx`)

| Path | Page | Notes |
| --- | --- | --- |
| `/`, `/home` | `HomePage` | Config-driven Ivory Museum composition (`useGetHomeQuery`) |
| `/discover` | `DiscoverPage` | Search + domain-aware filters + sort + masonry feed; shuffle seed persisted in URL + sessionStorage |
| `/products/:slug` | `ProductDetailPage` | Domain-aware detail: gallery, specs, rarity, market, related |
| `/search` | `SearchPage` | Query-first archive search + recommendations |
| `/brands` | `BrandsPage` | A–Z houses with domain filter + search |
| `/brands/:slug` | `BrandDetailPage` | Brand chamber + approved objects |
| `/categories` | `CategoriesPage` | Domain taxonomy index |
| `/categories/:slug` | `CategoryDetailPage` | Category chamber + approved objects |
| `/journal` | `JournalPage` | Approved essay index |
| `/journal/:slug` | `ArticleDetailPage` | Long-form essay + related objects |
| `/compare` | `ComparisonPage` | Domain-aware side-by-side compare (up to 4; public tray) |
| `/login` | `LoginPage` | Collector log in; guest-gate notices; failed login stays generic (`INVALID_CREDENTIALS`) |
| `/register` | `RegisterPage` | First/last name, unique username, email, password |
| `/account` | `AccountPage` | Profile identity + desk; soft links to Contribute, submissions, Favorites, Collections, Compare |
| `/account/settings` | `AccountSettingsPage` | Edit profile, change email, change password, delete account |
| `/contribute` | `ContributePage` | Authenticated product proposal under an active brand (URL images; always pending) |
| `/account/submissions` | `MySubmissionsPage` | Own submissions with status badges; edit/withdraw while pending/rejected |
| `/account/submissions/:id/edit` | `EditSubmissionPage` | Edit own pending/rejected submission |
| `/favorites` | `FavoritesPage` | Synced favorites + recently viewed |
| `/collections` | `CollectionsPage` | Collection list + create |
| `/collections/:id` | `CollectionDetailPage` | Collection detail / manage objects |
| `/admin/login` | `AdminLoginPage` | Staff-only sign in (no public staff signup) |
| `/admin` | `AdminOverviewPage` | CMS overview counts + shortcuts |
| `/admin/home` | `AdminHomePage` | Edit all home sections (hero → close): copy, CTAs, pins, visibility |
| `/admin/approvals` | `AdminApprovalsPage` | Pending product queue |
| `/admin/products` | `AdminProductsPage` | Catalog list + status actions |
| `/admin/products/new` · `/admin/products/:id/edit` | `AdminProductFormPage` | Create / edit product |
| `/admin/brands` | `AdminBrandsPage` | Brand CMS |
| `/admin/categories` | `AdminCategoriesPage` | Category CMS |
| `/admin/articles` | `AdminArticlesPage` | Journal CMS |
| `/admin/media` | `AdminMediaPage` | Upload library + remote URLs |
| `/admin/users` | `AdminUsersPage` | Role / status (admin+) |
| `/admin/audit` | `AdminAuditPage` | Audit trail |
| `/admin/analytics` | live | Views, favorites, collections, catalog health |
| `/unauthorized` | `UnauthorizedPage` | Forbidden placeholder |
| `*` | `NotFoundPage` | 404 |

### 5.6 Pages

| File | Role |
| --- | --- |
| `HomePage.jsx` | Loads `GET /home`; renders sections when enabled; demoData only if API fails |
| `DiscoverPage.jsx` | URL-synced discovery; archive shuffle seed written to URL + `sessionStorage` so refresh keeps order |
| `LoginPage.jsx` / `RegisterPage.jsx` / `AccountPage.jsx` / `AccountSettingsPage.jsx` | Collector auth, profile desk, account settings |
| `ContributePage.jsx` / `MySubmissionsPage.jsx` / `EditSubmissionPage.jsx` | Collector product proposals + submission desk |
| `components/contribute/*` | Contribution form + URL-only image list |
| `components/layout/AccountMenu.jsx` | Guest **Log in** button; signed-in icon menu (Profile, Settings, Contribute, My submissions, Admin, Log out) |
| `utils/formatProductType.js` | Humanize `car`/`motorcycle`/`watch` → Cars/Motorcycles/Watches |
| `pages/admin/AdminLoginPage.jsx` | Staff-only sign in (`/admin/login`); no public staff registration |
| `pages/admin/AdminHomePage.jsx` | Sectioned home CMS form (product/article pickers, enable toggles) |
| `ProductDetailPage.jsx` | Domain-aware product intelligence page |
| `ComparisonPage.jsx` | Wide compare table from tray ids |
| `FavoritesPage.jsx` | Saved favorites + recently viewed |
| `CollectionsPage.jsx` / `CollectionDetailPage.jsx` | Collector collections |
| `JournalPage.jsx` | Editorial archive index |
| `ArticleDetailPage.jsx` | Journal essay detail |
| `BrandsPage.jsx` / `BrandDetailPage.jsx` | Brand A–Z index + chamber |
| `CategoriesPage.jsx` / `CategoryDetailPage.jsx` | Category taxonomy index + chamber |
| `SearchPage.jsx` | Query-first search + suggested recommendations |
| `pages/admin/*` | Admin CMS: overview, **home**, products, approvals, brands, categories, articles, media, users, audit |
| `RouteShellPage.jsx` | Wide placeholder for unfinished routes |
| `NotFoundPage.jsx` / `UnauthorizedPage.jsx` / `ErrorPage.jsx` / `LoadingPage.jsx` | System states |

### 5.7 Discover components

| File | Role |
| --- | --- |
| `ProductFilters.jsx` | Domain-aware filter rail; custom ivory dropdowns; **brand search** inside Brands menu |
| `ProductSort.jsx` | Custom sort dropdown + result count |
| `ProductGrid.jsx` / `ProductCard.jsx` | Masonry grid wrappers around `ObjectCard` |
| `ProductGridSkeleton.jsx` | Loading skeleton for Discover |

### 5.8 Product detail components

| File | Role |
| --- | --- |
| `components/product/ProductIdentity.jsx` | Brand, name, reference, meta row |
| `components/product/ProductActions.jsx` | Favorite / Collection / Compare / back |
| `components/product/ProductSpecifications.jsx` | Domain-aware spec list |
| `components/product/RarityProfile.jsx` | Production / interest / significance |
| `components/product/MarketSignals.jsx` | Informational market reading + disclaimer |
| `components/product/RelatedObjects.jsx` | Related approved plates |
| `components/product/ProductJournal.jsx` | Linked essays on product detail |
| `components/archive/ProductGallery.jsx` | Thumbs, prev/next, keyboard, accessible lightbox |
| `components/compare/ComparisonTray.jsx` | Compact compare dock (hidden when empty; notice at 1; full tray at 2+) |
| `components/compare/ComparisonTable.jsx` | Domain-aware compare sections |
| `components/collector/FavoriteHydrator.jsx` | Syncs server favorites into local slice |
| `components/collector/CreateCollectionModal.jsx` | Create collection dialog |
| `components/collector/AddToCollectionModal.jsx` | Add product to collection picker |

### 5.9 Archive components

| File | Role |
| --- | --- |
| `ArchiveHero.jsx` | Full-bleed plate carousel from home config (or demo plates); brand/headline/lede/CTA from config |
| `BrandMarquee.jsx` | Continuous brand ribbon; label/CTA from home config (`The brands` default); speed scales with list length |
| `BrandIndex.jsx` | A–Z brand tile grid linking to `/brands/:slug` |
| `ArchivePromise.jsx` | Mission + quote (config-driven) |
| `DomainPaths.jsx` | Three **bordered chamber cards**; head copy + chambers from home config |
| `FeaturedObject.jsx` | Signature spread in soft bordered plate; eyebrow + product from home featured slots |
| `EditorialStory.jsx` | Journal teaser from home config / pinned article |
| `HomeClose.jsx` | Closing paths from home config |
| `JournalPreview.jsx` | Essay card grid (links to `/journal/:slug`) |
| `ObjectCard.jsx` | Discover card with bordered plate; View object + quiet Compare |
| `ObjectDetailModal.jsx` | Legacy portal details dialog (superseded by product page) |
| `MuseumFrame.jsx` | Subtle museum media frame |

### 5.10 Layout & feedback components

| File | Role |
| --- | --- |
| `AppShell.jsx` | Sticky header + main + footer + compare tray + favorite hydrator |
| `DesktopHeader.jsx` / `MobileHeader.jsx` | Navigation |
| `Footer.jsx` | Site footer |
| `Breadcrumbs.jsx` | Trail |
| `Skeleton.jsx` / `PageSkeleton.jsx` | Loading placeholders |
| `LoadingState.jsx` / `ErrorState.jsx` | Inline states |
| `RouteErrorBoundary.jsx` | Catches render errors in routes |
| `RequireAuth.jsx` / `RequireAdmin.jsx` | Route guards |

### 5.11 Redux features

| File | Role |
| --- | --- |
| `features/auth/authSlice.js` | Access token + user credentials |
| `features/discover/filterSlice.js` | Mobile filter drawer + draft search query |
| `features/favorites/favoriteSlice.js` | Favorite ids hydrated from `/favorites` when signed in |
| `features/compare/compareSlice.js` | Local compare tray ids (max 4) |
| `features/products/productApi.js` | Discover URL ↔ query helpers; shuffle seed read/store (`sessionStorage`) |
| `features/products/productSelectors.js` | Product list selectors |
| `app/api.js` | RTK Query: products, auth, favorites, collections, **`getHome` / `getAdminHome` / `updateAdminHome`**, admin CMS |

### 5.12 Demo data (`data/demoData.js`)

**Purpose:** Offline / API-failure fallback for home copy and hero plates. Live home is driven by Atlas `HomePageConfig` via `GET /home`. Catalog objects always come from product APIs.

| Export | Purpose |
| --- | --- |
| `hero` | Fallback hero copy + `plates[]` if home API fails or returns no plates |
| `archivePromise` | Fallback promise section |
| `domainPaths` | Fallback chamber cards |
| `objects` | Legacy demo catalog (mostly superseded by API) |
| `featuredCarId` / `featuredMotorcycleId` | Legacy demo signature ids |
| `editorialStory` / `homeClose` | Fallback home narrative blocks |
| `brands` / `journalArticles` / `navLinks` | Supporting lists |
| `DEMO_DISCLAIMER` | Non-claim disclaimer |

### 5.13 Home page CMS (staff)

| Surface | Behavior |
| --- | --- |
| `/admin/home` | Sectioned editor: Hero, Brands, Promise, Domains, Signatures, Featured, Editorial, Close |
| Per section | **Visible on home** toggle + text/CTA fields |
| Hero plates | Up to 5 product pins; empty → auto featured cars/motorcycles (+ fallback plates) |
| Domains | Per-chamber label/title/summary/href + optional image product or URL |
| Featured slots | Product pin or fallback type; eyebrow; flipped layout |
| Editorial | Optional pinned approved article; CTA + fallback copy/image |
| Public resolve | `GET /home` hydrates products/articles; disabled sections flagged `enabled: false` (client hides them) |
---

## 6. Styles

| File | Covers |
| --- | --- |
| `styles/tokens.css` | Design tokens (colors, type, space, motion) — **source of truth for hex values** |
| `styles/global.css` | Reset, chrome, typography, CTA ladder, auth, account, admin shell + **admin home CMS** form |
| `styles/archive.css` | Header, full-bleed hero, brand marquee, chambers, Discover, bordered object/featured cards, product detail |

### Clarity rules (2026-09-11)

- Inputs ≠ buttons: auth inputs use soft radius + white fill; primary actions use ink pills.
- `.meta` defaults to `--muted-ink` for readable labels; brass reserved for eyebrows (`.page-head .meta`, Discover/Search eyebrows).
- Object cards use stronger border + white-leaning fill for figure/ground.

### 6.1 Color tokens (`client/src/styles/tokens.css`)

Qissa-inspired lighter premium archive. Prefer CSS variables over hardcoding.

| Token | Hex / value | Role |
| --- | --- | --- |
| `--paper` | `#f4ebe3` | Page / surface base |
| `--paper-mid` | `#eadfd4` | Mid paper wash |
| `--paper-deep` | `#dfd0c2` | Deeper paper / inset fields |
| `--blush` | `#f0ddd6` | Soft blush wash |
| `--blush-deep` | `#e4c8be` | Deeper blush (hover gradients) |
| `--ink` | `#151b24` | Primary text |
| `--ink-soft` | `#243040` | Softened ink |
| `--muted-ink` | `#4e4841` | Secondary / readable labels |
| `--brass` | `#9a7843` | Brass accent / eyebrows |
| `--brass-bright` | `#c9a86a` | Brighter brass highlight |
| `--brass-soft` | `rgba(176, 141, 79, 0.32)` | Soft brass wash |
| `--navy` | `#243044` | Active chip / strong UI |
| `--navy-deep` | `#18202c` | Deep navy |
| `--forest` | `#2f3d38` | Domain accent (motorcycles) |
| `--forest-deep` | `#1f2a26` | Deep forest |
| `--oxide` | `#a34f32` | Warm oxide accent |
| `--white` | `#fff8f2` | Warm white |
| `--line` | `rgba(28, 36, 48, 0.1)` | Hairline borders |
| `--line-strong` | `rgba(28, 36, 48, 0.18)` | Stronger rules |
| `--line-brass` | `rgba(176, 141, 79, 0.55)` | Brass rules |
| `--glow` | `rgba(201, 168, 106, 0.18)` | Soft brass glow |

### 6.2 Typography tokens

| Token | Stack |
| --- | --- |
| `--font-display` | `"Cormorant Garamond", "DM Serif Display", Georgia, serif` |
| `--font-editorial` | `"Cormorant Garamond", "Fraunces", Georgia, serif` |
| `--font-ui` | `"Manrope", "IBM Plex Sans", system-ui, sans-serif` |
| `--font-meta` | `"IBM Plex Mono", ui-monospace, monospace` |

### 6.3 Shared control language

Ivory–gold **pill** buttons (Discover actions, homepage CTAs, card Details, Search/Clear):

- Border: brass-tinted (`color-mix` of `--brass` + `--ink`)
- Fill: paper → blush vertical gradient
- Hover: deeper blush/brass border, ink text
- Classes: `.btn`, `.btn--soft`, `.discover-page__action`, `.product-filters__text-action`, `.brand-dropdown__button`

Custom dropdown menus (Brands, Sort, Refine selects): ivory panel, soft shadow, rounded items — not native OS dark menus.

### 6.4 Design notes in force

- Soft bordered “chamber” card language on domain paths, object cards, and signature featured objects
- Home hero: full-bleed museum plate (config-driven); brand mark is a first-viewport signal
- Brand marquee: continuous scroll; duration scales with brand count; hover pauses; label “The brands”
- Discover: fixed-height workspace; filters rail + feed scroll independently; page header pinned above chamber
- Discover archive shuffle: seed in URL (`?sort=shuffle&seed=N`) + `sessionStorage`; API defaults missing seed to `1` (never `Date.now()`)
- Discover masonry: avoid `transform` on cards (breaks CSS columns)
- Compare tray: null when empty; compact at 1 item; full tray at 2+
- No hover photo-swap that breaks title↔image binding
- `useSectionReveal` observes late-mounted `[data-reveal]` nodes
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

1. **Land on Home** — config-driven hero plates, brand marquee, promise, domain chambers, signature objects, editorial, close  
2. **Enter a chamber** — domain path links into Discover filtered by domain  
3. **Discover feed** — masonry of cars/motorcycles/watches; stable shuffle until Reshuffle; open product pages  
4. **Product page** — `/products/:slug` gallery + identity, overview, why it matters, specs, rarity, market signals, related, linked journal essays; records a view  
5. **Journal** — `/journal` essay index; `/journal/:slug` long-form + related objects  
6. **Brands / Categories** — A–Z houses and taxonomy chambers with linked approved objects  
7. **Search** — `/search` query-first results with suggested recommendations  
8. **Admin** — `/admin` CMS including **Home**, approvals, products, brands, categories, articles, media, users, audit  
9. **API health** — `GET /api/v1/health` (+ Mongo connected when URI set)

---

## 9. Changelog (append newest on top)

### 2026-09-11 — Home page CMS

- Singleton `HomePageConfig` with public `GET /home` and staff `GET|PATCH /admin/home`.
- Admin **Home** editor (`/admin/home`) for every home section: copy, CTAs, product/article pins, section visibility.
- Public `HomePage` consumes resolved config (demoData only as offline fallback).
- OpenAPI paths `/home` + `/admin/home`; suite `server/tests/home.test.js`.

### 2026-09-11 — Home / Discover calm UI pass

- Home hero: full-bleed museum plate; cars/motorcycles preferred in plate pool.
- Brand marquee: continuous scroll (duration ~3.2s × brand count, min 90s); label **The brands**; soft pill “View all brands”.
- Featured/object cards keep soft bordered plate language; compare tray quieter when empty/low count.
- Discover archive shuffle: seed persisted in URL + `sessionStorage`; server missing-seed fallback is `1` (not `Date.now()`).

### 2026-09-11 — Collector product submission

- Authenticated collectors submit products under active brands via `/contribute` (URL images only; always `pending` / never featured).
- Ownership APIs: `GET|POST /contributions/products`, `GET|PATCH|DELETE /contributions/products/:id` (edit/withdraw while pending or rejected).
- `/account/submissions` list + edit route; Account menu and Profile CTAs.
- Admin approvals/product list/detail show `submittedBy` name/email when present.
- Regression suite `server/tests/contribution.test.js`; OpenAPI + API.md updated.

### 2026-09-11 — QA hardening pass

- Access tokens revalidated against DB (`tokenVersion`, status, soft-delete) so logout/password-change/disable revoke immediately.
- Admin privilege ceiling: only `superadmin` may create/manage superadmin accounts; no self role/status change.
- Media: SVG uploads blocked; remote URLs limited to http(s).
- Public approval gates + hostile query/body probes covered in `hardening.test.js`.
- Client: shared refresh lock, modal focus trap (`useModalBehavior`), Product tag invalidation on admin status/delete.
- Username rule (current): `^[A-Za-z0-9._\-!@#$]{3,30}$`. Compare tray max: **4**.

### 2026-09-11 (Phase 17) — Testing

- Server: `authAccount.test.js` (profile/email/password/refresh/logout/delete); `phase17.test.js` (recently viewed + collection ownership/PATCH edges).
- `testSupport/http.js` returns cookies + non-JSON bodies for refresh/logout flows.
- Client: Vitest smoke for `formatProductType` and `authSlice`; dropped `--passWithNoTests`.
- GitHub Actions workflow removed — run tests locally with `npm test` (root runs server + client).

### 2026-09-11 (Phase 16) — API documentation

- Added OpenAPI 3.0.3 machine document: `docs/openapi.json` (public + collector + admin surfaces).
- Human reference: `docs/API.md` (conventions, auth, endpoint map, maintenance).
- Served live: `GET /api/v1/openapi.json` (raw OpenAPI JSON) and `GET /api/v1/docs` (index).
- Test: `server/tests/openapi.test.js`.

### 2026-09-11 — Phase 19 performance

- Product/Brand/Article/Category/Tag indexes include `deletedAt` for public list filters.
- Discover shuffle hydrates by page ids; list queries use card projections (no tags/dossier fields).
- Search prefers Product `$text` hits when the index is available, with regex fallback.
- Home service uses `.lean()` and batched featured-by-type loads.
- Public GET routes set short `Cache-Control`; RTK keeps home/brands/categories/articles longer; `refetchOnFocus` off.
- Fonts trimmed to Cormorant / Manrope / IBM Plex Mono; hero/card images use async decode + priority.
- Tests: `server/tests/phase19.test.js`.

### 2026-09-11 — Phase 18 security hardening

- Rate limits: API ceiling + stricter auth limiter on login/register/refresh (`RATE_LIMITED` 429).
- CORS allowlist from `CLIENT_ORIGIN` (comma-separated); `TRUST_PROXY` for real client IPs.
- Request sanitize strips `$` / dotted operator keys from body/query/params.
- Passwords: bcrypt digests only (`BCRYPT_SALT_ROUNDS` default 12), `passwordHash` `select: false`, never returned in API JSON; login uses timing-equalized compares and generic `INVALID_CREDENTIALS`.
- Production requires JWT secrets ≥32 characters.
- Tests: `server/tests/phase18.test.js`.

### 2026-09-11 — Account settings + uniform profile actions

- Profile desk actions all use soft buttons (no mixed ink/soft CTAs); Edit profile and Delete account live under Settings.
- New `/account/settings`: edit profile, change email, change password, two-step delete account.
- Account menu adds Settings; Log out matches other menu item weight.
- API: `PATCH /auth/me/email`, `PATCH /auth/me/password` (password change bumps tokenVersion and reissues tokens).

### 2026-09-11 — Profile edit + delete account

- `PATCH /auth/me` edits first/last name and username (case + `. _ - ! @ # $` allowed; uniqueness case-insensitive).
- `DELETE /auth/me` two-step client flow: confirm → type username + password; soft-deletes collectors only.
- Profile desk: Edit profile control; Log out remains in account menu only.

### 2026-09-11 — Clarity + signup pass

**Auth / User**
- `User` adds `firstName`, `lastName`, unique `username` (`^[a-z0-9_]{3,24}$`); `name` remains derived display (`First Last`).
- `authService.register` validates new fields; codes `EMAIL_IN_USE`, `USERNAME_IN_USE`; always role `user`.
- `authService.login` returns generic `INVALID_CREDENTIALS` for unknown emails and wrong passwords (no account enumeration); register remains available from the login page.
- `authService.serializeUser` / `allocateUsername` / admin `createAdminUser` updated; seed admin gets `archivex_admin`.
- Header: guest **Log in** button; signed-in **AccountMenu** icon (Profile, Favorites, Collections, Compare, Admin, Log out).
- `/admin/login` remains staff-only (`staffOnly`); no public staff registration.

**Clarity UI**
- Auth plate: white inputs (soft radius) vs ink primary submit; first/last name row + username hint on register.
- Sitewide: stronger card borders/fills, readable `.meta` (brass reserved for eyebrows), primary `.btn` ink CTA ladder.
- `formatProductType` used on cards, featured, identity, breadcrumbs, related.
- Discover lede: browse/filter chamber; Search lede: find by name/brand.
- Favorite/collection gates pass `location.state.notice` on login.
- Account/Profile shows first/last/username/email; staff role only for staff.

**Follow-up (not in this pass):** password-change API, editable profile PATCH.

### 2026-09-11 — Split collector vs admin auth

- Public `/register` + `/login` for collectors; `POST /auth/register` always creates role `user`.
- Separate `/admin/login` for staff (`staffOnly`); operator accounts remain Admin → Users only.
- Admin gate redirects unauthenticated staff to `/admin/login`; Sign out returns there.

### 2026-09-11 (Phase 15) — Analytics

- Staff `GET /api/v1/admin/analytics` aggregates ProductView, Favorite, and Collection signals.
- `/admin/analytics` live page: attention metrics, catalog health, top viewed/favorited plates.
- Informational disclaimer only — not market or traffic guarantees.

### 2026-09-11 — Sitewide readability

- Stronger ink contrast, larger base type, looser leading, clearer nav/buttons, and prose-friendly product/article body copy across public + admin surfaces.

### 2026-09-11 — Full product stories

- Every seeded product now carries overview copy, why-it-matters, denser specs, materials/colors, and specific rarity/market notes (Atlas).

### 2026-09-10 — Live Atlas catalog refresh

- Expanded seed to **29** imaged products across more houses; brand logos + product cover images on Brands index.
- Home hero, domain chambers, and editorial pull from Atlas APIs (featured/recommended/articles).
- Uploaded media remains Atlas GridFS; catalog photos use remote Unsplash URLs stored in Atlas.

### 2026-09-10 (Phase 14) — Media

- `MediaAsset` library with staff upload (`multipart`) and remote URL registration.
- Uploaded bytes live in Atlas GridFS (`archivex_media`); streamed at `/api/v1/media/files/:id`.
- Admin Media page; product form image plates; brand logo + article hero URL fields.
- `media.test.js` covers upload, GridFS stream, remote register, and list.

### 2026-09-10 — Invite-only accounts

- Removed public “Create an account” from Sign in; `/register` redirects to `/login`.
- `POST /auth/register` returns 403 (`REGISTRATION_CLOSED`).
- Operators create accounts from `/admin/users` (`POST /admin/users`).
- Seed admin credentials live in `server/.env` + `LOCAL_CREDENTIALS.md` (gitignored); legacy `editor@archivex.local` removed on re-seed.

### 2026-09-10 (Phase 13) — Admin CMS

- Staff-gated `/api/v1/admin/*`: overview, products (CRUD + status), brands, categories, articles, users (admin+), audit log.
- `AuditLog` model + `auditService`; soft deletes for catalog entities.
- Client admin pages replace RouteShells; Approvals queue in nav.
- Public surfaces stay approved/active-only; pending submissions never leak.
- `admin.test.js` covers 403 for collectors, approve gate, create flows, and audit writes.

### 2026-09-10 (Phase 12) — Search / recommendations

- Live `/search` page: query-first input, domain pills, relevance results, pagination.
- `GET /products/recommended` returns featured/rarity-led public suggestions for landing and zero-result states.
- Mobile drawer includes Search; header search icon already routes to `/search`.
- `searchRecommend.test.js` covers text search approval gates and recommendations.

### 2026-09-10 (Phase 11) — Brands / categories

- Live `/brands` A–Z index with domain pills, search, letter jump; `/brands/:slug` chamber with approved objects.
- Live `/categories` taxonomy index + `/categories/:slug` chamber with approved objects.
- Brand/category APIs include `productCount`; brands support `q` name search.
- Seed expands to **145** luxury/collector houses (54 car, 35 motorcycle, 56 watch) and **15** categories via `seeds/brandCatalog.js`.
- Brand marquee and BrandIndex link into brand chambers.
- `brandsCategories.test.js` covers filters, inactive gating, and counts.

### 2026-09-10 (Phase 10) — Journal

- `Article` model with publish statuses, article types, sections, hero image, related products, domains.
- Public APIs: `GET /articles`, `GET /articles/:slug` (approved only); product journal returns linked essays.
- Seed adds three essays (car / motorcycle / watch) linked to catalog objects.
- Client: `JournalPage`, `ArticleDetailPage`, RTK article endpoints; `JournalPreview` and product journal link to essays.
- `journal.test.js` covers list/detail approval gates and product journal links.

### 2026-09-09 (Phase 9) — Collector features + proper compare

- Favorites API (`GET/POST/DELETE /favorites`) with auth; client sync via `FavoriteHydrator` + Favorites page.
- Collections CRUD + add/remove products; Collections list/detail pages and add-to-collection modal from product actions.
- Compare restored properly: local tray (max **4**), Discover/detail Compare buttons, floating `ComparisonTray`, public `/compare` page with domain-aware shared + type-specific spec sections.
- `GET /products?ids=` for tray/compare fetches; `GET /products/recently-viewed` on Favorites.
- Server `collector.test.js` covers favorites, collections, and ids filter.

### 2026-09-09 (Phase 8) — Dynamic product detail

- `ProductView` model + `POST /products/:id/view` for detail view tracking.
- `recommendationService` + `GET /products/:id/related` (type/brand/tag/rarity scoring) and `GET /products/:id/journal` stub.
- Product payload enriched with `whyItMatters`, `rarityProfile`, `marketSignals` (informational disclaimer).
- Seed attaches intelligence fields to all 16 demo products.
- Client detail framework: Identity, Actions, Specs, Rarity, Market, Related, Journal + gallery lightbox (keyboard, Escape, broken-image fallback).
- Local compare slice (max 3); favorite toggle via existing favorites slice; Collection button API-ready/disabled until Phase 9.
- **30** server tests passing (includes `productDetail.test.js`).

### 2026-09-09 (late night) — Phase 7 UI polish + tokens documented

- Shared ivory–gold pill buttons on Home (hero, marquee, chambers, featured, editorial, close) and object card / modal actions.
- Brands dropdown: in-menu search, Escape/click-outside, autofocus.
- Discover: page header pinned; chamber no longer overlaps title; feed/filters remain independently scrollable.
- `useSectionReveal` watches dynamically mounted sections so homepage signatures appear after API load.
- Design tokens (full hex table) recorded in §6.1.

### 2026-09-09 (night) — Phase 7 Discovery

- `searchService.js` builds public product filters: text search (name/reference/description/brand/category/tags), shared filters, and domain-aware specification filters.
- Product list supports sort (`shuffle`, `popularity`, `newest`, `rarity`, `relevance`, `name`), pagination with correct totals, and optional `fields` projection.
- `GET /products/filters/schema` returns domain-aware filter metadata.
- Discover UI: filter rail, sort, search, URL sync, pagination, skeleton/empty/error; cars/motorcycles lead, watches secondary.
- Public UX keeps Details modal (no compare/save on cards — collector actions remain Phase 9).
- 25 server tests passing (includes discovery suite).
- Fixed `RequireAuth` import paths.

### 2026-09-09 (late) — Phase 6 Authentication

- Auth: JWT access + httpOnly refresh; **bcrypt password digests** (never reversible encryption / never plaintext); `passwordHash` excluded from default queries and API JSON.
- Rate limits + CORS allowlist + request sanitize (Phase 18).
- Auth routes: register, login, refresh, logout, me.
- Client: login/register/account pages, auth slice, RTK reauth, RequireAuth / RequireAdmin.
- Account + admin layouts gated; header Sign in / Account.
- Seed admin password set for local operator (re-seed applied). Legacy editor account retired.
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

Phase 20 Deployment — follow [DEPLOYMENT.md](./DEPLOYMENT.md) on branch `deployment` (Render API + Vercel web).  
Phase 21 Acceptance — MVP checklist.
