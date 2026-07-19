import type { APIRoute } from 'astro';

import { TEAM_DOMAIN } from '../../lib/cf-access';

// GET /admin/logout (#52, replacing the #30 app-level session logout).
// There is no app-level session to destroy anymore — identity is entirely
// owned by Cloudflare Access — so "logging out" means sending the browser
// to CF Access's own logout endpoint, which clears the `CF_Authorization`
// cookie Cloudflare set after the Access login.
//
// This is a plain GET link now (see AdminNav.astro), not a POST form: with
// the password-login POST gone, this was the last mutating admin route,
// and a GET to an external logout endpoint has no state to protect with a
// CSRF token in the first place (see lib/csrf.ts for why the module is
// still retained, unused, rather than deleted).
export const GET: APIRoute = ({ redirect }) => {
  return redirect(`https://${TEAM_DOMAIN}/cdn-cgi/access/logout`);
};
