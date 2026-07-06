---
name: Supabase DDL Migration
description: How to run ALTER TABLE / DDL against the Supabase database when drizzle-kit push hangs
---

drizzle-kit push spins forever because it needs TTY interaction for schema confirmations.

**The working pattern** — run a node ESM script directly from `lib/db`:

```bash
cd lib/db && node --input-type=module << 'EOF'
import pg from "/home/runner/workspace/node_modules/.pnpm/pg@8.20.0/node_modules/pg/lib/index.js";
const { Pool } = pg;
const dbUrl = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;
const pool = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
await pool.query("ALTER TABLE your_table ADD COLUMN IF NOT EXISTS your_col TYPE");
await pool.end();
EOF
```

**Why:** The executeSql code_execution tool connects to Replit's local dev Postgres, not Supabase. The API server uses SUPABASE_DATABASE_URL. Always use the node script above for Supabase DDL.

**How to apply:** Whenever you need to ADD COLUMN, CREATE TABLE, or do any DDL after updating the Drizzle schema files.
