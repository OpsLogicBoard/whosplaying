# Task 1A — Schema Additions
**Phase:** 1 — Admin Pipeline (Step A)
**Status:** 🔲 Not Started
**Depends on:** Phase 0 task 0.2 (base schema applied)

---

## Objective

Apply the Phase 1 redesign additions to the Supabase schema: new tables for canonical lists, recurring rules, capture sources, settings, audit log; new columns on `events` and `social_captures`; new enum types; FKs and indexes.

Full SQL in **`architecture/database-schema.md`** under headings:
- "Enums" — new types `capture_flag`, `capture_source_type`
- "Events" / "social_captures" — new columns
- "Canonical Lists & Automation (Phase 1 redesign)" — full new tables section
- "Row Level Security Policies" — new admin-only policies
- "Indexes" — new indexes

---

## Steps

1. **Create migration file** `supabase/migrations/20260511000000_phase1_redesign.sql`. Copy the SQL from the four sections above in order: enums → column ALTERs on existing tables → new tables → ALTERs that resolve forward FKs → RLS policies → indexes.
2. **Apply migration:**
   ```
   supabase db push
   ```
   Or via the Supabase MCP `mcp__5e088359-...__apply_migration`.
3. **Verify:**
   ```
   supabase db diff
   ```
   Expect "no schema changes detected" (the migration is fully applied).
4. **Smoke test:**
   ```sql
   SELECT count(*) FROM venue_canonical;        -- 0
   SELECT count(*) FROM recurring_rules;        -- 0
   SELECT * FROM settings;                      -- one row, defaults
   ```

---

## Validation Checklist

- [ ] Migration file created and committed
- [ ] All 6 new tables exist (`venue_canonical`, `artist_canonical`, `recurring_rules`, `capture_sources`, `settings`, `auto_publish_log`)
- [ ] `events` has `auto_approved`, `recurring_rule_id`, `google_calendar_event_id`
- [ ] `social_captures` has `flag`, `match_rule_id`, `vision_confidence`, `parsed_end_time`, `source_post_id`, `capture_source_id`
- [ ] All RLS policies created and enforced (try a SELECT as non-admin — should return 0)
- [ ] `settings` row exists with defaults

---

## Update Task Log

Mark tasks 1.A1, 1.A2, 1.A3 complete.
