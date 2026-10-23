# BUSINESS DOMAIN – reva_designs_frontend

Store: Reva Designs, Indian ethnic wear (sarees, anarkalis, kurtis). Currency ₹ (some pages print `Rs.`). Entity field details live in the server project (`../reva_designs_server-main/.github/context/BUSINESS_DOMAIN.md`) and `entities/*` JSON here. This file lists rules implemented in the UI.

## Terminology

Product, Category (nav filter, matched by `name`), Collection (curated grouping, matched by `name`), Banner (home hero), Bag/Cart (`CartItem`), Wishlist, Order + OrderItem, Coupon, Newsletter subscriber (also WhatsApp broadcast list), Review (moderated), StoreSettings/PaymentSettings (singleton records).

## Rules in the UI (VERIFIED)

| Rule | Where |
|---|---|
| Sale price = `discount_price` if set and `< price`; badges "Sale"/"New" (`is_new_arrival`) | `ProductCard.jsx`, `ProductDetail.jsx` |
| Cart price uses `discount_price \|\| price`; default size `product.sizes[0]` or `'Free Size'` from card quick-add | `ProductCard.jsx`, `ProductDetail.jsx` |
| Adding an existing product+size increments quantity (lookup via `CartItem.filter`; relies on server filtering, which does not exist) | `ProductCard.jsx`, `ProductDetail.jsx` |
| Cart qty < 1 removes the item | `Cart.jsx` |
| Subtotal = Σ price × qty; shipping always "Free"; total = max(0, subtotal − discount) | `Cart.jsx`, `Checkout.jsx` |
| Coupon: code uppercased; must be `is_active`; `min_order` enforced; `percentage` -> `round(subtotal*value/100)`, `flat` -> `value` | `Checkout.jsx` (client only; no expiry/usage-limit check, `used_count` never updated) |
| Order number `RVD-` + last 6 digits of `Date.now()` (collision possible) | `Checkout.jsx` |
| Payment methods shown from `PaymentSettings` flags (`cod_enabled`, `upi_enabled`, `bank_enabled`, master `payments_enabled !== false`); UPI/bank require a UTR/transaction id; if no settings, no payment section is shown but order is still placed | `Checkout.jsx` |
| Order flow: create Order -> create OrderItems -> delete CartItems; status starts `pending`, `payment_status` always `pending` | `Checkout.jsx` |
| Admin order statuses: `pending, confirmed, packed, shipped, delivered, cancelled` (any-to-any via select) | `admin/Orders.jsx` |
| Reviews: public submit creates `is_approved:false`; storefront shows approved only; admin approves/deletes; average rating from approved list | `ProductReviews.jsx`, `admin/Reviews.jsx` |
| Newsletter signup (footer): one Subscribe button; fields shown per `StoreSettings.newsletter_email_enabled` / `newsletter_phone_enabled` (admin Subscribers page); both off hides the section; only filled enabled fields are sent in one record; dedupe by email (case-insensitive) or digits-only phone, client-side | `home/NewsletterSection.jsx`, `admin/Subscribers.jsx` |
| Product images fall back to `DEFAULT_PRODUCT_IMAGE` | `lib/utils.js` |
| Admin dashboard: counts + revenue = Σ `Order.total` (all statuses incl. cancelled) | `admin/Dashboard.jsx` |
| Policy copy: "Free shipping across India", "Easy 7-day returns" (static text) | `ProductDetail.jsx` |

## Status: VERIFIED / INFERRED / UNKNOWN

- INFERRED: orders are confirmed manually via WhatsApp/email ("We'll confirm your order via WhatsApp / Email" text).
- UNKNOWN: payment verification, stock handling, shipping charges, tax, return workflow, admin onboarding. ⚠ NEEDS HUMAN VERIFICATION with the product owner.
