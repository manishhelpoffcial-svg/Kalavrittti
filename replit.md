# Kalavritti — Celebrating Handmade

A traditional Indian handmade products e-commerce store celebrating artisans from Bengal and Assam. Single admin-operated with no seller panel.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, served at `/api`)
- `pnpm --filter @workspace/kalavritti run dev` — run the frontend (port 26070, served at `/`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required env: `SESSION_SECRET` — Express session secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + shadcn/ui, wouter routing
- API: Express 5 with express-session (cart/wishlist)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/kalavritti/` — React frontend (all pages)
- `artifacts/kalavritti/src/pages/` — page components
- `artifacts/kalavritti/src/components/` — shared components (Header, Footer, ProductCard, etc.)
- `artifacts/api-server/src/routes/` — API route handlers
- `lib/db/src/schema/` — Drizzle DB schema (categories, artisans, products, reviews, blog, testimonials, contacts)
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for API)
- `lib/api-client-react/` — generated React Query hooks (do not edit manually)
- `attached_assets/` — product images (served at `/api/assets/<filename>`)

## Architecture decisions

- Session-based cart and wishlist (no auth required to shop)
- Product images served via `express.static` on the API server at `/api/assets/`
- `@assets/` alias in Vite config points to `attached_assets/` for compile-time imports (e.g. logo)
- Prices stored as `numeric` in DB — parsed with `parseFloat()` in all routes
- `inArray()` used for artisan enrichment queries (not `sql\`ANY()\`` which requires proper array param)

## Product

- Homepage with hero, category grid, featured/bestseller products, artisan spotlight, testimonials, newsletter
- Product detail pages with full info, artisan story, related products, add to cart/wishlist
- Category browsing and filtering
- Artisan directory with filter by craft and region
- Blog ("The Artisan Journal") with full articles
- Cart page (session-based)
- Contact and FAQ pages
- Login/Register pages (UI only, no backend auth yet)

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Never run `pnpm dev` at workspace root — use workflow restart or `pnpm --filter` commands
- After schema changes: run `pnpm --filter @workspace/db run push` then restart API server workflow
- After OpenAPI spec changes: run `pnpm --filter @workspace/api-spec run codegen` before typechecking
- Product images live in `attached_assets/` and are served at `/api/assets/<filename>`
- The API server's `cwd()` during runtime is `artifacts/api-server/`, so attached_assets path uses `../../attached_assets`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
