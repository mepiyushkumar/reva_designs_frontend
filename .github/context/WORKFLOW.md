# WORKFLOW – how Copilot works in reva_designs_frontend

## Before implementing

1. Search for an existing page/component/helper (`grep` entity names, class patterns, `base44.entities.<Entity>`).
2. Copy the closest existing page's structure (storefront page: `Shop.jsx`/`Cart.jsx`; admin CRUD: `admin/Categories.jsx`/`admin/Banners.jsx`).
3. Reuse `src/components/ui/*`, `cn`, image helpers in `src/lib/utils.js`, `sonner` toasts.
4. Make the smallest change; check server contract (`API_AND_DATA_FLOW.md`) if data shape changes.
5. Run `npm run lint` (baseline has 5 unused-import errors) and `npm run typecheck` (passes; JS is not type-checked, see `TESTING.md`), and `npm run build` for larger changes. Verify the page in the browser when UI changes.
6. Update affected `.github/context/` docs.

## Conventions (VERIFIED)

- Function components with default export; hooks at top; `useState` + `useEffect` data loading; `loading` skeletons via `animate-pulse`.
- 2-space indent; semicolons mostly present, quoting mixed (single quotes in pages/components, double quotes in auth pages and shadcn files) – follow the file you edit.
- `@/` alias for `lib`, `api`, `components/ui`; relative imports for neighbouring components.
- Entity calls always via `base44.entities.<Entity>`; sort strings like `'-created_date'`, `'display_order'`.
- User feedback with `toast.success/error/info` from `sonner`; destructive admin actions use `confirm()` (Products) or immediate delete (others).
- Admin lists load with `limit` 200–999; storefront with 50.
- Numbers cast with `Number()` before save; booleans toggled with `is_*` names matching server.
- Money format: `₹{n?.toLocaleString()}` (some pages `Rs.`); keep the style of the page you edit.

## Commands

`npm install`, `npm run dev`, `npm run build`, `npm run lint`, `npm run lint:fix`, `npm run typecheck`, `npm run preview`. No test/format commands.

## Anti-patterns / avoid

- Don't call `fetch` outside `src/api/base44Client.js`.
- Don't add libraries, state managers (Redux/Zustand), TypeScript migration, or switch pages to React Query unprompted.
- Don't hand-edit `src/components/ui/*` for app-specific behavior; compose around them.
- Don't use `_id`; use `id` (client normalizes).
- Don't rely on server-side filtering or per-user data (not implemented); see `FRONTEND.md` Known gaps.
- Don't copy values from `.env`; don't hardcode API URLs (use `VITE_SERVER_API_URL`).
- Don't edit `dist/` (build output); `public/` and `README.md` are CRA/Base44 leftovers.
- Don't call SDK methods that don't exist on `base44` (`auth.me`, `auth.clearToken`, `auth.loginWithProvider`); add them to `base44Client.js` if needed and tell the user.
- Git: no `.git` here; avoid destructive file operations; never delete `node_modules`/`dist` without being asked.
