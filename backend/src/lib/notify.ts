import nodemailer, { type Transporter } from 'nodemailer';

// Best-effort SMTP notification on new submissions (leads + talent
// applications). See #32.
//
// SECURITY / RELIABILITY: this module must NEVER throw at startup and
// must NEVER block or fail the submission response. SMTP_* env vars are
// provisioned by the host owner (#33/#34 infra) — until they exist, this
// is a silent (once-warned) no-op so the public submission API keeps
// working. Callers in src/pages/api/{leads,applications}.ts fire this
// without awaiting and attach a `.catch()` so a rejected send is logged,
// not thrown.
//
// Notification emails are English-only — this is an internal/admin
// surface, not user-facing bilingual content (see AGENTS.md § i18n).

const DEFAULT_SMTP_PORT = 587;

interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user?: string;
  pass?: string;
  from: string;
  to: string;
}

// Host, from and to are the minimum required to attempt a send.
// SMTP_USER/SMTP_PASS are intentionally optional (e.g. a local relay
// with no auth). Returns undefined when config is incomplete — the
// caller treats that as "notifications disabled", not an error.
function getSmtpConfig(): SmtpConfig | undefined {
  const host = process.env.SMTP_HOST;
  const from = process.env.NOTIFY_EMAIL_FROM;
  const to = process.env.NOTIFY_EMAIL_TO;

  if (!host || !from || !to) {
    return undefined;
  }

  const rawPort = Number(process.env.SMTP_PORT ?? String(DEFAULT_SMTP_PORT));

  return {
    host,
    port: Number.isFinite(rawPort) && rawPort > 0 ? rawPort : DEFAULT_SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from,
    to,
  };
}

let cachedTransporter: Transporter | undefined;
let warnedMissingConfig = false;

interface NotifyContext {
  transporter: Transporter;
  from: string;
  to: string;
}

// Resolves (and caches) a transporter from the current env config, or
// returns undefined — logging a single startup-style warning the first
// time — when SMTP isn't configured yet.
function getContext(): NotifyContext | undefined {
  const config = getSmtpConfig();
  if (!config) {
    if (!warnedMissingConfig) {
      console.warn(
        '[notify] SMTP not configured (need SMTP_HOST, NOTIFY_EMAIL_FROM, NOTIFY_EMAIL_TO) — submission notification emails are disabled.',
      );
      warnedMissingConfig = true;
    }
    return undefined;
  }

  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.user && config.pass ? { user: config.user, pass: config.pass } : undefined,
    });
  }

  return { transporter: cachedTransporter, from: config.from, to: config.to };
}

export interface LeadNotificationData {
  name: string;
  email: string;
  phone?: string;
  role: string;
  expectedRate?: string;
  source: string;
}

export interface ApplicationNotificationData {
  name: string;
  email: string;
  roleExperience: string;
  englishLevel: string;
  cvOriginalName: string;
}

function buildLeadEmail(data: LeadNotificationData): { subject: string; text: string } {
  const subject = `New lead: ${data.name}`;
  const text = [
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Phone: ${data.phone ?? '(not provided)'}`,
    `Role: ${data.role}`,
    `Expected rate: ${data.expectedRate ?? '(not provided)'}`,
    `Source: ${data.source}`,
  ].join('\n');
  return { subject, text };
}

function buildApplicationEmail(data: ApplicationNotificationData): { subject: string; text: string } {
  const subject = `New talent application: ${data.name}`;
  const text = [
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Role/experience: ${data.roleExperience}`,
    `English level: ${data.englishLevel}`,
    `CV file: ${data.cvOriginalName}`,
  ].join('\n');
  return { subject, text };
}

export function notifyNewSubmission(kind: 'lead', data: LeadNotificationData): Promise<void>;
export function notifyNewSubmission(
  kind: 'application',
  data: ApplicationNotificationData,
): Promise<void>;
export async function notifyNewSubmission(
  kind: 'lead' | 'application',
  data: LeadNotificationData | ApplicationNotificationData,
): Promise<void> {
  const context = getContext();
  if (!context) {
    return;
  }

  const { subject, text } =
    kind === 'lead'
      ? buildLeadEmail(data as LeadNotificationData)
      : buildApplicationEmail(data as ApplicationNotificationData);

  await context.transporter.sendMail({ from: context.from, to: context.to, subject, text });
}
