// Bounded body reading for public JSON endpoints. `request.json()` reads
// the entire body into memory BEFORE any zod validation runs, so a
// per-field `.max()` in the schema does nothing to stop an abusive/huge
// payload from being buffered first — the cap has to happen at the stream
// level, before parsing.

// Reads the request body as UTF-8 text, enforcing a hard byte cap.
// Returns null if the body exceeds maxBytes (caller returns 413).
// Aborts the stream on overflow so we never buffer an abusive body.
export async function readBoundedText(request: Request, maxBytes: number): Promise<string | null> {
  const declared = Number(request.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > maxBytes) return null; // fast reject honest oversized
  if (!request.body) return '';
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString('utf8');
}
