import crypto from 'node:crypto';
import type { AstroCookies } from 'astro';

// Double-submit CSRF token for admin mutating routes — see
// backend/astro.config.mjs for why this is handled at the app level
// instead of via Astro's built-in `security.checkOrigin`: that check
// stays globally disabled because POST /api/leads and POST
// /api/applications (#28) are deliberately public, unauthenticated,
// cross-origin endpoints called from the separate zyeth.work marketing
// site. Cookie-authenticated admin routes need their own CSRF story
// instead, scoped to just those routes.
//
// CURRENTLY UNUSED (#52): the only two admin routes that ever mutated
// state (POST /admin/login and POST /admin/logout) are both gone —
// identity is now entirely owned by Cloudflare Access JWT verification
// (src/lib/cf-access.ts, src/middleware.ts), and logout is a plain GET
// link to CF Access's own logout URL. This module is retained,
// deliberately not deleted, for the next /admin route that mutates state
// (e.g. an application/lead status change) — a JWT in a header does NOT
// substitute for CSRF protection on a cookie-authenticated mutation,
// since the `CF_Authorization` cookie travels cross-site and Cloudflare
// re-injects a valid JWT header regardless of request origin.
const CSRF_COOKIE = 'csrf_token';

// Returns the existing CSRF token from the cookie, or mints and sets a
// new one. Call this when rendering any admin form (GET) so the hidden
// field and the cookie start in sync.
//
// httpOnly: true — no client JS ever needs to read this cookie. The
// token is embedded into the form server-side, in the .astro frontmatter
// (via Astro.cookies.get()/ensureCsrfToken() at render time), and echoed
// back as a hidden form field. The double-submit security property comes
// from an attacker's cross-site form being unable to READ this cookie's
// value to include it as the matching field — httpOnly only makes that
// stronger (also unreadable to same-origin XSS), it doesn't break the
// pattern.
//
// secure: `import.meta.env.PROD` — fail-secure by construction (true in
// any real Astro build, false only under `astro dev`); it needs no
// manually-provisioned env var, unlike gating on `process.env.NODE_ENV`,
// which silently defaults to insecure if nothing ever sets it.
//
// path: '/admin' — scoped so this token is never sent on public /api/*
// requests.
export function ensureCsrfToken(cookies: AstroCookies): string {
  const existing = cookies.get(CSRF_COOKIE)?.value;
  if (existing) {
    return existing;
  }
  const token = crypto.randomBytes(32).toString('base64url');
  cookies.set(CSRF_COOKIE, token, {
    path: '/admin',
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'lax',
  });
  return token;
}

// Verifies a submitted form field's CSRF token against the cookie. Both
// must be present and byte-equal (constant-time compare to avoid a
// timing side-channel on the comparison itself).
export function verifyCsrfToken(cookies: AstroCookies, submitted: string | undefined | null): boolean {
  const cookieToken = cookies.get(CSRF_COOKIE)?.value;
  if (!cookieToken || !submitted) {
    return false;
  }
  const a = Buffer.from(cookieToken);
  const b = Buffer.from(submitted);
  if (a.length !== b.length) {
    return false;
  }
  return crypto.timingSafeEqual(a, b);
}
