// Shared pagination helpers for the admin list pages (#31: leads +
// applications). Deliberately tiny — both lists use the same "25 per
// page, ?page=N" scheme, so this avoids re-deriving page-number parsing
// and prev/next URL building twice.

export const PAGE_SIZE = 25;

// Parses `?page=` defensively: missing, non-numeric, zero, or negative
// values all fall back to page 1 rather than producing a negative
// OFFSET or a NaN that would reach Drizzle.
export function parsePage(searchParams: URLSearchParams): number {
  const raw = searchParams.get('page');
  const parsed = raw ? Number.parseInt(raw, 10) : 1;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

// Trims a text filter param to `undefined` when absent/blank, so callers
// can pass it straight into an `ilike`/`eq` condition builder without a
// separate blank check at every call site.
export function parseFilter(searchParams: URLSearchParams, key: string): string | undefined {
  const value = searchParams.get(key)?.trim();
  return value ? value : undefined;
}

// Builds a same-page URL with `page` swapped to `targetPage`, preserving
// every other query param (the active filters) — used for prev/next
// links and the filter form's implicit page reset.
export function pageUrl(url: URL, targetPage: number): string {
  const next = new URLSearchParams(url.searchParams);
  next.set('page', String(targetPage));
  return `${url.pathname}?${next.toString()}`;
}
