# Cosine Create API

Flask API for client catalog orders and admin review. Public Work / About / Process / People pages do not use this API. The frontend has no Login nav item; open `#/login` by triple-clicking the header wordmark.

## Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # optional; placeholders work for local seed
```

`.env.example` has `SECRET_KEY` and `JWT_SECRET` placeholders. Do not commit a real `.env`.

## Seed

Resets SQLite (`instance/cosine.db`) and loads demo users, MWOTAJI + Atelier catalogs, and two sample orders.

```bash
flask --app app:app seed
```

### Seed credentials

| Role   | Email                 | Password     | Brand        |
|--------|-----------------------|--------------|--------------|
| admin  | admin@cosine.create   | Admin123!    | Cosine Create |
| client | mwotaji@mwotaji.com   | Mwotaji123!  | MWOTAJI      |
| client | atelier@example.com   | Atelier123!  | Atelier      |

MWOTAJI products match the public lookbooks: men/women tops and bottoms, hoodies, sweatshirts, plus individual looks. Atelier has a two-item catalog so client isolation is easy to prove.

## Run

```bash
flask --app app:app run --port 5000
# or: python app.py
```

API: `http://127.0.0.1:5000`

CORS allows the Vite origins `localhost:5173` and `localhost:5174`. In frontend dev, Vite proxies `/api` to this server.

## Auth

- `POST /api/auth/login` with `{ "email", "password" }` returns `{ token, user }`.
- Send `Authorization: Bearer <token>` on later requests.
- Passwords are bcrypt-hashed. Roles are `client` or `admin`.
- Clients are scoped by `client_slug` (e.g. `mwotaji`). They can only list and order their own products.
- Admin JWTs can list all products and orders (with user info). They cannot create catalog orders. Client JWTs cannot use admin as a role; `/api/orders` for a client returns only that client's orders.

## Endpoints

| Method | Path | Who | Notes |
|--------|------|-----|--------|
| POST | `/api/auth/login` | public | `{ email, password }` → `{ token, user: { role, brand, name, ... } }` |
| GET | `/api/me` | auth | Current user |
| GET | `/api/products` | auth | Client: own catalog. Admin: all |
| POST | `/api/orders` | client | Must reference a product they own; other brands → **403** |
| GET | `/api/orders` | auth | Client: own orders. Admin: all, including who submitted |

`POST /api/orders` body:

```json
{
  "product_id": 1,
  "name": "Amina Mwotaji",
  "brand": "MWOTAJI",
  "email": "mwotaji@mwotaji.com",
  "making": "Apparel",
  "quantity": 80,
  "stage": "idea",
  "notes": "Fabric, silhouette, timeline."
}
```

Stages: `idea` | `sample` | `produce` | `reorder`.

## Isolation check

A MWOTAJI token posting an order for an Atelier `product_id` must return 403. See the repo README or run:

```bash
# after flask run
MWOTA=$(curl -s -X POST http://127.0.0.1:5000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"mwotaji@mwotaji.com","password":"Mwotaji123!"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")

ATELIER_PID=$(curl -s http://127.0.0.1:5000/api/products \
  -H "Authorization: Bearer $(curl -s -X POST http://127.0.0.1:5000/api/auth/login \
    -H 'Content-Type: application/json' \
    -d '{"email":"atelier@example.com","password":"Atelier123!"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['products'][0]['id'])")

curl -s -o /dev/stderr -w "%{http_code}\n" -X POST http://127.0.0.1:5000/api/orders \
  -H "Authorization: Bearer $MWOTA" \
  -H 'Content-Type: application/json' \
  -d "{\"product_id\": $ATELIER_PID, \"name\": \"Amina\", \"brand\": \"MWOTAJI\", \"email\": \"mwotaji@mwotaji.com\", \"quantity\": 50, \"stage\": \"idea\"}"
```
