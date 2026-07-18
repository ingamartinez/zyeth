// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

// Zyeth submissions backend — Astro in SSR mode (Node adapter).
// Runs as a standalone Node process behind Caddy at admin.zyeth.work.
// The public marketing site (repo root) stays a separate static build.
export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  security: {
    // Astro's built-in same-origin check blocks any POST with a
    // form-like Content-Type (multipart/form-data, urlencoded) whose
    // Origin header doesn't match this server's own origin. That's
    // right for cookie-authenticated form posts, but POST /api/leads
    // and POST /api/applications are deliberately public, unauthenticated,
    // cross-origin endpoints (called from the separate zyeth.work
    // marketing site) with no ambient cookie/session authority for CSRF
    // to forge in the first place. Their own origin allowlist
    // (src/lib/cors.ts) + honeypot + rate limiting are the intended
    // defenses here, so Astro's stricter same-origin default would just
    // block legitimate traffic.
    //
    // NOTE for whoever adds authenticated (cookie/session) admin routes
    // in a later issue: re-evaluate this. Either scope the CSRF
    // exemption to just these two public paths (e.g. via middleware) or
    // re-enable checkOrigin and give authenticated routes their own CSRF
    // story.
    checkOrigin: false,
  },
});
