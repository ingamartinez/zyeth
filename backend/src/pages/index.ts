import type { APIRoute } from 'astro';

// GET / (#49). There is no root page for the admin SSR app — the dashboard
// lives at /admin, guarded by src/middleware.ts (which 403s on a
// missing/invalid Cloudflare Access JWT, per #52 — there is no app-level
// login page to redirect to anymore). Without this route, the bare
// admin.zyeth.work subdomain returns a raw 404 instead of landing
// somewhere useful. Redirecting to /admin lets the existing middleware
// chain handle auth from there.
export const GET: APIRoute = async ({ redirect }) => {
  return redirect('/admin');
};
