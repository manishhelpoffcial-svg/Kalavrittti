---
name: Seller Registration System
description: Key decisions and pending items for the Kalavritti seller onboarding system
---

**Architecture:**
- Frontend wizard: `artifacts/kalavritti/src/pages/seller-registration.tsx` (6 steps + success screen)
- API routes: `artifacts/api-server/src/routes/seller.ts`
- DB schema: `lib/db/src/schema/seller-applications.ts` + tables created in Supabase

**OTP — STUBBED (dev mode):**
- Any 6-digit code is accepted. API returns `devOtp` in dev mode.
- MSG91 integration ready when `MSG91_AUTH_KEY` env var is set.
- Zoho Mail integration ready when `ZOHO_MAIL_USER` env var is set.

**Document upload:** Cloudinary via `/api/seller/upload-doc` (no auth required — public endpoint for registration flow). Folder: `kalavritti/seller-docs`.

**WhatsApp Video KYC number:** +919476211198

**Seller Portal external URL:** https://seller.kalavritti.in (placeholder, opens in new tab from footer)

**Pending when credentials arrive:**
1. Set `MSG91_AUTH_KEY` → real mobile OTP via MSG91
2. Set `ZOHO_MAIL_USER` + password → real email OTP + confirmation emails
