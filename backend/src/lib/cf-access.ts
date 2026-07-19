import { createRemoteJWKSet, jwtVerify } from 'jose';

// Verifies the `Cf-Access-Jwt-Assertion` header Cloudflare Access injects
// into every request that passed its edge identity check (#52). This
// replaces the app-level password login — see src/middleware.ts for the
// call site and why a missing/invalid JWT must 403, not redirect.
//
// Team domain: the Cloudflare Access team/org domain (NOT the app's public
// hostname). This drives BOTH the JWKS URL below AND the `iss` check in
// verifyAccessJwt, so — like AUD below — it is deliberately NOT defaulted
// in prod: a silent wrong/missing value would point the JWKS fetch (and
// the issuer check) at the WRONG Cloudflare org's certs, which is a
// fail-OPEN risk if that org's Access setup is looser or misconfigured.
// The dev convenience default is safe because middleware's DEV bypass
// short-circuits before verifyAccessJwt is ever called.
// Exported so src/pages/admin/logout.ts can build the CF Access logout URL
// without duplicating the env-var-with-fallback logic.
export const TEAM_DOMAIN =
  process.env.CF_ACCESS_TEAM_DOMAIN || (import.meta.env.DEV ? 'alejoframes.cloudflareaccess.com' : '');

// The Access application's AUD tag, from the CF Access app's Overview tab.
// Deliberately NOT defaulted — an unset AUD in prod must fail closed
// (verifyAccessJwt throws below) rather than silently skip the audience
// check, which would let a JWT minted for a DIFFERENT Access application
// (any app in the same CF account) authenticate here.
const AUD = process.env.CF_ACCESS_AUD;

// `createRemoteJWKSet` is a module-level singleton by design: it owns its
// own JWKS cache and key-rotation handling (refetches on an unrecognized
// `kid`), so this file must NOT hand-roll caching on top of it, and must
// NOT be re-created per request (that would defeat the cache and hammer
// Cloudflare's certs endpoint).
//
// Guarded on TEAM_DOMAIN being non-empty: in prod with an unconfigured
// CF_ACCESS_TEAM_DOMAIN, TEAM_DOMAIN is '' and `new URL('https:///...')`
// would throw at MODULE LOAD, crashing the whole server instead of
// failing closed per request. Skipping construction here defers the
// failure to verifyAccessJwt's request-time check below, which throws
// per-request (-> 403) exactly like the AUD check, without ever
// re-creating the JWKS set on a hot path.
const JWKS = TEAM_DOMAIN ? createRemoteJWKSet(new URL(`https://${TEAM_DOMAIN}/cdn-cgi/access/certs`)) : undefined;

export interface AccessIdentity {
  email: string;
}

// Verifies signature + `iss` + `aud` + `exp`/`nbf` (all via jose's
// `jwtVerify`) and extracts the identity's email. Throws on ANY failure —
// callers must treat a throw as "reject the request" (403), never as
// "proceed unauthenticated".
export async function verifyAccessJwt(token: string): Promise<AccessIdentity> {
  if (!TEAM_DOMAIN || !JWKS) {
    // Fail closed: mirrors the AUD check below. An unconfigured team
    // domain in prod must never fall back to a default org's certs.
    throw new Error('CF_ACCESS_TEAM_DOMAIN is not configured — refusing to verify Access JWTs');
  }

  if (!AUD) {
    // Fail closed: without an expected audience, a JWT minted for any
    // other Cloudflare Access application in the account would still
    // verify successfully against these JWKS. Never treat "unconfigured"
    // as "trust anything".
    throw new Error('CF_ACCESS_AUD is not configured — refusing to verify Access JWTs');
  }

  const { payload } = await jwtVerify(token, JWKS, {
    issuer: `https://${TEAM_DOMAIN}`,
    audience: AUD,
  });

  const email = typeof payload.email === 'string' ? payload.email : undefined;
  if (!email) {
    throw new Error('Access JWT payload has no email claim');
  }

  return { email };
}
