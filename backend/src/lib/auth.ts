import argon2 from 'argon2';
import bcrypt from 'bcrypt';

// Password hashing for the single-admin auth flow (#30).
//
// argon2id is the preferred algorithm (memory-hard, current OWASP
// recommendation) but ships a native addon that can fail to build in some
// deploy environments (missing build tools for node-gyp, etc). bcrypt is
// a pure-JS-friendly fallback for that case. We probe argon2 once, lazily,
// and stick with whichever backend actually works for the life of the
// process rather than re-probing on every call.
const BCRYPT_ROUNDS = 12;

let argon2Available: boolean | null = null;

async function isArgon2Available(): Promise<boolean> {
  if (argon2Available !== null) {
    return argon2Available;
  }
  try {
    // Cheap round-trip that exercises the native binding for real, not
    // just confirms the module imported without throwing.
    await argon2.hash('argon2-availability-probe');
    argon2Available = true;
  } catch {
    argon2Available = false;
  }
  return argon2Available;
}

// Hashes a plaintext password. Prefers argon2id; falls back to bcrypt if
// argon2's native build is unavailable in this environment.
export async function hashPassword(plain: string): Promise<string> {
  if (await isArgon2Available()) {
    return argon2.hash(plain, { type: argon2.argon2id });
  }
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

// Verifies a plaintext password against a stored hash. Dispatches on the
// hash's own prefix (argon2 hashes start with `$argon2`, bcrypt with
// `$2`), so this works regardless of which algorithm produced the hash —
// important since a hash created before an argon2 fallback kicked in (or
// vice versa) must still verify correctly.
export async function verifyPassword(hash: string, plain: string): Promise<boolean> {
  if (hash.startsWith('$argon2')) {
    try {
      return await argon2.verify(hash, plain);
    } catch {
      return false;
    }
  }
  return bcrypt.compare(plain, hash);
}

let dummyHash: Promise<string> | null = null;

// Pays the same hashing cost as a real login attempt when no user matches
// the submitted email, so a login against a nonexistent address doesn't
// respond measurably faster than one against a real address. Reduces
// (does not fully eliminate) email-enumeration via response timing. The
// result is intentionally discarded by the caller — this is a fixed,
// never-used password, so it can never itself authenticate anyone.
export async function payDummyHashingCost(plain: string): Promise<void> {
  if (!dummyHash) {
    dummyHash = hashPassword('dummy-password-never-assigned-to-any-account');
  }
  const hash = await dummyHash;
  await verifyPassword(hash, plain);
}
