import type { APIRoute } from 'astro';

import { verifyCsrfToken } from '../../lib/csrf';
import { destroySession } from '../../lib/session';

// POST /admin/logout (#30). Guarded by src/middleware.ts like every other
// /admin/* route (only /admin/login is exempt), so reaching this handler
// already implies a valid session. Still requires its own CSRF
// double-submit token, per the same app-level CSRF story as login — see
// lib/csrf.ts.
export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const form = await request.formData();
  const csrfToken = form.get('csrfToken');

  if (!verifyCsrfToken(cookies, typeof csrfToken === 'string' ? csrfToken : undefined)) {
    return new Response('Invalid CSRF token', { status: 403 });
  }

  await destroySession(cookies);
  return redirect('/admin/login');
};
