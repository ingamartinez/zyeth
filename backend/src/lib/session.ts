import crypto from 'node:crypto';
import type { AstroCookies } from 'astro';
import { eq, sql } from 'drizzle-orm';

import { db, sessions, users, type User } from '../db';

// Server-side sessions for the admin dashboard (#30). The session token
// IS the `sessions.id` primary key (see schema.ts) — there is no separate
// lookup key, so a leaked cookie value is equivalent to a leaked DB
// primary key, which is why it's a 256-bit random value, not a UUID.
const SESSION_COOKIE = 'session';

// 7 days — a sane default for a single-admin dashboard with no
// "remember me" concept yet. Revisit if that's ever added (e.g. shorter
// TTL + explicit long-lived opt-in) or if #30's DoD is extended.
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function isProd(): boolean {
  return process.env.NODE_ENV === 'production';
}

function newToken(): string {
  return crypto.randomBytes(32).toString('base64url');
}

// Creates a session row for `userId`, sets the session cookie, and
// returns the token.
//
// Cookie flags:
// - httpOnly: client JS can never read this cookie (mitigates token theft
//   via XSS).
// - secure: only in production — `astro dev` over plain http in local
//   dev would silently drop a `secure` cookie otherwise, breaking login
//   locally. Staging/prod are always served over https.
// - sameSite: 'lax' — sent on top-level navigations (so the post-login
//   redirect and normal link navigation work) but withheld from
//   cross-site subrequests, which is the CSRF-relevant protection at the
//   cookie level; the double-submit token (lib/csrf.ts) covers the
//   same-site-but-cross-origin-form gap sameSite=lax doesn't.
export async function createSession(cookies: AstroCookies, userId: string): Promise<string> {
  const token = newToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.insert(sessions).values({ id: token, userId, expiresAt });
  cookies.set(SESSION_COOKIE, token, {
    path: '/',
    httpOnly: true,
    secure: isProd(),
    sameSite: 'lax',
    expires: expiresAt,
  });
  return token;
}

// Looks up the session cookie and returns the associated user, or null if
// there is no cookie, no matching row, or the session has expired.
// Opportunistically refreshes `lastSeenAt` — best-effort; a failure here
// must not block the request.
export async function getSession(cookies: AstroCookies): Promise<User | null> {
  const token = cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }

  const rows = await db
    .select({ session: sessions, user: users })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.id, token))
    .limit(1);

  const row = rows[0];
  if (!row || row.session.expiresAt.getTime() <= Date.now()) {
    return null;
  }

  try {
    await db.update(sessions).set({ lastSeenAt: sql`now()` }).where(eq(sessions.id, token));
  } catch {
    // Best-effort — an admin's request should not fail just because the
    // lastSeenAt bookkeeping update did.
  }

  return row.user;
}

// Revokes a session: deletes the DB row (making it un-resurrectable even
// if the cookie is replayed) and clears the cookie. Safe to call even if
// the token doesn't exist or the cookie is already gone.
export async function destroySession(cookies: AstroCookies): Promise<void> {
  const token = cookies.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.id, token));
  }
  cookies.delete(SESSION_COOKIE, { path: '/' });
}
