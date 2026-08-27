# Cosine Create — frontend

React + Vite site with hash routing. Run it from the [repo README](../README.md): Flask must be on port 5000 so `/api` can proxy.

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # dist/
```

## Layout

- `src/App.jsx` — hash routes
- `src/api.js` — login, orders, enquiries, JWT in `sessionStorage`
- `src/data.js` — public work, process copy, lookbook maps
- `src/components/` — chrome (nav, footer, logo) plus `OrderPanel` on brand pages
- `src/pages/` — public pages, `#/start`, `#/login`, `#/admin`
- `public/` — lockup, lookbook photos, people photos

Tokens live in `src/index.css`. The wordmark is `public/lockup.png`.
