# Cosine Create

A black-and-white site for a contract manufacturing studio: public brand pages, a public **Start a project** form, and a hidden studio for signed-in clients, a textiles buyer, and admin.

Clients order against their own catalog (sizes, colour, notes). The buyer orders fabric from the mill list. Admin tracks those orders and sees new leads from the public form. The public site never shows a Login link.

## What it does

| Who | What they get |
|-----|----------------|
| Visitor | Work, About, Process, People, brand lookbooks, Start a project |
| Client | After sign-in, their brand page with an order panel (`#/work/{client_slug}`) |
| Buyer | Cosine Textiles mill list and fabric orders (`#/work/cosine-textiles`) |
| Admin | All catalog orders (by company) plus **Potential customers** from `#/start` |

**Start a project** (`#/start`) is an enquiry, not a catalog order. It stores name, brand, email, phone, what they are making, quantity, stage, and notes. Admin can list and delete those enquiries.

**Catalog orders** are placed by a signed-in client from their lookbook (or by a buyer from the mill list). Admin can move a row between **Production** and **Dispatch** (the client sees that on their orders list) or delete a completed order, which downloads a completion PDF then removes the row.

Sign-in is hidden: triple-click the **COSINE CREATE** wordmark in the header (three clicks within two seconds) to open `#/login`. Studio emails use `@cosinecreate.com`.

## Repo layout

```
cosine-create/
├── frontend/                 React + Vite (hash routing)
│   ├── .env.production       VITE_API_BASE for the live API
│   ├── public/               lockup, lookbook photos, people photos
│   └── src/
│       ├── App.jsx           hash router
│       ├── api.js            fetch wrapper + JWT session
│       ├── data.js           public work, process copy, lookbooks
│       ├── measurements.js   garments, sizes, catalog matching
│       ├── clientHome.js     where a user lands after login
│       ├── components/       Navbar, Footer, Logo, OrderPanel, WorkGrid…
│       └── pages/            Home, About, Process, People, Start, Login,
│                             Admin, Lookbook, Project, Guard…
├── backend/                  Flask + JWT + SQLite locally, MySQL in production
│   ├── app.py                routes
│   ├── models.py             User, Product, Order, Inquiry, Fabric
│   ├── seed.py               demo users, catalogs, sample orders
│   ├── fabrics_data.py       mill list + buyer login
│   ├── security.py           bcrypt + JWT
│   ├── completion_pdf.py     PDF written when an order is deleted
│   ├── mailer.py             optional stage email / local outbox
│   ├── passenger_wsgi.py     cPanel / Passenger entry
│   ├── .htaccess             CORS preflight for api.cosinecreate.com
│   └── instance/             cosine.db (gitignored; local only)
├── package.json              `npm run dev` / `npm run build` → frontend
└── vercel.json               optional static frontend build
```

Public pages do not call the API. Login, products, fabrics, orders, and enquiries do.

## Run locally

You need both processes. Vite proxies `/api` to Flask on port 5000. Leave `VITE_API_BASE` unset in development so that proxy is used.

**API**

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
flask --app app:app seed
flask --app app:app run --port 5000
```

**Site** (from the repo root or `frontend/`)

```bash
npm install --prefix frontend
npm run dev          # http://localhost:5173
```

Optional: copy `backend/.env.example` to `backend/.env`. Do not commit `.env`. Local SQLite is `backend/instance/cosine.db`. `flask seed` wipes and reloads it.

### Seed logins

| Role   | Email                         | Password     | After login |
|--------|-------------------------------|--------------|-------------|
| admin  | admin@cosinecreate.com        | Admin123!    | `#/admin` |
| client | mwotaji@cosinecreate.com      | Mwotaji123!  | `#/work/mwotaji` |
| client | groove@cosinecreate.com       | Groove123!   | `#/work/the-groove-hangout` |
| buyer  | buyer@cosinecreate.com        | Buyer123!    | `#/work/cosine-textiles` |

These match the current Work brands: studio admin, MWOTAJI, The Groove Hangout, and Cosine Textiles. MWOTAJI has lookbooks that match the public work pages. The Groove Hangout has a small merch catalog so client isolation is easy to prove (a MWOTAJI token cannot order a Groove product).

## Routes

Hash routing: `http://localhost:5173/#/process`. Live site: `https://cosinecreate.com/#/process`.

| Hash | Who | What |
|------|-----|------|
| `#/` | public | Work |
| `#/about` `#/process` `#/people` | public | Studio pages |
| `#/work/mwotaji` | public | Brand page; order panel if you own that brand |
| `#/work/mwotaji/women/tops` | public | Lookbook |
| `#/start` | public | Enquiry form → admin Potential customers |
| `#/login` | hidden | Sign in |
| `#/studio` | client | Redirects to that client’s brand page |
| `#/admin` | admin | Orders by company + potential customers |

## API (short)

Local: `http://127.0.0.1:5000`. Live: `https://api.cosinecreate.com`. Send `Authorization: Bearer <token>` after login. Full notes: [`backend/README.md`](backend/README.md).

| Method | Path | Who |
|--------|------|-----|
| GET | `/api/health` | public — `{ "ok": true }` |
| POST | `/api/auth/login` | public |
| GET | `/api/me` | signed in |
| GET | `/api/products` | client: own catalog; admin: all |
| GET | `/api/fabrics` | mill list (buyer / admin) |
| GET / POST | `/api/orders` | client or buyer posts; both can list (scoped) |
| PATCH | `/api/orders/:id/stage` | admin — `produce` or `distribute` |
| DELETE | `/api/orders/:id` | admin — PDF download, then row gone |
| POST | `/api/inquiries` | public (Start a project) |
| GET / DELETE | `/api/inquiries` | admin |

## Deploy

**cPanel (current production)**

- Site: static build in `public_html` → https://cosinecreate.com
- API: Flask via **Setup Python App** on https://api.cosinecreate.com (`passenger_wsgi.py`, entry `application`)
- Database: MySQL. Set `DATABASE_URL=mysql+pymysql://USER:PASSWORD@localhost/DBNAME?charset=utf8mb4`
- CORS: `CORS_ORIGINS=https://cosinecreate.com,https://www.cosinecreate.com`
- Frontend production build uses `frontend/.env.production` (`VITE_API_BASE=https://api.cosinecreate.com`)

```bash
npm run build --prefix frontend
```

Upload the **contents** of `frontend/dist/` into `public_html` (so `index.html` sits in that folder, not inside a nested `dist/`). Put backend files in the Python app root. `flask seed` (or `SEED_IF_EMPTY=true` on a first start with no users) loads demo accounts; it wipes existing rows. Turn `SEED_IF_EMPTY` off after that.

**Vercel (frontend only)**

Point the project at `frontend/`, or keep the repo root and use `vercel.json` (`npm run build --prefix frontend`, output `frontend/dist`). The Flask API is a separate host; production already sets `VITE_API_BASE`.
