import path from 'node:path';
import { readFile } from 'node:fs/promises';

import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';

import { db, talentApplications } from '../../../../db';
import { isUuid } from '../../../../lib/ids';
import { getUploadsDir } from '../../../../lib/uploads';

// Authenticated CV download for a single talent application (#31). Lives
// under /admin/* so src/middleware.ts guards it automatically — an
// unauthenticated request gets a 403 from the middleware (#52: Cloudflare
// Access JWT verification) and never reaches this handler. Do NOT move
// this under /api/* (that surface is deliberately public/unauthenticated
// for #28's submission endpoints).

// Strips control characters (CR/LF header-injection) and characters that
// would break out of a quoted filename="..." value. `cvOriginalName` is
// raw, client-supplied `File.name` (see lib/uploads.ts) — NEVER trusted
// verbatim in a response header.
function sanitizeFilename(name: string): string {
  const cleaned = name.replace(/[\x00-\x1f\x7f]/g, '').replace(/["\\]/g, '_').trim();
  return cleaned || 'cv';
}

// RFC 5987 percent-encoding for the `filename*=UTF-8''...` extended
// parameter. `encodeURIComponent` alone leaves `!'()*` unescaped, but
// those characters are excluded from RFC 5987's `attr-char` set, so they
// need manual encoding too.
function encodeRfc5987(value: string): string {
  return encodeURIComponent(value).replace(
    /['()*!]/g,
    (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

// Converts the sanitized filename to a plain-ASCII fallback for the
// unquoted-safe `filename=` parameter (older clients that don't support
// `filename*=`).
function toAsciiFallback(name: string): string {
  const ascii = name.replace(/[^\x20-\x7e]/g, '_');
  return ascii || 'cv';
}

export const GET: APIRoute = async ({ params }) => {
  const id = params.id;
  // `talent_applications.id` is a Postgres `uuid` column — validate the
  // shape BEFORE querying so a malformed id (e.g. `/admin/applications/1/cv`)
  // returns the same 404 as a well-formed-but-missing id, instead of
  // Postgres throwing `invalid input syntax for type uuid` as an
  // unhandled 500.
  if (!id || !isUuid(id)) {
    return new Response('Not found', { status: 404 });
  }

  const rows = await db
    .select()
    .from(talentApplications)
    .where(eq(talentApplications.id, id))
    .limit(1);
  const application = rows[0];
  if (!application) {
    return new Response('Not found', { status: 404 });
  }

  // Defensive path-traversal guard: cvPath is DB-controlled (written once
  // at upload time by lib/uploads.ts storeCv, never derived from this
  // route's :id param), but we still assert it resolves inside
  // UPLOADS_DIR before opening anything, in case of future data/env
  // drift. Never reconstruct a path from the URL id.
  const uploadsRoot = path.resolve(getUploadsDir());
  const resolvedPath = path.resolve(application.cvPath);
  if (resolvedPath !== uploadsRoot && !resolvedPath.startsWith(uploadsRoot + path.sep)) {
    return new Response('Not found', { status: 404 });
  }

  let buffer: Buffer;
  try {
    buffer = await readFile(resolvedPath);
  } catch {
    // File missing on disk (deleted out-of-band) — the DB row still
    // exists, but there's nothing to serve.
    return new Response('Not found', { status: 404 });
  }

  const safeName = sanitizeFilename(application.cvOriginalName);
  const asciiName = toAsciiFallback(safeName);

  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      // cvMime is the server-detected magic-byte MIME from upload-time
      // validation (lib/uploads.ts validateCv), never the client's
      // Content-Type header — safe to echo directly.
      'content-type': application.cvMime || 'application/octet-stream',
      'content-length': String(buffer.length),
      'content-disposition':
        `attachment; filename="${asciiName}"; filename*=UTF-8''${encodeRfc5987(safeName)}`,
      'x-content-type-options': 'nosniff',
    },
  });
};
