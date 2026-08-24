# Cosine Create — Landing Page

A React + Vite landing page for a creative studio: black-and-white by
default, with each project on the work grid revealing its own accent
colour on hover.

## Run it

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build -> dist/
```

## Structure

- `src/components/Navbar.jsx` — fixed nav, solidifies on scroll, mobile menu
- `src/components/Hero.jsx` — full-bleed hero. Ships with a generative
  grayscale "reel" animation as a placeholder.
- `src/components/ClientMarquee.jsx` — "Trusted by" infinite logo strip
- `src/components/WorkGrid.jsx` — the work grid; each tile is grayscale
  until hover, when it reveals its own accent colour + name
- `src/components/Footer.jsx` — contact / sitemap

## Swapping in your real reel video

1. Drop your file at `public/videos/hero.mp4` (and an optional poster
   frame at `public/videos/hero-poster.jpg`).
2. In `src/components/Hero.jsx`, flip `const HAS_VIDEO = false` to `true`.

The video plays muted/looped/grayscale over the generative background,
which stays as an ambient layer underneath.

## Editing content

- Client names: `CLIENTS` array in `ClientMarquee.jsx`
- Work items: `PROJECTS` array in `WorkGrid.jsx` — each has a `pattern`
  (rings / stripes / halftone / topo / burst / grid) and an `accent`
  (1–6, mapped to the palette in `index.css`)
- Nav links / socials: `LINKS` array and social hrefs in `Navbar.jsx`

## Fonts

Clash Display (headlines) + Satoshi (body) + General Mono (labels),
loaded from Fontshare in `index.html`. Swap the `<link>` there if you'd
rather self-host them.

## Colour tokens

All colour, type and spacing tokens live in `src/index.css` under `:root`.
# cosine_create
