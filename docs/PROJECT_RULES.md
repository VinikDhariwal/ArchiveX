# ArchiveX — Project Rules

This document is the permanent source of truth for ArchiveX. Every phase must read and follow it before writing or changing code.

---

## 1. Product identity

ArchiveX is a production-grade luxury **discovery**, **archive**, **editorial**, and **collector** platform.

ArchiveX is a premium **website**, not a mobile application, ecommerce marketplace, or SaaS dashboard.

Guests browse public content. Authenticated users can save, collect, compare, personalize, and **submit** products, images, and object information under brands. **Nothing contributor-submitted appears on the public website until an admin approves it.** Admins use `/admin` as the website control surface: hero panel content and images, brands, catalog, media, journal, approvals, users, and auditability.

---

## 2. Product priority (non-negotiable)

```text
ArchiveX
│
├── PRIMARY LAUNCH DOMAIN
│   ├── Cars
│   └── Motorcycles / Bikes
│
├── SECOND PRIORITY
│   └── Luxury Watches
│
└── FUTURE DOMAINS
    ├── Private Jets
    ├── Helicopters
    ├── Yachts
    ├── Bags
    ├── Fashion
    ├── Jewellery
    ├── Art
    ├── Audio
    ├── Furniture
    ├── Collectibles
    └── Other extraordinary luxury objects
```

### Rules

- Cars and motorcycles receive the strongest treatment in the initial website experience, seeded data, discovery, product pages, categories, brands, comparisons, journal, and admin workflows.
- Watches are fully supported as the second-priority domain.
- Do **not** design ArchiveX as a watch application that is later modified for cars and motorcycles.
- Build a **multi-domain luxury object platform from the beginning**, with Cars and Motorcycles as the first two domains.
- Future luxury domains must be addable without rewriting the base Product model.

### Minimum V1 product types

- `car`
- `motorcycle`
- `watch`

Future types must remain architecturally possible, including: `jet`, `helicopter`, `yacht`, `bag`, `fashion`, `jewellery`, `art`, `audio`, `furniture`, `collectible`, and other extraordinary luxury objects.

---

## 3. Technology contract

### Required

- JavaScript only
- MERN stack
- MongoDB Atlas
- Mongoose
- Node.js
- Express.js
- React
- Redux Toolkit
- RTK Query where appropriate
- REST API
- MVC backend architecture

### Forbidden

- TypeScript
- Next.js
- NestJS
- PostgreSQL
- GraphQL
- Firebase
- Supabase
- Another primary state-management library
- Serverless-only architecture

Do not introduce technology substitutions without an explicit project decision that updates this document.

---

## 3A. Production website rule — no hardcoding

ArchiveX is a **production website**. Treat every phase as production-grade code.

### Default rule

Nothing meaningful may be hardcoded in application code unless a phase prompt **explicitly** authorizes it (for example Phase 2 local demo data, or a named headline string in that phase).

### Must come from configuration, environment, database, or API

- Environment values (ports, origins, secrets, API base URLs, feature flags)
- Product catalog objects, brands, categories, articles, media
- Domain lists and product-type metadata used by runtime APIs
- User-facing copy that will become CMS/admin-managed content (once those systems exist)
- Auth, roles, and ownership claims
- Analytics and market figures

### Allowed without treating as “hardcoded product data”

- Design tokens and layout CSS specified by the visual system
- Structural enums defined once in shared config modules (not duplicated inline across files)
- Sensible **local development** fallbacks in env loaders, never relied on in production
- Explicit demo/seed content only when the active phase says to use local demo or seed data

### Forbidden patterns

- Inline product lists, fake market prices, or brand catalogs in components outside authorized demo/seed phases
- Secrets, tokens, or Atlas URIs in source
- Production URLs, CORS origins, or API hosts baked into components
- Trusting frontend-only role or ownership values
- Leaving temporary placeholders that look like real production data

When in doubt: put values in env, shared config, seed scripts, or API responses — not in UI components.

---

## 4. Backend architecture

Every backend feature must follow:

```text
Route → Middleware → Controller → Service → Model → MongoDB Atlas
```

### Layer responsibilities

| Layer | Responsibility |
| --- | --- |
| Routes | Endpoint composition |
| Middleware | Auth, roles, validation, rate limits, sanitization |
| Controllers | Thin: receive validated input, call services, return responses |
| Services | Business logic, query construction, filtering, sorting, pagination, domain validation |
| Models | Schemas, indexes, structural validation |

### Non-negotiable backend rules

- Controllers remain thin.
- Services contain business logic.
- Models do not contain business workflows.
- Backend authorization is mandatory; never trust frontend roles.
- Prefer deliberate projections; no uncontrolled populate.
- Soft deletion where appropriate.
- Centralized errors and safe logging.
- REST API versioning (`/api/v1/...`).

---

## 5. Frontend architecture

```text
Page → Feature Container → Reusable Components → Hooks → Redux Toolkit / RTK Query → REST API
```

### State ownership

| Concern | Tool |
| --- | --- |
| Genuine application / client state | Redux Toolkit |
| Server state, fetching, caching, invalidation, loading, sync | RTK Query |
| Transient UI (modals, drawers, gallery, hover, accordion, temporary form values) | Local React state |

### Website experience rules

- Desktop is a major design target (wide 1440px+ compositions).
- Use wide horizontal layouts, large editorial imagery, asymmetrical grids, full-width sections, strong typography, generous whitespace, museum/editorial composition.
- Do **not** make desktop screens look like mobile applications scaled up.
- Do **not** build app-like centered narrow layouts for public pages.
- Do **not** use generic SaaS dashboards for public-facing pages.
- Public pages must retain the wide premium website composition across routes.

---

## 6. Product model rule

The core Product model must be **domain-neutral**.

Do not hard-code all product properties into the base product schema.

Use:

- Shared product identity fields
- Product / domain type (`productType`)
- Shared commercial / archive information
- Category-aware, controlled specifications

Specifications must be structured and validated by domain. Do not allow completely uncontrolled arbitrary data. Do not render irrelevant domain fields (for example, watch case size on cars, or horsepower on watches).

---

## 7. Visual direction — The Ivory Museum

Selected direction: **THE IVORY MUSEUM**.

The interface should feel like:

- A private automotive and motorcycle archive
- A premium museum catalog
- A luxury editorial publication
- A collector intelligence platform

### Visual language

Use:

- Warm ivory
- Paper-like surfaces
- Deep forest green
- Black serif display typography
- Compact sans-serif UI typography
- IBM Plex Mono-style metadata
- Antique brass accents
- Restrained oxide-red rarity accents
- Thin borders
- Generous whitespace
- Minimal rounded corners
- Restrained shadows

### Color tokens (reference)

Live values live in `client/src/styles/tokens.css` (source of truth). Snapshot:

- `--paper: #f4ebe3`
- `--paper-deep: #dfd0c2`
- `--ink: #151b24`
- `--muted-ink: #4e4841`
- `--brass: #9a7843`
- `--oxide: #a34f32`
- `--forest: #2f3d38`
- `--white: #fff8f2`
- `--line: rgba(23, 24, 23, 0.12)`

### Avoid

- Purple gradients
- Neon UI
- Generic SaaS cards
- Standard ecommerce layouts
- Excessive rounded cards
- Excessive shadows
- Emoji as interface controls

---

## 8. Product experience (not ecommerce)

ArchiveX is **not** an ecommerce marketplace.

### Do not build

- Cart
- Checkout
- Purchasing flow
- Aggressive sales UI

### Emphasize

- Discovery
- History
- Design
- Engineering
- Craftsmanship
- Performance
- Provenance
- Rarity
- Collector interest
- Market signals (informational, never guaranteed prices)
- Editorial storytelling

---

## 9. Authentication and roles

### Access model

- Guests can browse **approved** public content only.
- Authenticated users (`user`) can eventually: save favorites, create collections, compare objects, save comparisons where supported, follow brands where implemented, view recently viewed objects, manage profile/settings, receive personalized recommendations, and **contribute** catalog material (products, images, specs/copy tied to brands and domains).
- Contributor submissions enter a **pending** state. They must be **approved by admin** (or an authorized moderator/editor) before they are visible on public routes (home, discover, product detail, brand pages, search, etc.).
- Rejected or pending items must never leak into public APIs or SEO surfaces.

### Contribution and approval (non-negotiable)

- Login exists so people other than the site operator can add images, products, and related info under brands.
- Public display requires an explicit admin approval step from `/admin` (moderation queue).
- Admin may also edit, reject, or request changes before approval.
- Seed/demo content used in early phases is operator-owned and may be treated as pre-approved for local demo only.

### Roles

- `user` — collector + contributor (submissions pending until approved)
- `editor` — may manage editorial/catalog drafts as defined in later phases
- `moderator` — may review and approve/reject contributor submissions
- `admin` — full website CMS + approvals + users
- `superadmin` — elevated admin (ops / break-glass)

Backend authorization is authoritative. Never trust frontend role claims.

---

## 10B. Imagery and interaction rules

- Card/grid hover must **not** swap photographs while titles stay fixed.
- Product titles and primary images must stay aligned; rename demo objects or replace photos rather than mismatch.
- Multi-image viewing happens on product detail with premium fade transitions between plates.
- Museum frames stay subtle (hairline brass + ivory mat).

| Nav | Route | Behavior |
| --- | --- | --- |
| Discover | `/discover` | Shuffled multi-domain product feed (cars, motorcycles, watches). Not watch-first. |
| Brands | `/brands` | Alphabetical A–Z by default; filterable by product domain/category. |
| Categories | `/categories` | Domain taxonomy exploration. |
| Journal | `/journal` | Editorial archive. |
| Collections | `/collections` | Authenticated collector collections. |

### Public

- Landing page
- Discovery
- Search
- Product detail
- Brand pages
- Category pages
- Journal

### Authenticated

- Registration
- Login
- Favorites
- Collections
- Comparison
- Account settings
- Recently viewed
- Contributor submissions (products, images, object info under brands) — pending until approved

### Admin (`/admin`) — website CMS + moderation

`/admin` is not a generic SaaS dashboard. It is the control room for what the public website shows.

- **Hero / homepage panel** — featured plates, images, copy, and related hero data
- Brand add / edit / remove
- Product management (operator-created and contributor-submitted)
- **Approval queue** — approve / reject / request changes for user submissions before public display
- Category management
- Article / journal management
- Media management
- User management
- Audit logs
- Basic analytics

### Infrastructure (MVP)

- MongoDB Atlas
- Express MVC
- REST API
- Redux Toolkit
- RTK Query
- Authentication and authorization
- Validation
- Rate limiting
- Logging
- Testing
- Deployment documentation

---

## 11. Post-MVP

- MongoDB Atlas Search
- Advanced recommendation ranking
- Price history visualization
- Public collector profiles
- Shared collections
- Collection following
- Product watchlists
- Editorial comments
- Verified provenance records
- Condition grading
- Dealer / marketplace integrations
- Notification system
- Email digests
- Advanced admin analytics
- Additional luxury domains
- International currencies
- Localization
- Advanced media processing
- Large catalog import tools

Do not implement post-MVP features during earlier phases unless this document is explicitly revised.

---

## 12. Phase operating rules

Before changing files in any phase:

1. Read this document.
2. Inspect the current repository.
3. Understand what has already been implemented.
4. Reuse existing components and utilities.
5. Do not create duplicate modules.
6. Do not rewrite working functionality unnecessarily.
7. Do not implement future phases prematurely.
8. Preserve the Ivory Museum design system.
9. Preserve the wide premium website experience on desktop.
10. Do not turn public website pages into mobile-app-style layouts.
11. Preserve Cars and Motorcycles as the primary product domains.
12. Preserve Watches as the second-priority domain.
13. Keep the product architecture multi-domain.
14. Follow JavaScript-only requirements.
15. Follow MERN architecture.
16. Follow Express MVC.
17. Keep controllers thin.
18. Put business logic in services.
19. Use Redux Toolkit for genuine global/client state.
20. Use RTK Query for server state.
21. Use React local state for transient UI state.
22. Do not introduce technology substitutions.
23. Do not add speculative infrastructure.
24. Do not create features belonging to later phases.
25. Do not hardcode production data, URLs, secrets, or catalog content unless the active phase explicitly requires demo/seed values.
26. Prefer env, shared config, database, and API responses over inline literals.
27. Run the relevant verification commands after implementation.
28. Fix errors before declaring the phase complete.
29. Report what changed, what was tested, and what remains.
30. Do not claim a feature is implemented unless it exists and has been verified.

### Correct development order

```text
Phase 0  Project rules
Phase 1  Foundation
Phase 2  Ivory Museum website
Phase 3  Routing
Phase 4  Multi-domain models
Phase 5  MVC APIs
Phase 6  Authentication
Phase 7  Discovery
Phase 8  Dynamic product detail
Phase 9  Collector features
Phase 10 Journal
Phase 11 Brands / categories
Phase 12 Search / recommendations
Phase 13 Admin
Phase 14 Media
Phase 15 Analytics
Phase 16 API documentation
Phase 17 Testing
Phase 18 Security hardening
Phase 19 Performance
Phase 20 Deployment
Phase 21 Acceptance
```

---

## 13. Repository

- GitHub remote: `https://github.com/VinikDhariwal/ArchiveX.git`
- Local project root owns its own git repository.
- Do not commit secrets (`.env`, credentials, tokens).

---

## 14. Decision log

### 1. Why cars and motorcycles are primary

ArchiveX launches as a private automotive and motorcycle archive. Cars and motorcycles define the visual language, seeded catalog strength, discovery paths, editorial voice, and collector workflows. They must receive the strongest treatment across website experience, data, and admin tooling.

### 2. Why watches are second

Luxury watches are a natural adjacent collector domain with strong archival, rarity, provenance, and editorial value. They are fully supported in V1, but must not dominate information architecture, homepage composition, or schema design.

### 3. Why the architecture is multi-domain

A watch-first schema or UI would force a rewrite when cars and motorcycles become primary. Domain-neutral product identity plus controlled, type-aware specifications allows V1 domains and future luxury objects without restructuring the platform.

### 4. Why Ivory Museum is selected

The Ivory Museum direction communicates archival seriousness: warm paper surfaces, forest authority, brass metadata, serif display typography, and museum spacing. It fits cars, motorcycles, and watches without looking like ecommerce or SaaS.

### 5. What is MVP

Public discovery and editorial surfaces; authenticated collector tools (favorites, collections, comparison, account, recently viewed); **user contribution of products/images under brands with admin approval before public display**; `/admin` as website CMS (hero panel, brands, catalog, media, approvals, users); MERN/MVC/REST foundation with auth, validation, rate limiting, logging, tests, and deployment documentation. See Section 10.

### 6. What is post-MVP

Advanced search, richer recommendations, price history, social collector features, provenance/condition systems, marketplace integrations, notifications, localization, additional domains, and advanced ops/analytics. See Section 11.

### 7. Which architecture rules are non-negotiable

- Cars + motorcycles primary; watches secondary; multi-domain from day one
- JavaScript-only MERN; Express MVC; Redux Toolkit + RTK Query; REST
- Domain-neutral Product model with controlled specifications
- Website-first Ivory Museum desktop experience
- Production website: no hardcoding of data, secrets, hosts, or catalog content unless a phase explicitly authorizes demo/seed values
- No cart/checkout/purchasing flows
- `/admin` is the website CMS (hero, brands, catalog, media) plus contribution moderation
- Contributor submissions stay pending until admin approval; public surfaces show approved content only
- Backend authorization never deferred to the frontend
- Thin controllers; business logic in services
- No forbidden stack substitutions
- No premature later-phase features or speculative infrastructure

### 8. Why contributor content is admin-gated

ArchiveX is a curated archive, not an open dump. Login lets other people propose objects under brands, but the public museum surface stays editorial: only admin-approved submissions appear on the website. This keeps rarity, imagery quality, and brand integrity under operator control while still allowing community contribution.
---

## 15. Verification checklist for this document

Confirm this file permanently records:

- [x] Cars as primary
- [x] Motorcycles as primary
- [x] Watches as secondary
- [x] Future domains
- [x] Multi-domain architecture
- [x] MERN
- [x] MVC
- [x] Redux Toolkit
- [x] RTK Query
- [x] Ivory Museum
- [x] Website-first desktop experience
- [x] Production no-hardcoding rule
- [x] `/admin` as website CMS (hero, brands, catalog, media)
- [x] Authenticated user contributions under brands
- [x] Admin approval required before public display
