# Cosine Create

Two folders:

- `frontend/` — React + Vite site
- `backend/` — API

## Run the site

```bash
cd frontend
npm install
npm run dev       # http://localhost:5173
```

## Deploy (Vercel)

The site lives in `frontend/`. Vercel should:

- **Root Directory:** `frontend` (Project Settings → General)
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

If Root Directory stays the repo root, `vercel.json` at the root already runs the frontend install and build.
