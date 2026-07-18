// Shared UUID validation for the admin :id routes (#31). `leads.id` and
// `talent_applications.id` are Postgres `uuid` columns — passing a
// non-UUID string straight into `eq(table.id, id)` makes Postgres throw
// `invalid input syntax for type uuid`, which would otherwise surface as
// an unhandled 500 instead of a clean 404/redirect. Validate BEFORE
// querying so a malformed id short-circuits to the same "not found" path
// as a well-formed-but-missing id, with no DB round-trip.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}
