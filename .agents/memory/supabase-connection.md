---
name: Supabase DB Connection
description: How to connect to Supabase from Replit — pooler URL required, DDL workaround
---

**Rule:** Always use the pooler URL (port 6543, transaction mode) stored in `SUPABASE_DATABASE_URL`. The direct IPv6 URL (port 5432) is unreachable from Replit.

**Why:** Replit's network blocks direct IPv6 connections to Supabase. The pooler URL routes through AWS and works.

**DDL (CREATE TABLE) workaround:** `drizzle-kit push` fails without TTY. Run DDL directly via:
```js
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Pool } = require('/home/runner/workspace/node_modules/.pnpm/pg@8.20.0/node_modules/pg/lib/index.js');
const pool = new Pool({ connectionString: process.env.SUPABASE_DATABASE_URL, ssl: { rejectUnauthorized: false } });
await pool.query(sql);
await pool.end();
```

**Supabase project:** rrkdjtolgwlwaygsgghn, region: ap-south-1 (Mumbai)
