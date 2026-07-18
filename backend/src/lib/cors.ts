import type { APIRoute } from 'astro';

// CORS allowlist for the two public submission endpoints (POST
// /api/leads, POST /api/applications). No other route in this service
// sets CORS headers — everything else is same-origin admin surface.
//
// Credentials (cookies) are intentionally never allowed here: these
// endpoints are unauthenticated by design, and omitting
// Access-Control-Allow-Credentials keeps that explicit rather than
// implicit.
const DEFAULT_ALLOWED_ORIGINS = 'https://zyeth.work,https://staging.zyeth.work';

function getAllowedOrigins(): string[] {
  const raw = process.env.ALLOWED_ORIGINS ?? DEFAULT_ALLOWED_ORIGINS;
  return raw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

// Builds the CORS headers for a given request. The Origin header is only
// echoed back when it is in the allowlist; otherwise no
// Access-Control-Allow-Origin header is set, so the response stays
// unreadable to cross-origin scripts (the request still reaches the
// server — CORS is a browser-side read restriction, not an auth check).
function buildCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('origin');
  if (!origin || !getAllowedOrigins().includes(origin)) {
    return {};
  }
  return {
    'access-control-allow-origin': origin,
    // Tell caches/CDNs the response varies by Origin, since the header
    // value above depends on it.
    vary: 'Origin',
  };
}

export const corsHeaders = buildCorsHeaders;

// Handles a CORS preflight (OPTIONS) request for a POST endpoint.
export const handlePreflight: APIRoute = ({ request }) => {
  const headers: Record<string, string> = {
    ...buildCorsHeaders(request),
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'Content-Type',
    'access-control-max-age': '86400',
  };
  return new Response(null, { status: 204, headers });
};

// JSON response with the standard content-type + CORS headers applied.
// Shared by both submission routes so every error/success path is
// consistent.
export function jsonResponse(body: unknown, status: number, request: Request): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
      ...buildCorsHeaders(request),
    },
  });
}
