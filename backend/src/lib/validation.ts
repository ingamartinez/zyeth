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
const trimmedRequired = (message: string) => z.string().trim().min(1, message);
const trimmedOptional = () =>
  z
    .string()
    .trim()
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined));
const email = (message: string) => z.string().trim().min(1, message).pipe(z.email(message));

// POST /api/leads (JSON body).
export const leadSchema = z.object({
  name: trimmedRequired('name is required'),
  email: email('email must be a valid address'),
  phone: trimmedOptional(),
  role: trimmedRequired('role is required'),
  expectedRate: trimmedOptional(),
  [HONEYPOT_FIELD]: z.string().optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;

// POST /api/applications (multipart/form-data) — text fields only. The
// `cv` file itself is validated separately in `lib/uploads.ts`, since it
// needs magic-byte sniffing rather than zod's string/number checks.
export const applicationFieldsSchema = z.object({
  name: trimmedRequired('name is required'),
  email: email('email must be a valid address'),
  roleExperience: trimmedRequired('roleExperience is required'),
  englishLevel: trimmedRequired('englishLevel is required'),
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
