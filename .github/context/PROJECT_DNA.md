# PROJECT DNA – reva_designs_frontend

**What it is:** Single-page storefront + admin panel for Reva Designs (Indian ethnic wear, prices in ₹), consuming the Express API in `../reva_designs_server-main`.

## Stack (VERIFIED: `package.json`, configs)

| Item | Value |
|---|---|
| Framework | React `^18.2`, ReactDOM client root (`src/main.jsx`), no StrictMode wrapper |
| Language | JavaScript/JSX (`"type":"module"`); one TS file `src/utils/index.ts` (unused helper `createPageUrl`) |
| Build | Vite `^6.1` + `@vitejs/plugin-react` + `@base44/vite-plugin` (HMR/navigation notifiers, visual edit agent, analytics tracker) |
| Routing | `react-router-dom` `^6.26` (`BrowserRouter`) |
| Server state | `@tanstack/react-query` provider mounted, but pages mostly use plain `useEffect`/`useState` |
| UI | shadcn/ui "new-york" style (`components.json`, `src/components/ui/*`), Radix primitives, `lucide-react` icons, `framer-motion`, `sonner` + shadcn toast |
| Styling | Tailwind `^3.4` with HSL CSS variables (`src/index.css`), `tailwindcss-animate`, fonts Cormorant Garamond (heading) + Inter (body) via Google Fonts |
| Forms | Plain controlled inputs. `react-hook-form`/`zod` installed, only used by shadcn `form.jsx` |
| Installed but not imported anywhere in `src/` (grep) | `three`, `react-leaflet`, `@stripe/*`, `react-quill`, `jspdf`, `html2canvas`, `react-markdown`, `moment`, `lodash`, `date-fns`, `canvas-confetti`, `@hello-pangea/dnd`, `react-hot-toast`. `recharts` only via `ui/chart.jsx`, `next-themes` only via `ui/sonner.jsx`. Do not assume these are wired up |
| Lint / types | ESLint 9 flat config; `tsc -p jsconfig.json` (`checkJs: false`, so JS/JSX is not type-checked) |
| Package manager | npm (`package-lock.json`) |

## Layout

```
index.html, vite.config.js, tailwind.config.js, eslint.config.js, jsconfig.json, components.json
entities/<Entity>          JSON-schema files (no extension) mirroring server models
src/main.jsx, App.jsx      entry + routes + providers
src/api/base44Client.js    THE API client (fetch wrapper + entity APIs + auth)
src/lib/                   AuthContext, query-client, trackActivity, useStoreSettings, utils (cn, image helpers), app-params, PageNotFound
src/components/            Layout parts, ProductCard, ProductReviews, ProtectedRoute (unused), admin/, home/, ui/ (shadcn)
src/pages/                 storefront pages; pages/admin/ admin pages
dist/                      committed build output (not gitignored; `.gitignore` ignores /build only)
public/                    favicon, manifest, robots (CRA-style leftovers)
```

## Runtime config (names only; never copy values)

`.env` keys: `VITE_SERVER_API_URL` (used by `base44Client.js`), `VITE_BASE44_APP_ID`, `VITE_BASE44_FUNCTIONS_VERSION`, `VITE_BASE44_APP_BASE_URL` (used by `lib/app-params.js`, which no source file imports), `VITE_API_URL` (no usage found).

Dev server port `3001` (`vite.config.js`); a `/api` proxy to `localhost:3000` is configured but the app calls the server directly (no `/api` paths) so it is unused.

## Other facts

- `README.md` is the unmodified Create React App template and does not describe this project.
- `index.html` title is `Base44 APP`.
- No Git history in this checkout; no Docker/CI/deploy config.
- Currency/locale: ₹ and `toLocaleString()`; some pages use `Rs.`.
- External assets: navbar logo is hosted on `media.base44.com`; WhatsApp link component reads store settings.
