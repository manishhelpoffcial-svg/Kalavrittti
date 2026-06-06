---
name: Workflow port setup
description: Port assignments and env vars for running Kalavritti workflows
---

## Port assignments
- **Frontend (kalavritti)**: PORT=8080, maps to externalPort 80 (main preview domain)
- **API Server**: PORT=8081, maps to externalPort 8081

## Workflow commands
```
# Frontend
cd artifacts/kalavritti && PORT=8080 BASE_PATH=/ API_PORT=8081 pnpm run dev

# API Server
cd artifacts/api-server && PORT=8081 pnpm run dev
```

## Vite proxy
`vite.config.ts` proxies `/api` requests to `http://localhost:${API_PORT || 8081}` so the frontend dev server transparently forwards API calls.

**Why:** Frontend uses relative `/api` baseURL in axios. Both must share the same origin in dev, done via Vite proxy. Port 8080→externalPort 80 is the Replit main preview mapping.

## Lib packages must be built first
Run `npx tsc --build` in each lib before TypeScript checking:
- `lib/db`
- `lib/api-zod`
- `lib/api-client-react`

## Express 5 type quirks
- `req.params.id` is typed as `string | string[]` — always cast: `parseInt(String(req.params.id))`
- Same for named params like `req.params.category`, `req.params.name`
- Async route handlers: avoid `return res.json(...)` (returns Response, not void); use `res.json(...); return;` pattern instead
