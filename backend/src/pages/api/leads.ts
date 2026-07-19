import type { APIRoute } from 'astro';

import { db, leads } from '../../db';
import { readBoundedText } from '../../lib/body';
import { handlePreflight, jsonResponse } from '../../lib/cors';
import { notifyNewSubmission } from '../../lib/notify';
import { checkRateLimit, getClientIp } from '../../lib/rate-limit';
import { formatZodErrors, HONEYPOT_FIELD, leadSchema } from '../../lib/validation';

// Public contact-form submission endpoint. See src/lib/{validation,cors,
// rate-limit}.ts for the shared allowlist/limiter/schema logic — this
// file is intentionally a thin wiring layer.

// A real lead is well under 1KB of content (name 200 + email 254 +
// phone 50 + role 200 + rate 100 + JSON overhead). 16KB gives generous
// headroom over that while still killing payload-abuse/memory-during-
// parse attempts on this public, unauthenticated endpoint (#48).
const MAX_LEAD_BODY_BYTES = 16 * 1024;

export const OPTIONS: APIRoute = handlePreflight;

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const ip = getClientIp(request, clientAddress);
  if (!checkRateLimit(ip)) {
    return jsonResponse(
      { ok: false, errors: [{ field: '(root)', message: 'Too many requests, try again later' }] },
      429,
      request,
    );
  }

  const bodyText = await readBoundedText(request, MAX_LEAD_BODY_BYTES);
  if (bodyText === null) {
    return jsonResponse(
      { ok: false, errors: [{ field: '(root)', message: 'Request body too large' }] },
      413,
      request,
    );
  }

  let payload: unknown;
  try {
    payload = JSON.parse(bodyText);
  } catch {
    return jsonResponse(
      { ok: false, errors: [{ field: '(root)', message: 'Invalid JSON body' }] },
      400,
      request,
    );
  }

  const parsed = leadSchema.safeParse(payload);
  if (!parsed.success) {
    return jsonResponse({ ok: false, errors: formatZodErrors(parsed.error) }, 400, request);
  }

  // Honeypot: bots that fill the hidden field get a fake success and
  // nothing is persisted. See lib/validation.ts for the field name
  // contract shared with the frontend.
  if (parsed.data[HONEYPOT_FIELD]) {
    return jsonResponse({ ok: true }, 201, request);
  }

  await db.insert(leads).values({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    role: parsed.data.role,
    expectedRate: parsed.data.expectedRate,
    source: 'contact_form',
  });

  // Fire-and-forget: never await/block the response on the notification
  // email. Failures are logged, not surfaced — see lib/notify.ts.
  notifyNewSubmission('lead', {
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    role: parsed.data.role,
    expectedRate: parsed.data.expectedRate,
    source: 'contact_form',
  }).catch((err: unknown) => {
    console.error('[notify] failed to send lead notification email', err);
  });

  return jsonResponse({ ok: true }, 201, request);
};
