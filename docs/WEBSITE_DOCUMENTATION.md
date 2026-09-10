# ArchiveX — Living Website Documentation

**Status:** Living document — update this file whenever libraries, routes, components, APIs, or product behavior change.  
**Last updated:** 2026-09-10 (Phase 12 Search / recommendations)
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
| Phase 7 UI polish | Done — ivory-gold pills, brand search, Discover chamber layout, reveal fix |
| Phase 8 Product detail | Done — domain-aware detail, related, views, gallery lightbox |
| Phase 9 Collector features | Done — favorites, collections, compare tray/page, recently viewed |
| Phase 10 Journal | Done — Article model, public `/articles`, `/journal` pages, product journal links |
| Phase 11 Brands / categories | Done — live A–Z brands + category taxonomy; expanded seed houses |
| Phase 12 Search / recommendations | Done — `/search` page, recommended products API, relevance results |
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
| `models/Product.js` | Domain-neutral Product + images, status, specs, rarityProfile, marketSignals, whyItMatters |
| `models/ProductView.js` | Detail view events (session/user/source) |
| `models/Favorite.js` | User ↔ product favorites |
| `models/Collection.js` | Collector collections |
| `models/Article.js` | Journal essays (status-gated, related products) |
| `models/shared/productSubdocuments.js` | `buildSpecifications`, `assertValidSpecifications` |
| `models/index.js` | Barrel exports |
| `services/searchService.js` | Public discovery filters, sort modes, shuffle, field selection |
| `services/recommendationService.js` | Related objects + Search recommendations; product journal via articleService |
| `services/articleService.js` | Public article list/detail + product journal links |
| `services/productService.js` | Product list/detail serialize, view recording |
| `services/brandService.js` | Public brand list/detail + product counts + name search |
| `services/categoryService.js` | Public category list/detail + product counts |
| `seeds/brandCatalog.js` | Expanded luxury house + taxonomy seed catalog |
| `seeds/seedDemo.js` | Migrates website demo catalog + journal essays + full brand/category catalog |
| `controllers/productController.js` | Thin product handlers |
| `controllers/brandController.js` | Thin brand handlers |
| `controllers/categoryController.js` | Thin category handlers |
| `controllers/articleController.js` | Thin article handlers |
| `routes/productRoutes.js` | `/products` |
| `routes/brandRoutes.js` | `/brands` |
| `routes/categoryRoutes.js` | `/categories` |
| `routes/articleRoutes.js` | `/articles` |
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
| `/products/:slug` | `ProductDetailPage` | Domain-aware detail: gallery, specs, rarity, market, related |
| `/search` | `SearchPage` | Query-first archive search + recommendations |
| `/brands` | `BrandsPage` | A–Z houses with domain filter + search |
| `/brands/:slug` | `BrandDetailPage` | Brand chamber + approved objects |
| `/categories` | `CategoriesPage` | Domain taxonomy index |
| `/categories/:slug` | `CategoryDetailPage` | Category chamber + approved objects |
| `/journal` | `JournalPage` | Approved essay index |
| `/journal/:slug` | `ArticleDetailPage` | Long-form essay + related objects |
| `/compare` | `ComparisonPage` | Domain-aware side-by-side compare (up to 4; public tray) |
| `/account` | `AccountPage` | Authenticated collector hub |
| `/favorites` | `FavoritesPage` | Synced favorites + recently viewed |
| `/collections` | `CollectionsPage` | Collection list + create |
| `/collections/:id` | `CollectionDetailPage` | Collection detail / manage objects |
| `/admin/*` | shells | Admin layout |
| `/unauthorized` | `UnauthorizedPage` | Forbidden placeholder |
| `*` | `NotFoundPage` | 404 |

### 5.6 Pages

| File | Role |
| --- | --- |
| `HomePage.jsx` | Hero → marquee → promise → chambers → signatures → editorial → close |
| `DiscoverPage.jsx` | URL-synced discovery: search, filters, sort, pagination, masonry |
| `LoginPage.jsx` / `RegisterPage.jsx` / `AccountPage.jsx` | Auth surfaces |
| `ProductDetailPage.jsx` | Domain-aware product intelligence page |
| `ComparisonPage.jsx` | Wide compare table from tray ids |
| `FavoritesPage.jsx` | Saved favorites + recently viewed |
| `CollectionsPage.jsx` / `CollectionDetailPage.jsx` | Collector collections |
| `JournalPage.jsx` | Editorial archive index |
| `ArticleDetailPage.jsx` | Journal essay detail |
| `BrandsPage.jsx` / `BrandDetailPage.jsx` | Brand A–Z index + chamber |
| `CategoriesPage.jsx` / `CategoryDetailPage.jsx` | Category taxonomy index + chamber |
| `SearchPage.jsx` | Query-first search + suggested recommendations |
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
| `components/compare/ComparisonTray.jsx` | Fixed bottom tray (max 4) |
| `components/compare/ComparisonTable.jsx` | Domain-aware compare sections |
| `components/collector/FavoriteHydrator.jsx` | Syncs server favorites into local slice |
| `components/collector/CreateCollectionModal.jsx` | Create collection dialog |
| `components/collector/AddToCollectionModal.jsx` | Add product to collection picker |

### 5.9 Archive components

| File | Role |
| --- | --- |
| `ArchiveHero.jsx` | Autoplay plate carousel, orbit peeks, CTAs; navigates to product on plate click |
| `BrandMarquee.jsx` | Endless brand ribbon with links to brand chambers |
| `BrandIndex.jsx` | A–Z brand tile grid linking to `/brands/:slug` |
| `ArchivePromise.jsx` | Mission + quote |
| `DomainPaths.jsx` | Three **bordered chamber cards** (Cars / Motorcycles / Watches) |
| `FeaturedObject.jsx` | Signature spread in **same soft bordered box**; opens Details modal only (no “View” link) |
| `EditorialStory.jsx` | Journal teaser |
| `HomeClose.jsx` | Discover / Journal closing paths |
| `JournalPreview.jsx` | Essay card grid (links to `/journal/:slug`) |
| `ObjectCard.jsx` | Discover card; Details + Compare; links to `/products/:slug` |
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
| `features/products/productApi.js` | Discover URL ↔ query helpers |
| `features/products/productSelectors.js` | Product list selectors |
| `app/api.js` | RTK Query: products, auth, favorites, collections, recently viewed |

### 5.12 Demo data (`data/demoData.js`)

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
| `styles/tokens.css` | Design tokens (colors, type, space, motion) — **source of truth for hex values** |
| `styles/global.css` | Reset, page chrome, typography utilities, shared `.btn` / `.btn--soft` pills, shells, skeletons |
| `styles/archive.css` | Header, hero, marquee, chambers, featured objects, Discover workspace, object cards, detail modal, product detail |

### 6.1 Color tokens (`client/src/styles/tokens.css`)

Qissa-inspired lighter premium archive. Prefer CSS variables over hardcoding.

| Token | Hex / value | Role |
| --- | --- | --- |
| `--paper` | `#f4ebe3` | Page / surface base |
| `--paper-mid` | `#eadfd4` | Mid paper wash |
| `--paper-deep` | `#dfd0c2` | Deeper paper / inset fields |
| `--blush` | `#f0ddd6` | Soft blush wash |
| `--blush-deep` | `#e4c8be` | Deeper blush (hover gradients) |
| `--ink` | `#1c2430` | Primary text |
| `--ink-soft` | `#2c3644` | Softened ink (pill labels) |
| `--muted-ink` | `#6f675f` | Secondary / meta text |
| `--brass` | `#b08d4f` | Brass accent / borders |
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

- Soft bordered “chamber” card language reused for signature featured objects
- Discover: fixed-height workspace; filters rail + feed scroll independently; page header pinned above chamber
- Discover masonry: avoid `transform` on cards (breaks CSS columns)
- No hover photo-swap that breaks title↔image binding
- Details modal replaces Compare/Save on public feed cards (collector actions Phase 9)
- `useSectionReveal` observes late-mounted `[data-reveal]` nodes (API-driven homepage signatures)
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
4. **Product page** — `/products/:slug` gallery + identity, overview, why it matters, specs, rarity, market signals, related, linked journal essays; records a view  
5. **Journal** — `/journal` essay index; `/journal/:slug` long-form + related objects  
6. **Brands / Categories** — A–Z houses and taxonomy chambers with linked approved objects  
7. **Search** — `/search` query-first results with suggested recommendations  
8. **Admin** — shells until Phase 13  
9. **API health** — `GET /api/v1/health` (+ Mongo connected when URI set)

---

## 9. Changelog (append newest on top)

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

When Phase 13 Admin CMS lands, replace admin RouteShell pages with live catalog/editorial management.
