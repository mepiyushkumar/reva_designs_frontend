# SESSION JOURNAL – reva_designs_frontend

Keep short. Move durable facts to the permanent context files.

## 2026-10-23 – Initial context genesis
- Read configs, `App.jsx`, `base44Client.js`, `AuthContext`, utils, layouts, and these pages/components: Checkout, Cart, ProductDetail, ProductCard, Shop, Home, Login, Register, Profile, Reviews, admin Products/Orders/Dashboard/Broadcast; grep-mapped all `base44.entities.*` usage.
- Cross-checked against server models and routes.
- Not read in detail: `Footer`, `MobileBottomNav`, `AnnouncementBar`, `CollectionsGrid`, `About`, `Contact`, `Policies`, `ForgotPassword`, admin `Banners/Categories/Coupons/Subscribers/PaymentSettings/StoreSettings`, `EmailTemplateBuilder`, `index.css` body, `ui/*`.
- Ran lint and typecheck baselines (see `TESTING.md`).

## Open items / follow-ups (not started)
- Add route guards for `/admin/*` (and role check) – needs server auth on `/entities/*` too.
- Make cart/wishlist per-user (needs server fields).
- Add missing `base44.auth.me`, `clearToken`, `loginWithProvider` or remove callers.
- Server list filtering is required for most storefront pages to behave correctly.
- Coupon admin form lacks `expiry_date`; Order schema lacks `payment_method`/`utr_number`.
- Replace CRA `README.md`, `index.html` title; decide on committing `dist/`.
- Add `.env.example`.
