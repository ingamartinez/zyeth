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
    // #30 added authenticated admin routes under /admin/*; #52 replaced
    // the app-level password login with Cloudflare Access JWT
    // verification (src/lib/cf-access.ts, src/middleware.ts) as the sole
    // identity gate. Rather than re-enable this globally (which would
    // break the public endpoints above), any future /admin mutation gets
    // its OWN app-level CSRF story: a double-submit token
    // (src/lib/csrf.ts), currently unused because there are no mutating
    // /admin routes left (see csrf.ts for why the module stays regardless).
    // This stays `false` globally on purpose — do not flip it without
    // re-auditing the public submission endpoints.
    checkOrigin: false,
  },
});
