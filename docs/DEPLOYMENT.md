# ArchiveX deployment (Render + Vercel)

Production split used by the `deployment` branch:

| Piece | Host | Source |
| --- | --- | --- |
| Database | MongoDB Atlas | `MONGODB_URI` |
| API | Render Web Service | `server/` |
| Website | Vercel | `client/` |

Always deploy from the **`deployment`** branch so `main` / `vinik` stay free of production deploy noise as much as possible.

---

## 0. One-time prep

1. Merge or fast-forward `deployment` from your latest working branch (`vinik` / `main`) when you want a release.
2. Confirm Atlas is reachable and seeded (`npm run seed --prefix server` from a trusted machine).
3. Generate two secrets (≥32 characters each) for JWT access + refresh.

---

## 1. Render — API

1. [Render Dashboard](https://dashboard.render.com) → **New** → **Web Service**.
2. Connect the GitHub repo `VinikDhariwal/ArchiveX`.
3. Settings:
   - **Branch:** `deployment`
   - **Root Directory:** `server`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/api/v1/health`
4. Environment variables:

| Key | Value |
| --- | --- |
| `NODE_ENV` | `production` |
| `MONGODB_URI` | Atlas connection string |
| `MONGODB_DB_NAME` | `archivex` |
| `CLIENT_ORIGIN` | your Vercel URL, e.g. `https://archivex.vercel.app` (update after step 2 if needed) |
| `JWT_ACCESS_SECRET` | random ≥32 chars |
| `JWT_REFRESH_SECRET` | different random ≥32 chars |
| `PUBLIC_ORIGIN` | your Render API URL, e.g. `https://archivex-api.onrender.com` |
| `TRUST_PROXY` | `1` |
| `BCRYPT_SALT_ROUNDS` | `12` |

5. Deploy. Copy the service URL. Smoke:  
   `curl https://YOUR-API.onrender.com/api/v1/health`

**Free tier note:** Render may spin the API down when idle; the first request after sleep is slow.

Optional: `render.yaml` at the repo root is a blueprint you can apply; still set secrets in the dashboard.

---

## 2. Vercel — website

1. [Vercel](https://vercel.com) → **Add New Project** → import the same GitHub repo.
2. Settings:
   - **Production Branch:** `deployment` (Project → Settings → Git)
   - **Root Directory:** `client`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
3. Environment variables (Production):

| Key | Value |
| --- | --- |
| `VITE_API_BASE_URL` | `https://YOUR-API.onrender.com/api/v1` |
| `VITE_APP_NAME` | `ArchiveX` |
| `VITE_APP_TAGLINE` | `Objects worth remembering.` |

4. Deploy. Copy the Vercel URL.
5. Back on Render, set `CLIENT_ORIGIN` to that exact Vercel origin (no trailing slash), then redeploy the API if you changed it.

`client/vercel.json` already rewrites SPA routes to `index.html`.

To reduce PR noise: in Vercel → Settings → Git, disable preview deployments for non-`deployment` branches if offered.

---

## 3. Wire Atlas network

In Atlas → Network Access, allow Render’s outbound IPs or (for a free demo) `0.0.0.0/0` temporarily. Prefer locking this down when you can.

---

## 4. Smoke checklist

1. Open the Vercel site → Home, Discover, a product page.
2. Log in (collector) and open `/admin/login` (staff).
3. Confirm images load (`PUBLIC_ORIGIN` / GridFS URLs).
4. Confirm CORS errors are absent (exact `CLIENT_ORIGIN` match).

---

## 5. Updating production later

```bash
git checkout deployment
git merge vinik   # or main — whichever has the release
git push origin deployment
```

Render and Vercel should redeploy from `deployment` automatically.
