# ArchiveX Local E2E QA Report

**Generated:** 2026-09-11T14:24:31.289649+00:00
**Targets:** `http://localhost:5173` → `http://localhost:5001/api/v1`
**Intended engine:** Playwright **webkit** (Safari)
**Actual engine this run:** none (webkit blocked) — API + Vite route smoke + static review

## Executive summary

Full Playwright webkit UI automation could **not** run inside the Cursor agent seatbelt: `npx playwright install webkit` is blocked (`cdn.playwright.dev` / `playwright.download.prss.microsoft.com` not on the sandbox allow list), and system Safari/Chrome launches also fail under seatbelt. This report covers a **thorough light-traffic substitute**: Vite SPA route smoke, read-heavy API checks, static UI wiring review, admin API login (read-only), and **one** disposable `e2e+…` collector lifecycle with full cleanup.

**Counts:** PASS 49 · FAIL 0 · WARN 1 · SKIP 3

## Safety confirmation

| Check | Result |
| --- | --- |
| Production hosts hit (`archivex.pages.dev` / `onrender.com` / `pages.dev`) | **None** — `[]` |
| Requested hosts | `localhost:5001, localhost:5173` |
| Reseed | `False` |
| Admin CMS writes | `False` |
| E2E user | created `e2e+qamtx1rbjx@archivex.test` then **deleted** |

## Pass / fail matrix

| Area | Check | Status | Severity | Notes |
| --- | --- | --- | --- | --- |
| Infra | Engine intended | **WARN** | P0 | Playwright webkit blocked by Cursor seatbelt (cdn.playwright.dev 403); this run is API+route smoke + static review |
| Infra | Vite base | **PASS** |  | http://localhost:5173 |
| Infra | API base | **PASS** |  | http://localhost:5001/api/v1 |
| Infra | API health | **PASS** |  | db=connected status=200 |
| Public/Vite | SPA shell / | **PASS** |  | http=200 |
| Public/Vite | SPA shell /discover | **PASS** |  | http=200 |
| Public/Vite | SPA shell /brands | **PASS** |  | http=200 |
| Public/Vite | SPA shell /categories | **PASS** |  | http=200 |
| Public/Vite | SPA shell /journal | **PASS** |  | http=200 |
| Public/Vite | SPA shell /search | **PASS** |  | http=200 |
| Public/Vite | SPA shell /compare | **PASS** |  | http=200 |
| Public/Vite | SPA shell /privacy | **PASS** |  | http=200 |
| Public/Vite | SPA shell /login | **PASS** |  | http=200 |
| Public/Vite | SPA shell /register | **PASS** |  | http=200 |
| Public/Vite | SPA shell /admin/login | **PASS** |  | http=200 |
| Public/Vite | SPA shell /products/bmw-s1000rr | **PASS** |  | http=200 |
| Auth/E2E | Register one e2e+ user | **PASS** |  | e2e+qamtx1rbjx@archivex.test |
| Auth/E2E | Favorite once | **PASS** |  | product=bmw-s1000rr status=201 |
| Auth/E2E | Create collection | **PASS** |  | id=6aa40efc876cc758f98ac32d |
| Auth/E2E | Delete collection | **PASS** |  | status=200 |
| Auth/E2E | Unfavorite | **PASS** |  | status=200 |
| Auth/E2E | Delete account (API) | **PASS** |  | DELETE /auth/me with confirmUsername+password → 200; relogin 401 |
| Safety | Client API default is localhost:5001 | **PASS** |  |  |
| Public/Discover | Products API list | **PASS** |  | count=8 |
| Public/Product | Product detail API | **PASS** | P1 | bmw-s1000rr |
| Public/Discover | Products pagination page=2 | **PASS** |  | status=200 count=8 |
| Public/Discover | Domain filter cars (API) | **PASS** | P2 | count=4 |
| Public/Brands | Brands API | **PASS** |  | count=145 |
| Public/Brands | Brand detail API | **PASS** | P1 | a-lange-sohne |
| Public/Categories | Categories API | **PASS** |  | count=15 |
| Public/Categories | Category detail API | **PASS** | P2 | adventure-trail |
| Public/Journal | Articles API | **PASS** | P2 | status=200 count=3 |
| Public/Search | Search via products?q=BMW | **PASS** |  | No dedicated `/search` API (by design); `GET /products?q=BMW` returns matches (e.g. BMW S 1000 RR, BMW M4 Competition) |
| Public/Privacy | PrivacyPolicyPage exists + routed | **PASS** | P2 |  |
| Public/Home | ScrollToTop mounted in AppRoutes | **PASS** | P3 |  |
| Public/Footer | Archive → /discover | **PASS** | P2 |  |
| Public/Footer | Privacy → /privacy | **PASS** | P2 |  |
| Public/Footer | Journal → /journal | **PASS** | P2 |  |
| Public/Footer | Ivory Museum credit | **PASS** | P2 |  |
| Public/Footer | Vinik Dhariwal credit | **PASS** | P2 |  |
| Public/Discover | Filters component present | **PASS** | P1 |  |
| Public/Discover | Reshuffle in DiscoverPage | **PASS** | P2 |  |
| Public/Discover | Infinite scroll signal | **PASS** | P3 |  |
| Public/Compare | Compare UI referenced on product detail | **PASS** |  | compareSlice + ComparisonTray + ComparisonPage present |
| Admin | Admin login API | **PASS** |  | status=200 |
| Admin | Admin me/profile | **PASS** |  | status=200 |
| Admin | Admin analytics snapshot | **PASS** |  | status=200 |
| Admin | Admin products list (read) | **PASS** |  | status=200 |
| Admin | CMS writes during QA | **PASS** |  | None performed |
| Mobile | Viewport 390x844 smoke | **SKIP** |  | Requires Playwright webkit (blocked) |
| Public/Home | Visual hero / scroll-to-top runtime | **SKIP** |  | Requires browser |
| Admin | Admin overview UI visit | **SKIP** |  | API login verified; UI overview requires browser |
| Safety | No production app hosts hit | **PASS** |  | localhost:5001, localhost:5173 |

## Bugs

### 1. [P0] Infra — Playwright webkit E2E blocked by Cursor seatbelt

**Repro:** From Cursor agent Shell (CURSOR_SANDBOX=seatbelt): `cd /tmp/pw && npx playwright install webkit` → 403 Blocked by sandbox network policy for cdn.playwright.dev / playwright.download.prss.microsoft.com. Browser launch (webkit/Safari/Chrome) also fails under seatbelt. Workaround: run `/tmp/pw/archivex-qa-webkit.mjs` in an unsandboxed local terminal.

### Application notes (not bugs)

- No FAIL rows for public APIs, Vite shells, footer/privacy wiring, admin read APIs, or e2e collector cleanup.
- UI/runtime checks (hero paint, infinite-scroll behavior, mobile 390×844, admin overview chrome, scroll-to-top) remain **SKIP** until webkit can launch.

## UI / UX suggestions

- Museum hierarchy: Keep ArchiveX / Ivory Museum as the strongest first-viewport signal; avoid secondary marketing blocks competing with the brand hero.
- Discover: Domain → Brands → Refine hierarchy in ProductFilters is the right museum taxonomy; ensure active filter chips remain visible when the mobile drawer is closed.
- Discover: Reshuffle + infinite scroll should feel curated, not feed-like — prefer subtle loading cues over spinner spam.
- Footer: Credit line (ArchiveX / The Ivory Museum / Vinik Dhariwal) is strong; verify contrast of `.site-footer__meta` on light sections.
- Mobile 390×844: Home hero and Discover cards need full-bleed breathing room; filter toggle should not steal vertical space from the grid.
- Compare: Empty/partial tray should coach “add 2+ plates from product pages.”
- ScrollToTop is correctly mounted globally — good continuity after long Discover sessions.
- P0 infra: Re-run full Playwright webkit E2E from an unsandboxed terminal (`cd /tmp/pw; npx playwright install webkit; node archivex-qa-webkit.mjs`) once Cursor seatbelt allows cdn.playwright.dev.

## Cleanup actions taken

- `e2e-user-created:e2e+qamtx1rbjx@archivex.test`
- `favorite-added`
- `collection-created:id=6aa40efc876cc758f98ac32d`
- `collection-deleted`
- `favorite-removed`
- `account-deleted`

No Atlas reseed. No bulk admin catalog edits. Favorites and the disposable collection were removed; the e2e account was deleted via `DELETE /api/v1/auth/me` (confirmUsername + password).

## How to finish true webkit E2E

From a **normal unsandboxed** terminal (outside Cursor agent seatbelt):

```bash
export PLAYWRIGHT_BROWSERS_PATH=/tmp/pw-browsers
cd /tmp/pw
npx playwright install webkit
export QA_ADMIN_EMAIL=og@archivex.com
export QA_ADMIN_PASSWORD='OG@archiveX'
node archivex-qa-webkit.mjs
# then regenerate docs/E2E_LOCAL_QA_REPORT.md from tmp/qa-results.json
```

Script prepared at `/tmp/pw/archivex-qa-webkit.mjs` (guest-first, admin overview read-only, one optional e2e user, mobile 390×844, production URL abort).

## Artifacts

- `tmp/qa-results.json` — machine-readable results
- `/tmp/pw/archivex-qa-webkit.mjs` — full webkit Playwright suite (ready when browsers install)
- `/tmp/pw/archivex-qa-api-smoke.mjs` — this run’s API/route smoke
