# Lesson: Athlete contact info lives in `parent_guardian_*` columns, not `email`/`phone`

**Status:** Locked. 2026-05-27 (commit `f77c524`).
**Pain history:** Rachel told us "the athlete profile shows me no contact info — very frustrating when I need to reach the parent." We had a UI rendering empty data because we were reading the wrong columns.

## The fact

When reading or writing athlete contact info on PSP.Pro:

| Field | Use this column | NOT this |
|---|---|---|
| Parent/guardian email | `profiles.parent_guardian_email` (73/112 filled) | `profiles.email` (4/112), `profiles.parent_email` (0/112) |
| Parent/guardian phone | `profiles.parent_guardian_phone` (30/112 filled) | `profiles.phone` (0/112), `profiles.parent_phone` (0/112) |
| Parent/guardian name | `profiles.parent_guardian_name` (73/112 filled) | `profiles.full_name` (varies) |

For non-parent athletes, fall back through: parent_guardian_* → account email/phone → `null` (and surface a clear "No contact on file" prompt rather than a blank).

## Why the wrong columns existed

PSP.Pro evolved through several waves of schema:

1. Original schema had `email`/`phone` for the athlete account.
2. Migration 016 added `parent_guardian_name/email/phone` for the COPPA flow (parent contact for under-18 athletes).
3. Migration 050 added `account_type='parent_guardian'` and `child_name`/`child_age` for under-13 accounts where the parent IS the account holder.
4. Migration 057 added multi-child parent support (`active_child_id` + a separate `children` table).

Result: 4 candidate places to look for "the parent's email" — and `database.types.ts` is stale and only lists `parent_email`. Anyone trusting the types file or grabbing the first matching column shipped a bug.

## The fix pattern

Helper in `src/app/(dashboard)/admin/athletes/[id]/page.tsx`:

```ts
function resolveContact(a: AthleteProfile) {
  return {
    name: a.parent_guardian_name || (a.account_type === 'parent_guardian' ? a.full_name : null),
    email: a.parent_guardian_email || a.email || null,
    phone: a.parent_guardian_phone || a.phone || null,
  }
}
```

UI shows "Parent/Guardian Contact — Lauren Long" for parent accounts, plain "Contact — <name>" for standard accounts, and "No contact on file — add phone/email" prompt with an Edit link when both fall through to null.

## The write path

The `/api/admin/update-athlete` PATCH route accepts `parent_guardian_phone`, `parent_guardian_email`, `parent_guardian_name` and writes them directly. The athlete profile Edit modal now sends those fields (not `phone`/`email`) so coaches write to the columns the page reads from.

## ⚠ If you add a new contact field, surface, or migration

- Default to `parent_guardian_*` columns for reading
- Always fall back through every candidate column
- NEVER trust `database.types.ts` to be current — query Supabase with the service_role key in `.env.local` to confirm
- If a new column is added (e.g. for multi-child contact), update [bibles/coppa-parent-accounts.md] (when it exists) AND the `resolveContact` helper

## Related

- Commit `f77c524` (2026-05-27) — Athlete contact + in-app messaging fixes
- `feedback_query_db_before_guessing.md` — the general pattern for not trusting stale type files
- Migration 016 — original parent_guardian fields
- Migration 050 — parent_guardian account_type
- Migration 057 — multi-child parent accounts
