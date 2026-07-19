import { defineMiddleware } from 'astro:middleware';

import { verifyAccessJwt } from './lib/cf-access';

// Route guard for the admin dashboard (#52, replacing the #30 app-level
// password login). Every path under /admin/* now trusts Cloudflare Access
// as the SOLE identity gate: Cloudflare injects a signed
// `Cf-Access-Jwt-Assertion` header once a request has passed the Access
// login, and this middleware verifies that JWT cryptographically before
// letting the request through.
//
// This closes the direct-to-origin bypass: Caddy (backend/deploy/caddy/
// admin.zyeth.work.caddy) does a bare reverse_proxy with no check that the
// request actually transited Cloudflare, so a request straight to the
// droplet's public IP with `Host: admin.zyeth.work` reaches this
// middleware with no valid Access JWT — and must be rejected here.
//
// This deliberately does NOT touch /api/* — those are the public,
// unauthenticated submission endpoints (#28); see
// backend/astro.config.mjs for why they keep security.checkOrigin: false.
export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  if (!pathname.startsWith('/admin')) {
    return next();
  }

  // DEV bypass: gated on `import.meta.env.DEV`, a Vite compile-time
  // constant — NOT a process.env flag. Vite statically replaces this with
  // `false` in a production build and dead-code-eliminates the branch, so
  // it is provably impossible for this bypass to be reachable in a
  // deployed build, regardless of what env vars are set on the host.
  // There is no Cloudflare Access in front of `localhost`, so without this
  // `npm run dev` could never reach /admin at all.
  if (import.meta.env.DEV) {
    context.locals.user = { email: 'dev@localhost' };
    return next();
  }

  const token = context.request.headers.get('Cf-Access-Jwt-Assertion');
  if (!token) {
    // 403, not a redirect: a redirect to a login page both leaks that one
    // exists and fails to close the direct-to-origin bypass (a redirect
    // response is not a rejection). There is no app-level login to
    // redirect to anymore — Cloudflare Access owns that UX entirely.
    return new Response('Forbidden', { status: 403 });
  }

  try {
    const identity = await verifyAccessJwt(token);
    context.locals.user = identity;
  } catch {
    // Any verification failure (bad signature, wrong iss/aud, expired,
    // unconfigured AUD) is indistinguishable from "not authenticated" —
    // never fall through to next() on a caught error here.
    return new Response('Forbidden', { status: 403 });
  }

  return next();
});
