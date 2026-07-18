// Per-IP fixed-window rate limiter for the public submission endpoints.
//
// SINGLE-PROCESS ASSUMPTION: the backend runs as one Node process per
// environment (no clustering/PM2 fork mode), so an in-memory Map is
// sufficient — no external store (Redis, etc.) is needed. If this service
// is ever scaled to multiple processes or instances, the limiter state
// MUST move to a shared store, or each instance will independently allow
// up to the limit (effectively multiplying it by the instance count).
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS_PER_WINDOW = 10;
const SWEEP_INTERVAL_MS = 60 * 1000;

interface Window {
  count: number;
  resetAt: number;
}

// Fixed-window limiter factory. Each call gets its own Map + sweep clock,
// so different call sites (public submissions, admin login) keep
// independent budgets instead of sharing/inflating one another's limit.
function createLimiter(windowMs: number, maxPerWindow: number) {
  const hits = new Map<string, Window>();
  let lastSweepAt = 0;

  // Drops expired windows so the Map doesn't grow unbounded over the
  // process lifetime. Runs opportunistically (at most once per
  // SWEEP_INTERVAL_MS) rather than on a timer, to avoid keeping the event
  // loop alive with an extra interval.
  function sweep(now: number): void {
    for (const [key, window] of hits) {
      if (window.resetAt <= now) {
        hits.delete(key);
      }
    }
  }

  return function check(key: string): boolean {
    const now = Date.now();
    if (now - lastSweepAt > SWEEP_INTERVAL_MS) {
      sweep(now);
      lastSweepAt = now;
    }

    const window = hits.get(key);
    if (!window || window.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }

    window.count += 1;
    return window.count <= maxPerWindow;
  };
}

// Module-level singleton — shared across BOTH /api/leads and
// /api/applications, since the limit is meant to apply per IP across
// these endpoints combined, not per endpoint.
//
// Returns true if the request identified by `key` (normally the client
// IP) is within the allowed rate, false if it has exceeded
// MAX_REQUESTS_PER_WINDOW submissions in the current window.
export const checkRateLimit = createLimiter(WINDOW_MS, MAX_REQUESTS_PER_WINDOW);

// Stricter, separate-budget limiter for POST /admin/login (#30) — brute
// forcing the single admin password should be expensive. 5 attempts per
// 15 minutes per IP; tune if this proves too tight/loose in practice.
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS_PER_WINDOW = 5;
export const checkLoginRateLimit = createLimiter(LOGIN_WINDOW_MS, MAX_LOGIN_ATTEMPTS_PER_WINDOW);

// Extracts the client IP for rate-limit keying, honoring X-Forwarded-For.
//
// TRUSTED PROXY ASSUMPTION: this service is only ever reached through the
// Caddy reverse proxy running on the same host/network, which sets
// X-Forwarded-For to the real client IP and is not itself reachable
// directly from the public internet. If that topology changes (e.g. a
// second public-facing proxy is added, or the app becomes directly
// internet-facing), this MUST be revisited — otherwise a client could
// spoof X-Forwarded-For to bypass the rate limit entirely.
export function getClientIp(request: Request, clientAddress: string): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const first = forwardedFor.split(',')[0]?.trim();
    if (first) {
      return first;
    }
  }
  return clientAddress;
}
