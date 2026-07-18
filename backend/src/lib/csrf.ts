import crypto from 'node:crypto';
import type { AstroCookies } from 'astro';

// Double-submit CSRF token for admin mutating routes (login POST, logout
// POST, and any future /admin mutations) — see backend/astro.config.mjs
// for why this is handled at the app level instead of via Astro's
// built-in `security.checkOrigin`: that check stays globally disabled
// because POST /api/leads and POST /api/applications (#28) are
// deliberately public, unauthenticated, cross-origin endpoints called
// from the separate zyeth.work marketing site. Cookie-authenticated admin
// routes need their own CSRF story instead, scoped to just those routes.
const CSRF_COOKIE = 'csrf_token';

function isProd(): boolean {
  return process.env.NODE_ENV === 'production';
}

// Returns the existing CSRF token from the cookie, or mints and sets a
// new one. Call this when rendering any admin form (GET) so the hidden
// field and the cookie start in sync. Not httpOnly — the whole point of
// the double-submit pattern is that the form can read and echo it back;
// the security property comes from an attacker's cross-site form being
// unable to read this cookie's value to include it, not from hiding it
// from same-origin JS/markup.
export function ensureCsrfToken(cookies: AstroCookies): string {
  const existing = cookies.get(CSRF_COOKIE)?.value;
  if (existing) {
    return existing;
  }
  const token = crypto.randomBytes(32).toString('base64url');
  cookies.set(CSRF_COOKIE, token, {
    path: '/',
    httpOnly: false,
    secure: isProd(),
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
