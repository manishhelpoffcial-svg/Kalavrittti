---
name: Tailwind v4 + Replit plugins conflict
description: @replit/vite-plugin-dev-banner injects Tailwind CDN which destroys build-time Tailwind v4 CSS, causing a white screen
---

## The problem
`@replit/vite-plugin-cartographer` includes `@replit/vite-plugin-dev-banner` as a dependency and injects a script that:
1. Listens for `replit-init-tailwind` event
2. Dynamically loads `https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4.x`

The Tailwind browser CDN rewrites **all** page CSS when it loads. This destroys the CSS already compiled by `@tailwindcss/vite` (build-time Tailwind v4), leaving the page completely unstyled/blank.

**Symptom**: pure white screen, no errors in console, all HTTP 200.

**Signature**: HTML page is ~60KB instead of ~4KB. Script 4 is a 54KB inline `<script type="module">`. Script 5 is a sync script containing `loadTailwind` / `tailwindcss/browser`.

## The fix
Remove both Replit-specific plugins from `vite.config.ts` when using Tailwind v4:

```ts
plugins: [
  react(),
  tailwindcss(),   // @tailwindcss/vite — handles CSS at build time
  runtimeErrorOverlay(),
  // NO @replit/vite-plugin-cartographer
  // NO @replit/vite-plugin-dev-banner
],
```

**Why:** These plugins are designed for Tailwind v3 (JIT/CDN mode). Tailwind v4 is build-time only and the CDN injection breaks it.

## Also: fs.strict
Set `server.fs.strict: false` in Vite config so workspace packages in `lib/` (outside the artifact root) can be served. Strict mode with no `allow` entries blocks `@workspace/*` package source files.
