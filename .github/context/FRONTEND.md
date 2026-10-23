# FRONTEND – reva_designs_frontend

## Entry and routing (VERIFIED: `src/main.jsx`, `src/App.jsx`)

`main.jsx` renders `<App/>`. `App` nests `AuthProvider` > `QueryClientProvider` > `BrowserRouter` > `AuthenticatedApp`, plus `Toaster` (shadcn) and `SonnerToaster` (bottom-center). `AuthenticatedApp` shows a spinner while `isLoadingAuth`, handles `authError.type` (`user_not_registered`, `auth_required`), then renders routes:

| Group | Paths | Element |
|---|---|---|
| Auth (no layout) | `/login`, `/register`, `/forgot-password`, `/reset-password?token=` | `Login`, `Register`, `ForgotPassword`, `ResetPassword` (use `AuthLayout`) |
| Storefront (`Layout`) | `/`, `/shop` (`?category=&collection=&filter=new\|best`), `/product/:productId`, `/cart`, `/wishlist`, `/collections`, `/about`, `/contact`, `/policies`, `/profile`, `/checkout` | pages in `src/pages/` |
| Admin (`AdminLayout`) | `/admin`, `products`, `orders`, `banners`, `categories`, `coupons`, `subscribers`, `broadcast`, `payment-settings`, `reviews`, `store-settings` | pages in `src/pages/admin/` |
| Fallback | `*` | `lib/PageNotFound` |

`Layout` = `Navbar` + `<main class="pt-36 lg:pt-44">` + `Footer`, `MobileBottomNav`, `WhatsAppButton` (hardcoded `wa.me/919999999999` link ⚠ NEEDS HUMAN VERIFICATION whether placeholder). `AnnouncementBar` exists but is not rendered (imported unused in `Layout.jsx`).

## Directory responsibilities

- `src/api/base44Client.js` – only data access. `base44.entities.<Entity>.{list,get,filter,create,update,delete}`, `base44.auth.*`, `base44.integrations.Core.{UploadFile,SendEmail}`.
- `src/lib/AuthContext.jsx` – `useAuth()` -> `{user,isAuthenticated,isLoadingAuth,authError,authChecked,logout,navigateToLogin,checkUserAuth,checkAppState}`.
- `src/lib/utils.js` – `cn()`, `DEFAULT_PRODUCT_IMAGE` (SVG data URI), `normalizeProductImages`, `hasProductImages`, `getProductThumbnail`, `isIframe`.
- `src/lib/useStoreSettings.js` – module-cached hook for the single StoreSettings record; **currently not imported anywhere** (`Footer`, `About`, `Contact`, admin `StoreSettings` call `StoreSettings.list('-created_date', 1)` directly).
- `src/lib/trackActivity.js` – posts `UserActivity` events (e.g. `product_view`) with `sessionStorage['reva_sid']` id.
- `src/components/` – `ProductCard` (wishlist/cart quick-add), `ProductReviews`, `Navbar`, `Footer`, `AdminSidebar`; `home/` sections (`HeroSection`, `CollectionsGrid`, `ProductsRow`, `NewsletterSection`); `admin/EmailTemplateBuilder`; `ui/` shadcn primitives (generated; do not hand-edit unless needed; add via shadcn CLI conventions in `components.json`).
- `entities/*` – JSON schema files mirroring server models.

## State management

Local component state only. Pattern in nearly every page:

```jsx
const [items, setItems] = useState([]); const [loading, setLoading] = useState(true);
const load = () => base44.entities.X.list('-created_date', 50).then(i => { setItems(i); setLoading(false); }).catch(() => setLoading(false));
useEffect(() => { load(); }, []);
// mutate -> await base44.entities.X.update(...); toast.success('...'); load();
```

Errors are mostly swallowed (`.catch(() => {})`) or shown via `toast.error`. Skeleton loaders use `animate-pulse`. React Query is mounted (`lib/query-client.js`: `refetchOnWindowFocus:false, retry:1`) but only `PageNotFound` uses `useQuery`.

## Auth and authorization

- Token key `reva_designs_token` in `localStorage`; sent as `Authorization: Bearer` by `request()` for every call when present.
- Login/Register do `window.location.href = '/'` after success (full reload), then `AuthContext` loads `GET /auth/me`.
- `user.role` is only displayed (`Profile.jsx`, `PageNotFound.jsx`). **No UI route guard or role check protects `/admin/*`**; `ProtectedRoute.jsx` is unused.
- Navbar user icon links to `/profile` or `/login`; the dropdown with Logout is never opened (`userMenuOpen` is never set true). Profile page has a logout.

## Forms and validation

Plain controlled inputs with native `required`; `toast.error` for custom checks (Checkout UTR, Review rating). Auth pages use shadcn `Button/Input/Label` inside `AuthLayout`. Admin pages use inline Tailwind inputs in a shadcn `Dialog`; numbers cast with `Number()` before save.

## Styling conventions (VERIFIED across pages)

- Storefront: Tailwind semantic tokens (`bg-background`, `bg-secondary`, `text-muted-foreground`, `bg-primary text-primary-foreground`), `font-heading` (Cormorant) for titles, `font-body` (Inter) for UI, uppercase widely tracked labels (`text-xs tracking-[0.2em] uppercase font-body`), square corners, `pt-28 sm:pt-32 pb-20` page wrappers, `max-w-7xl mx-auto px-4 sm:px-6` containers. Primary is burgundy (`--primary: 350 64% 29%`), accent gold.
- Admin: dark slate palette (`bg-slate-900/950`, `border-slate-800`, `text-white`, amber-400/500 accents), tables with `p-4` cells.
- Class merging via `cn()` in shadcn components. Toasts via `sonner`.
- Icons: `lucide-react`. Animations: `framer-motion` (`motion.div`, `whileInView`).

## Naming conventions

Components/pages `PascalCase.jsx`; default exports; admin pages imported as `Admin<Name>`; hooks `useX` (`use-mobile.jsx` is kebab-case from shadcn); utilities `camelCase.js`. Imports: `@/` alias for lib/api/ui, relative paths used for neighbours (both exist).

## Known gaps (VERIFIED — raise, don't silently change)

1. No auth/role guard on `/admin/*`, checkout, profile.
2. **Cart, wishlist, addresses are not per-user.** `CartItem`/`WishlistItem` have no user field; `Cart.jsx`, `Checkout.jsx`, `Navbar` list all records. Server returns whichever records exist (all shoppers share one cart).
3. SDK methods called but not defined in `base44Client.js`: `base44.auth.me()` (`trackActivity.js`, `PageNotFound.jsx` – failures are caught, so `user_email` is always `''` and admin note never shows), `base44.auth.clearToken()` (`AuthContext.jsx` on 401/403), `base44.auth.loginWithProvider()` (Google buttons in `Login`/`Register` throw on click). `base44.auth.logout('/')` ignores its argument.
4. `integrations.Core.SendEmail` throws "not configured"; `Broadcast.jsx` email sending therefore fails. `UploadFile` converts to a base64 data URL stored in documents.
5. Filtering relies on server list filters which the server ignores (see `API_AND_DATA_FLOW.md`).
6. `Checkout.jsx` sends `payment_method`/`utr_number` which the server schema drops; `payment_status` is always `'pending'`.
7. Admin Coupon form omits `expiry_date` (required by server) ⚠ NEEDS HUMAN VERIFICATION (not executed). Home page links `?category=Sarees` and `Ready To Wear` are hardcoded and only work if matching Category names exist (and filtering works).
8. `lib/app-params.js` is not imported anywhere; `index.html` title and `README.md` are template leftovers.

## How to add a frontend feature

**New storefront page:** create `src/pages/<Name>.jsx` (default export, wrapper `pt-28 sm:pt-32 pb-20`, `max-w-7xl mx-auto px-4 sm:px-6`), load data with the `useEffect` + `base44.entities.*` pattern with a skeleton, import it and add a `<Route>` inside the `<Route element={<Layout/>}>` block in `src/App.jsx`; add a link in `Navbar.jsx`/`Footer.jsx`/`MobileBottomNav.jsx` if needed.

**New admin page:** create `src/pages/admin/<Name>.jsx` in the dark slate style (copy `Categories.jsx` for a simple CRUD table + `Dialog`), add a `<Route path="<slug>">` under `/admin` in `App.jsx`, add an entry to `links` in `AdminSidebar.jsx`.

**New entity/field:** server model + route first (see server `BACKEND.md`), then `entities/<Entity>` JSON, `createEntityApi('<Entity>')` entry in `base44Client.js`, then UI.

**New UI primitive:** prefer an existing `src/components/ui/*` component; otherwise add via shadcn style (`components.json`: new-york, JS, lucide, `@/components/ui`).
