# TESTING – reva_designs_frontend

## Current state (VERIFIED)

- **No test framework, test files, mocks or coverage config.** No `test` script in `package.json`.
- Quality tooling: ESLint, and `tsc` configured via `jsconfig.json` with `checkJs: false` (set deliberately to silence shadcn/implicit-any noise), so `npm run typecheck` currently passes without checking JS/JSX types.

## Commands (from `package.json`)

| Purpose | Command |
|---|---|
| Install | `npm install` |
| Dev server (port 3001) | `npm run dev` |
| Build (to `dist/`) | `npm run build` |
| Preview build | `npm run preview` |
| Lint | `npm run lint` (`eslint . --quiet`, errors only) |
| Lint fix | `npm run lint:fix` |
| Type check | `npm run typecheck` (`tsc -p ./jsconfig.json`) |

No formatter (Prettier) is configured.

## Scope of tooling

- ESLint (`eslint.config.js`) only targets `src/components/**`, `src/pages/**`, `src/Layout.jsx`, and ignores `src/lib/**` and `src/components/ui/**`. Rules: `react/*` recommended, `unused-imports/no-unused-imports: error`, `react-hooks/rules-of-hooks: error`, `react/prop-types: off`.
- `jsconfig.json` type-checks `src/components/**/*.js`, `src/pages/**/*.jsx`, `src/Layout.jsx`; excludes `ui`, `api`, `lib`.

## Baseline observed 2026-10-23 (before any change)

- `npm run lint`: exit 1, 5 errors, all `unused-imports/no-unused-imports` (`Layout.jsx` `AnnouncementBar`; `admin/EmailTemplateBuilder.jsx` `ChevronDown`, `ChevronUp`; `admin/Reviews.jsx` `Eye`; `admin/StoreSettings.jsx` `Upload`).
- `npm run typecheck`: was exit 2 with 67 TS errors while `checkJs` was true (shadcn ref-only props, implicit any); now exit 0 with `checkJs: false`.
- `npm run build` not run for this baseline.

Rule: do not add new lint/type errors in files you touch; fixing the baseline is optional and separate.

## Manual validation for UI/API changes

1. Start the server (`../reva_designs_server-main`: `npm run dev`, needs MongoDB and `.env`) and the frontend (`npm run dev`).
2. Exercise the affected page. For admin pages go to `/admin/...` (no login needed currently).
3. Check network calls against server contract (`API_AND_DATA_FLOW.md`).

## If adding tests

No convention exists. Do not add Vitest/Jest/Playwright without asking; if requested, record the choice in `DECISION_LOG.md`.
