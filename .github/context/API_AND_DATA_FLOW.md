# API AND DATA FLOW – reva_designs_frontend

## The client (VERIFIED: `src/api/base44Client.js`)

- `API_BASE_URL = import.meta.env.VITE_SERVER_API_URL || 'http://localhost:8080'`.
- `request(path, {method, body, requiresAuth=true, headers})`: JSON body, adds `Authorization: Bearer <localStorage['reva_designs_token']>` when a token exists, parses text as JSON, unwraps `{success:true, data}` -> `data` (arrays pass through), maps `_id` -> `id` recursively, filters falsy `images` entries; on non-2xx throws `Error(data.message || statusText)` with `.status`. No timeouts, no retry, no abort.
- `createEntityApi(name)` -> `list(sort='-created_date', limit=50)`, `get(id)`, `filter(filters, sort, limit)`, `create(data)`, `update(id,data)`, `delete(id)`. `filter` builds `GET /entities/<name>?<k>=<v>&sort=&limit=`.
- Registered entities: Product, Category, CartItem, WishlistItem, Collection, Coupon, Review, Order, OrderItem, Address, StoreSettings, PaymentSettings, Banner, Newsletter, UserActivity. (`User` is not registered.)
- `base44.auth`: `loginViaEmailPassword` (stores token), `register`, `verifyOtp`/`resendOtp` (server endpoints do not exist), `resetPasswordRequest`, `resetPassword`, `updateMe`, `getMe`, `logout` (clears token only), `setToken`, `getToken`. Missing but called: `me`, `clearToken`, `loginWithProvider`.
- `base44.integrations.Core.UploadFile({file})` -> base64 data URL `{file_url}` (no server upload); `SendEmail` always throws.

## Server contract summary (see server `API_AND_DATA_FLOW.md`)

List -> bare array; get/create/update/delete -> `{success, message?, data}`; auth -> `{success, token, user}`. **Server ignores list filters** (only `page`, `limit`, `sort`; default `limit` 10 when omitted).

## End-to-end flows

```
Page component -> base44.entities.X.method -> request() -> fetch(API_BASE_URL/entities/X...) -> Express route -> genericController -> Mongoose -> MongoDB
```

| Flow | Frontend path | Calls | Notes |
|---|---|---|---|
| Boot auth | `AuthProvider.checkAppState` | if token: `GET /auth/me` | 401/403 -> `base44.auth.clearToken()` is undefined, so a TypeError propagates to `checkAppState`'s catch (sets `authError.type='unknown'`) and the stale token stays in `localStorage` (by code reading; not executed) |
| Login | `Login.jsx` | `POST /auth/login` | token stored; hard redirect `/` |
| Register | `Register.jsx` | `POST /auth/register {email,password}` | token stored; hard redirect `/` |
| Forgot/reset | `ForgotPassword.jsx`, `ResetPassword.jsx` | `POST /auth/forgot-password`, `POST /auth/reset-password {resetToken,newPassword}` | reset token read from `?token=`; server returns token in response, no email is sent |
| Change password | `Profile.jsx` | `POST /auth/login` (verify current) then `PUT /auth/me {password}` | |
| Home | `HeroSection`, `CollectionsGrid`, `ProductsRow`, `Navbar` | `Banner/Collection/Product/Category.filter({is_active:true,...})` | filters not applied server-side |
| Shop | `Shop.jsx` | `Product.filter({is_active, category?, collection?, is_new_arrival?, is_best_selling?}, sort, 50)`; `Category.filter({is_active:true})` | sort values: `-created_date`, `price`, `-price` (honored by server) |
| Product detail | `ProductDetail.jsx` | `Product.get(id)`, related `Product.filter({category,is_active},..,4)`, `Review.filter({product_id,is_approved:true})`, `trackActivity('product_view')` | |
| Add to bag / wishlist | `ProductCard`, `ProductDetail`, `Wishlist` | `CartItem.filter({product_id,size})` then `update`/`create`; `WishlistItem.filter/create/delete` | duplicates check relies on server filter |
| Checkout | `Checkout.jsx` | `CartItem.list`, `PaymentSettings.list(..,1)`, `Coupon.filter({code,is_active})`, `Order.create`, `OrderItem.create` xN, `CartItem.delete` xN | sequential, non-transactional; on any error toast "Failed to place order" |
| Newsletter | `NewsletterSection.jsx` | `Newsletter.list(..,500)` dedupe, `Newsletter.create` | |
| Reviews | `ProductReviews.jsx`, `admin/Reviews.jsx` | `Review.filter/create/update/delete` | |
| Admin CRUD | `admin/{Products,Orders,Banners,Categories,Coupons,Subscribers,PaymentSettings,StoreSettings}.jsx` | respective entity `list/create/update/delete` | singleton pages use `list(..,1)` then update-or-create |
| Analytics | `lib/trackActivity.js` | `UserActivity.create` (errors swallowed) | `user_email` always `''` (calls missing `auth.me`) |

## Changing the contract

1. Update the server model/route first (server repo), then `entities/<Entity>` JSON here, then callers (`grep -rn "entities.<Entity>" src`).
2. Keep snake_case, numeric casting (`Number(...)`) before save, and `id` (not `_id`) in UI code.
3. If you need real filtering/auth, that is a server change (`controllers/genericController.js`, `middleware/auth.js`); coordinate and update both context sets.
