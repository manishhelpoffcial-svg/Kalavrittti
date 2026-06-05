---
name: Admin panel architecture
description: Key decisions for the Kalavritti super admin panel — auth flow, sidebar state, routing, DB tables, API layout
---

## Auth token
- Token stored as `kv_admin_token` in localStorage (remember me, 48h) or sessionStorage.
- `artifacts/kalavritti/src/admin/lib/api.ts` initializes axios `Authorization` header **synchronously** at module load time from storage — prevents 401 on page refresh.
- `useAdminAuth` also calls `setAdminAuthToken` in a useEffect for updates.

## Sidebar
- `AdminSidebar.tsx`: desktop collapsible (ChevronLeft/Right), persisted as `kv_admin_sidebar_collapsed` in localStorage.
- Mobile: hamburger overlay, triggered from `AdminLayout.tsx` topbar (shown only on `< lg`).
- Wouter `Link` is used directly (no inner `<a>` tag) to avoid nested anchor HTML error.

## Routing
- All admin routes in `AdminApp.tsx` use `/admin/<slug>` paths via wouter.
- Each route wraps children in `<AdminLayout>` via a local `Wrap` component.

## New DB tables (created 2026-06-05)
All tables created via direct pg pool (drizzle-kit push needs TTY).
Reference SQL: `supabase-migrations.sql` in project root.
Tables: `site_settings`, `policies`, `orders`, `order_items`, `customers`, `promotions`, `admin_users`.
Drizzle schema files added: `lib/db/src/schema/site-settings.ts`, `policies.ts`, `orders.ts`, `customers.ts`, `promotions.ts`, `admin-users.ts`.

## API routes
- `artifacts/api-server/src/routes/admin.ts` — original: login, stats, sellers, products (GET/POST/PATCH/DELETE), categories, artisans, blog, contacts, reviews.
- `artifacts/api-server/src/routes/admin-extended.ts` — new: customers, orders, financials, promotions, site_settings (by category), policies, admin_users, seller detail GET.
- Both mounted in `app.ts` under `/api`.

## Settings pattern
`site_settings` table stores key-value pairs by `category` (e.g. "website", "seo", "payment", "email", "notifications").
GET `/admin/settings/:category` → returns `{key: value}` map.
PUT `/admin/settings/:category` → upserts all keys.

## Product upload
POST `/api/upload/image?folder=kalavritti/products` (requires auth, field name `image`).
`AdminProducts.tsx` calls this with `multipart/form-data` and stores returned Cloudinary URLs in `uploadedImages[]` state.

## bcryptjs
Installed in `@workspace/api-server` for admin user password hashing.
