---
name: Seller Panel Architecture
description: How the seller panel is structured — routing, auth, pages, backend endpoints
---

## Frontend

- All seller files live in `artifacts/kalavritti/src/seller/`
- `hooks/useSellerAuth.ts` — JWT auth hook, reads token from localStorage
- `lib/api.ts` — axios instance `sellerApi` with base URL `/api`, attaches Bearer token
- `components/SellerSidebar.tsx`, `SellerLayout.tsx` — shell matching AdminLayout
- `SellerApp.tsx` — wouter Switch with all routes; rendered from App.tsx

## Routing in App.tsx

```tsx
// Same pattern as /admin/*
<Route path="/seller/login"><SellerApp /></Route>
<Route path="/seller/:rest*"><SellerApp /></Route>
<Route path="/seller"><SellerApp /></Route>
```

## Pages

- `/seller/login` — SellerLogin (no layout)
- `/seller/setup` — SellerSetup (no layout, for first-time password + OTP)
- `/seller/dashboard` — SellerDashboard (stats + charts)
- `/seller/products` — SellerProducts (CRUD with search/filter)
- `/seller/orders` — SellerOrders (status filter, Shefaro tracking modal)
- `/seller/profile` — SellerProfile (shop details, bank info, docs)
- `/seller/financials` — SellerFinancials (revenue chart, payout history)
- `/seller/settings` — SellerSettings (policies, notifications, password)
- `/seller/reviews` — SellerReviews (star ratings, seller reply)

## Backend

- `artifacts/api-server/src/routes/seller.ts` — all seller API routes (~819 lines)
- JWT: SELLER_JWT_SECRET env, 7-day expiry, hash stored in seller_sessions
- Commission: DEFAULT_SELLER_COMMISSION env (default 10%)
- Shefaro: SHEFARO_API_KEY env, graceful no-op when missing

## Admin seller management

- `GET /api/admin/seller-profiles` — list approved seller profiles with analytics
- `PATCH /api/admin/seller-profiles/:id` — toggle isActive, set commissionRate
- `POST /api/admin/seller-profiles/:id/payout` — initiate payout record
- AdminSellers.tsx has two tabs: "Applications" (seller_applications) + "Active Sellers" (seller_profiles)

## DB tables

- `seller_applications` — registration applications (pre-approval)
- `seller_profiles` — approved seller accounts (login credentials, shop data)
- `seller_sessions` — JWT session hashes
- `seller_analytics` — daily metrics
- `seller_payouts` — payout records
- `products.seller_id` — FK to seller_profiles (added via DDL)
- `order_items.seller_id` — FK to seller_profiles (added via DDL)

**Why:** Seller panel is completely separate from buyer auth (session-based) and admin auth (separate JWT). Never mix the three auth systems.
