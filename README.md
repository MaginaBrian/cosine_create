# Cosine Create

A black-and-white site for a contract manufacturing studio: public brand pages, a public **Start a project** form, and a hidden studio for signed-in clients and admin.

Clients order against their own catalog (sizes, colour, notes). Admin tracks those orders and sees new leads from the public form. The public site never shows a Login link.

## What it does

| Who | What they get |
|-----|----------------|
| Visitor | Work, About, Process, People, brand lookbooks, Start a project |
| Client | After sign-in, their brand page with an order panel (`#/work/{client_slug}`) |
| Admin | All catalog orders (by company) plus **Potential customers** from `#/start` |

**Start a project** (`#/start`) is an enquiry, not a catalog order. It stores name, brand, email, what they are making, quantity, where they are, and notes. Admin can list and delete those enquiries.

**Catalog orders** are placed by a signed-in client from their lookbook. Admin can move a row between **Production** and **Dispatch** (the client sees that on their orders list) or delete a completed order, which downloads a completion PDF then removes the row.

Sign-in is hidden: triple-click the **COSINE CREATE** wordmark in the header (three clicks within two seconds) to open `#/login`.

## Repo layout

```
cosine-create/
├── frontend/                 React + Vite (hash routing)
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
├── backend/                  Flask + JWT + SQLite
│   ├── app.py                routes
│   ├── models.py             User, Product, Order, Inquiry
│   ├── seed.py               demo users, catalogs, sample orders
│   ├── security.py           bcrypt + JWT
│   ├── completion_pdf.py     PDF written when an order is deleted
│   ├── mailer.py             optional stage email / local outbox
│   └── instance/             cosine.db (gitignored)
├── package.json              `npm run dev` / `npm run build` → frontend
└── vercel.json               production build of frontend/
```

Public pages do not call the API. Login, products, orders, and enquiries do.

## Run locally

You need both processes. Vite proxies `/api` to Flask on port 5000.

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

Optional: copy `backend/.env.example` to `backend/.env`. Do not commit `.env`. SQLite lives at `backend/instance/cosine.db`. `flask seed` wipes and reloads it.

### Seed logins

| Role   | Email                 | Password     | After login |
|--------|-----------------------|--------------|-------------|
| admin  | admin@cosine.create   | Admin123!    | `#/admin` |
| client | mwotaji@mwotaji.com   | Mwotaji123!  | `#/work/mwotaji` |
| client | atelier@example.com   | Atelier123!  | `#/work/atelier` |

MWOTAJI has lookbooks that match the public work pages. Atelier has a small catalog so client isolation is easy to prove (a MWOTAJI token cannot order an Atelier product).

## Routes

Hash routing: `http://localhost:5173/#/process`.

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

Base: `http://127.0.0.1:5000`. Send `Authorization: Bearer <token>` after login. Full notes: [`backend/README.md`](backend/README.md).

| Method | Path | Who |
|--------|------|-----|
| POST | `/api/auth/login` | public |
| GET | `/api/me` | signed in |
| GET | `/api/products` | client: own catalog; admin: all |
| GET / POST | `/api/orders` | client posts; both can list (scoped) |
| PATCH | `/api/orders/:id/stage` | admin — `produce` or `distribute` |
| DELETE | `/api/orders/:id` | admin — PDF download, then row gone |
| POST | `/api/inquiries` | public (Start a project) |
| GET / DELETE | `/api/inquiries` | admin |

## Deploy (Vercel)

Only the frontend is built for Vercel. Point the project at `frontend/`, or keep the repo root and use `vercel.json` (`npm run build --prefix frontend`, output `frontend/dist`). The Flask API is a separate host; set the frontend’s API base if it is not on the same origin.
