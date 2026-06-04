---
name: Supabase Admin Client in Node.js 20
description: How to create a Supabase client on the API server without WebSocket errors
---

**Rule:** Always pass `realtime: { transport: ws }` when creating a Supabase client in the API server.

**Why:** Node.js 20 lacks native WebSocket support. `@supabase/realtime-js` throws on startup without a ws transport.

**How to apply:**
```ts
import ws from "ws";
import { createClient } from "@supabase/supabase-js";

const client = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
  realtime: { transport: ws },
});
```

This pattern is already used in `artifacts/api-server/src/middlewares/supabase-auth.ts` — follow it for any new Supabase client in the API server.
