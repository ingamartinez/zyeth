import type { APIRoute } from 'astro';

import { db, talentApplications } from '../../db';
import { handlePreflight, jsonResponse } from '../../lib/cors';
import { checkRateLimit, getClientIp } from '../../lib/rate-limit';
import { storeCv, validateCv } from '../../lib/uploads';
import { applicationFieldsSchema, formatZodErrors, HONEYPOT_FIELD } from '../../lib/validation';

// Public talent/careers application endpoint (multipart/form-data with a
// CV file). See src/lib/{validation,cors,rate-limit,uploads}.ts for the
// shared logic — this file is intentionally a thin wiring layer.

export const OPTIONS: APIRoute = handlePreflight;

// FormData.get() returns `string | File | null`. Missing fields come back
// as `null`, while a JSON body would simply omit the key (`undefined`).
// Normalize both text-field cases to `undefined` so the shared zod schema
// treats them identically regardless of request shape.
function textField(form: FormData, key: string): string | undefined {
  const value = form.get(key);
  return typeof value === 'string' ? value : undefined;
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const ip = getClientIp(request, clientAddress);
  if (!checkRateLimit(ip)) {
    return jsonResponse(
      { ok: false, errors: [{ field: '(root)', message: 'Too many requests, try again later' }] },
      429,
      request,
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return jsonResponse(
      { ok: false, errors: [{ field: '(root)', message: 'Invalid form data' }] },
      400,
      request,
    );
  }

  const parsed = applicationFieldsSchema.safeParse({
    name: textField(form, 'name'),
    email: textField(form, 'email'),
    roleExperience: textField(form, 'roleExperience'),
    englishLevel: textField(form, 'englishLevel'),
    [HONEYPOT_FIELD]: textField(form, HONEYPOT_FIELD),
  });
  if (!parsed.success) {
    return jsonResponse({ ok: false, errors: formatZodErrors(parsed.error) }, 400, request);
  }

  // Honeypot: bots that fill the hidden field get a fake success and
  // nothing is persisted — including no CV validation/storage work.
  if (parsed.data[HONEYPOT_FIELD]) {
    return jsonResponse({ ok: true }, 201, request);
  }

  const cv = form.get('cv');
  if (!(cv instanceof File) || cv.size === 0) {
    return jsonResponse(
      { ok: false, errors: [{ field: 'cv', message: 'cv file is required' }] },
      400,
      request,
    );
  }

  const validated = await validateCv(cv);
  if (!validated.ok) {
    if (validated.reason === 'too_large') {
      return jsonResponse(
        { ok: false, errors: [{ field: 'cv', message: 'File exceeds the maximum allowed size' }] },
        413,
        request,
      );
    }
    return jsonResponse(
      { ok: false, errors: [{ field: 'cv', message: 'Unsupported file type (PDF, DOC, DOCX only)' }] },
      400,
      request,
    );
  }

  const cvPath = await storeCv(validated.buffer, validated.ext);

  await db.insert(talentApplications).values({
    name: parsed.data.name,
    email: parsed.data.email,
    roleExperience: parsed.data.roleExperience,
    englishLevel: parsed.data.englishLevel,
    cvPath,
    cvOriginalName: cv.name,
    cvMime: validated.mime,
  });

  return jsonResponse({ ok: true }, 201, request);
};
