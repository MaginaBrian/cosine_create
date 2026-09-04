# Cosine Create API

Flask API for catalog orders, admin review, and public **Start a project** enquiries. Public Work / About / Process / People pages do not use this API.

Open `#/login` by triple-clicking the header wordmark. Setup from the repo root is in the [main README](../README.md).

## Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # optional; placeholders work for local seed
flask --app app:app seed
flask --app app:app run --port 5000
```

API: `http://127.0.0.1:5000`. Vite proxies `/api` here. CORS allows `localhost:5173` and `5174`.

`.env.example` has `SECRET_KEY` and `JWT_SECRET`. Do not commit a real `.env`. SQLite is `instance/cosine.db` (gitignored). `flask seed` drops and reloads it.

### Seed credentials

| Role   | Email                         | Password     | Brand                |
|--------|-------------------------------|--------------|----------------------|
| admin  | admin@cosine.create           | Admin123!    | Cosine Create        |
| client | mwotaji@mwotaji.com           | Mwotaji123!  | MWOTAJI              |
| client | groove@thegroovehangout.com   | Groove123!   | The Groove Hangout   |
| buyer  | buyer@cosine.textiles         | Buyer123!    | Cosine Textiles      |

## Auth

- `POST /api/auth/login` with `{ "email", "password" }` returns `{ token, user }`.
- Later requests: `Authorization: Bearer <token>`.
- Passwords are bcrypt-hashed. Roles: `client`, `admin`, or `buyer`.
- Clients are scoped by `client_slug`. They can only list and order their own products.
- Admin can list all products, orders, and enquiries. Admin cannot create catalog orders.

## Endpoints

| Method | Path | Who | Notes |
|--------|------|-----|--------|
| GET | `/api/health` | public | `{ "ok": true }` |
| POST | `/api/auth/login` | public | `{ email, password }` → `{ token, user }` |
| GET | `/api/me` | auth | Current user |
| GET | `/api/products` | auth | Client: own catalog. Admin: all |
| GET | `/api/orders` | auth | Client: own orders. Admin: all, with user |
| POST | `/api/orders` | client | Must use a product they own; other brands → **403** |
| PATCH | `/api/orders/:id/stage` | admin | `produce` (Production) or `distribute` (Dispatch) |
| DELETE | `/api/orders/:id` | admin | Returns a completion PDF, then deletes the row |
| POST | `/api/inquiries` | public | Start a project form |
| GET | `/api/inquiries` | admin | Potential customers |
| DELETE | `/api/inquiries/:id` | admin | Remove an enquiry |

Order stages stored on the client page are **Production** (`produce`) and **Dispatch** (`distribute`). Older keys (`idea`, `sample`, …) are mapped to Production.

`POST /api/inquiries` body:

```json
{
  "name": "Sam Okello",
  "brand": "Field Notes",
  "email": "sam@fieldnotes.test",
  "making": "Apparel",
  "quantity": "80",
  "stage": "sample",
  "notes": "First sample already in hand."
}
```

`making`: `Apparel` | `Accessories` | `Other`.  
`stage`: `idea` | `sample` | `produce` | `buy` | `reorder`.

## Isolation check

A MWOTAJI token posting an order for a Groove Hangout `product_id` must return 403:

```bash
MWOTA=$(curl -s -X POST http://127.0.0.1:5000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"mwotaji@mwotaji.com","password":"Mwotaji123!"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")

GROOVE_PID=$(curl -s http://127.0.0.1:5000/api/products \
  -H "Authorization: Bearer $(curl -s -X POST http://127.0.0.1:5000/api/auth/login \
    -H 'Content-Type: application/json' \
    -d '{"email":"groove@thegroovehangout.com","password":"Groove123!"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['products'][0]['id'])")

curl -s -o /dev/stderr -w "%{http_code}\n" -X POST http://127.0.0.1:5000/api/orders \
  -H "Authorization: Bearer $MWOTA" \
  -H 'Content-Type: application/json' \
  -d "{\"product_id\": $GROOVE_PID, \"name\": \"Amina\", \"brand\": \"MWOTAJI\", \"email\": \"mwotaji@mwotaji.com\", \"quantity\": 50, \"stage\": \"produce\"}"
```
