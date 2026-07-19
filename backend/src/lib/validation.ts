import { z } from 'zod';

// Hidden anti-bot field shared by both public submission forms. The
// frontend (#29) must render this as a visually-hidden (not `display:
// none` — some bots skip those) input named `company`, leave it empty for
// real users, and never populate it programmatically. Any non-empty value
// here marks the submission as a bot; see the routes for the "fake
// success, no persistence" handling.
export const HONEYPOT_FIELD = 'company';

// Callers normalize missing FormData fields (`null`) to `undefined` before
// validating (see `formValue` in the applications route) — JSON bodies
// already omit missing keys as `undefined` natively, so both input shapes
// land here the same way.
// `max` is mandatory on both helpers (no default) — every text field on a
// public endpoint must have an explicit, deliberate length cap (#46). It's
// defense-in-depth against payload abuse, and `name` also flows into the
// outbound email subject (#32), where unbounded length can mangle it.
const maxMessage = (max: number) => `must be ${max} characters or fewer`;
const trimmedRequired = (message: string, max: number) =>
  z.string().trim().min(1, message).max(max, maxMessage(max));
const trimmedOptional = (max: number) =>
  z
    .string()
    .trim()
    .max(max, maxMessage(max))
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined));
// RFC 5321 caps the full reverse-path/forward-path at 254 characters.
const EMAIL_MAX = 254;
const email = (message: string) =>
  z.string().trim().min(1, message).max(EMAIL_MAX, maxMessage(EMAIL_MAX)).pipe(z.email(message));

// POST /api/leads (JSON body).
export const leadSchema = z.object({
  name: trimmedRequired('name is required', 200),
  email: email('email must be a valid address'),
  phone: trimmedOptional(50),
  role: trimmedRequired('role is required', 200),
  expectedRate: trimmedOptional(100),
  // Intentionally left uncapped here (unlike every other field above):
  // it's bounded transitively by the /leads request body cap (#48,
  // MAX_LEAD_BODY_BYTES in pages/api/leads.ts) instead of by zod. Adding
  // `.max()` would turn an oversized-but-under-body-cap honeypot into a
  // 400 validation error, which breaks the anti-bot trap — a filled
  // honeypot must still fall through to the silent fake-201 path.
  [HONEYPOT_FIELD]: z.string().optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;

// POST /api/applications (multipart/form-data) — text fields only. The
// `cv` file itself is validated separately in `lib/uploads.ts`, since it
// needs magic-byte sniffing rather than zod's string/number checks.
export const applicationFieldsSchema = z.object({
  name: trimmedRequired('name is required', 200),
  email: email('email must be a valid address'),
  roleExperience: trimmedRequired('roleExperience is required', 5000),
  englishLevel: trimmedRequired('englishLevel is required', 100),
  // Uncapped for the same reason as leadSchema's honeypot: bounded
  // transitively (here by the 5MB multipart cap in lib/uploads.ts), kept
  // uncapped in zod so the fake-201 anti-bot trap still fires (#48).
  [HONEYPOT_FIELD]: z.string().optional(),
});

export type ApplicationFieldsInput = z.infer<typeof applicationFieldsSchema>;

// Formats a ZodError into a compact, field-level error list that is safe
// to return to untrusted clients — no stack traces, no internal schema
// details beyond the human-readable message we authored above.
export function formatZodErrors(error: z.ZodError): Array<{ field: string; message: string }> {
  return error.issues.map((issue) => ({
    field: issue.path.join('.') || '(root)',
    message: issue.message,
  }));
}
