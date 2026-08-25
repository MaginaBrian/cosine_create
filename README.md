# Cosine Create

Two folders:

- `frontend/` — React + Vite site (hash routing)
- `backend/` — Flask API (JWT, bcrypt, SQLite)

Public pages (Work, About, Process, People) do not require login and do not show a login link. Triple-click the **COSINE CREATE** wordmark in the header (three clicks within 2 seconds) to open `#/login`. Catalog orders live in the client studio after sign-in. `#/start` remains a public inquiry form and does not create catalog orders.

## Run the API

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
flask --app app:app seed
flask --app app:app run --port 5000
```

Details and isolation curl: `backend/README.md`.

### Seed credentials

| Role   | Email                 | Password     |
|--------|-----------------------|--------------|
| admin  | admin@cosine.create   | Admin123!    |
| client | mwotaji@mwotaji.com   | Mwotaji123!  |
| client | atelier@example.com   | Atelier123!  |

Copy `backend/.env.example` to `backend/.env` if you want local secrets. Do not commit `.env`.

## Run the site

```bash
cd frontend
npm install
npm run dev       # http://localhost:5173 (or 5174 if 5173 is taken)
```

Vite proxies `/api` to Flask on port 5000.

### Frontend routes

| Hash | Who | What |
|------|-----|------|
| `#/` | public | Work |
| `#/about` `#/process` `#/people` | public | Brand pages |
| `#/work/mwotaji` | public | MWOTAJI lookbooks |
| `#/start` | public | Generic inquiry (not a catalog order) |
| `#/login` | hidden | Sign in (triple-click the header wordmark) |
| `#/studio` | client JWT | Catalog order dashboard |
| `#/admin` | admin JWT | All orders |

## Deploy (Vercel)

The site lives in `frontend/`. Vercel should:

- **Root Directory:** `frontend` (Project Settings → General)
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

If Root Directory stays the repo root, `vercel.json` at the root already runs the frontend install and build.
