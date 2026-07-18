import { randomUUID } from 'node:crypto';
import { chmod, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { fileTypeFromBuffer } from 'file-type';

// CV upload validation and storage for POST /api/applications.
//
// SECURITY: the client-supplied filename and Content-Type header are
// NEVER trusted. The real file type is determined by sniffing magic
// bytes (`file-type`, which inspects the actual file signature) and only
// PDF/DOC/DOCX are accepted. Stored files are named with a fresh UUID +
// the DETECTED extension — never the client's filename — which also
// sidesteps path traversal and extension-spoofing entirely.
//
// KNOWN LIMITATION (documented, not a bug): legacy .doc files use the
// generic "MS Compound File Binary" (CFB) container, which `file-type`
// cannot distinguish from other legacy Office formats (.xls, .ppt) or MSI
// installers by magic bytes alone — there is no byte signature specific
// to .doc. We accept the generic CFB signature as "doc" below. If this
// becomes an active abuse vector, tighten it with a deeper OLE
// directory-stream check (e.g. presence of a "WordDocument" stream) or
// drop legacy .doc support in favor of PDF/DOCX only.
const ALLOWED_MIME_TO_EXT: Record<string, string> = {
  'application/pdf': '.pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/x-cfb': '.doc',
};

const DEFAULT_MAX_CV_BYTES = 5 * 1024 * 1024; // 5 MB

function getMaxCvBytes(): number {
  const raw = process.env.MAX_CV_BYTES;
  const parsed = raw ? Number(raw) : Number.NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_MAX_CV_BYTES;
}

// Exported so the authenticated CV download route (#31) can resolve the
// exact same directory for its path-traversal guard — a single source of
// truth instead of a second './uploads' default living somewhere else.
export function getUploadsDir(): string {
  return process.env.UPLOADS_DIR ?? './uploads';
}

export type CvRejectionReason = 'too_large' | 'invalid_type';

export type CvValidation =
  | { ok: true; buffer: Buffer; ext: string; mime: string }
  | { ok: false; reason: CvRejectionReason };

// Validates a CV file's REAL bytes and size, independent of the
// client-supplied filename/Content-Type. The size check uses the actual
// buffered byte length (never the Content-Length request header, which a
// client can misreport).
export async function validateCv(file: File): Promise<CvValidation> {
  const buffer = Buffer.from(await file.arrayBuffer());

  if (buffer.length > getMaxCvBytes()) {
    return { ok: false, reason: 'too_large' };
  }

  const detected = await fileTypeFromBuffer(buffer);
  const ext = detected ? ALLOWED_MIME_TO_EXT[detected.mime] : undefined;
  if (!detected || !ext) {
    return { ok: false, reason: 'invalid_type' };
  }

  return { ok: true, buffer, ext, mime: detected.mime };
}

// Persists a validated CV buffer under UPLOADS_DIR with a fresh UUID
// filename (never the client's original filename) and restrictive,
// owner-only permissions. Returns the path stored in the DB.
//
// The uploads directory lives outside any public/static route — nothing
// in this service serves it over HTTP. Only a future authenticated route
// (a later issue) will stream individual files back to admins.
export async function storeCv(buffer: Buffer, ext: string): Promise<string> {
  const dir = getUploadsDir();
  await mkdir(dir, { recursive: true });
  // `mkdir`'s `mode` option is masked by the process umask, so set the
  // permission explicitly to guarantee it regardless of umask.
  await chmod(dir, 0o700);

  const filename = `${randomUUID()}${ext}`;
  const fullPath = path.join(dir, filename);
  await writeFile(fullPath, buffer);
  await chmod(fullPath, 0o600);

  return fullPath;
}
