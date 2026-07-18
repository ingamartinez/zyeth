import type { APIRoute } from 'astro';

// Liveness probe for the backend service. No auth, no DB — used by the
// deploy smoke-check and Caddy/uptime monitoring to confirm the process boots.
export const GET: APIRoute = () =>
  new Response(
    JSON.stringify({ status: 'ok', service: 'zyeth-backend' }),
    {
      status: 200,
      headers: { 'content-type': 'application/json' },
    },
  );
