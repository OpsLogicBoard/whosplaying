# Task 0-1: Supabase Project Setup
**Phase:** 0 — Foundation  
**Status:** 🔲 Not Started  
**Depends on:** Nothing — do this first

---

## Objective

Create and fully configure the Supabase project that serves as the backend for both the admin web app and the mobile app.

---

## Steps

### 1. Create Project
- Go to supabase.com → New Project
- Name: `whosplaying`
- Password: generate strong password, save securely
- Region: `East US (North Virginia)`
- Wait for project to provision

### 2. Apply Schema
- Open Supabase SQL Editor
- Copy and run the full SQL from `architecture/database-schema.md` in this order:
  1. Extensions block
  2. Enums block
  3. All CREATE TABLE statements (in document order — respect foreign key dependencies)
  4. Triggers & Functions block
  5. pg_cron schedule block
  6. RLS Policies block
  7. Indexes block
- Confirm: no errors in SQL editor output

### 3. Configure Authentication
- Go to Authentication → Providers
- Enable **Email** (confirm email: OFF for development, ON before production)
- Enable **Google**: 
  - Requires Google OAuth client ID and secret from credentials/setup-guide.md step 2
  - Redirect URL: copy from Supabase and add to Google Console
- Enable **Apple**:
  - Requires Apple Developer account
  - If not available yet, skip and note in TASK_LOG.md as blocked (I-002)

### 4. Create Storage Buckets
- Go to Storage → New Bucket for each:

| Bucket Name | Public | File Size Limit |
|---|---|---|
| `avatars` | ✅ Yes | 5MB |
| `event-images` | ✅ Yes | 10MB |
| `social-captures` | ❌ No | 20MB |
| `post-templates` | ❌ No | 20MB |

### 5. Collect Credentials
- Go to Project Settings → API
- Copy and save:
  - Project URL
  - `anon` / public key
  - `service_role` key (keep secret, server-side only)
- Add all three to `credentials/setup-guide.md` local template

---

## Validation Checklist

- [ ] All tables exist in Table Editor with correct columns
- [ ] `profiles` trigger fires on test user creation
- [ ] `events` trigger sets `publish_at` correctly
- [ ] pg_cron job appears in `cron.job` table
- [ ] RLS enabled on all listed tables
- [ ] All 4 storage buckets exist
- [ ] Google OAuth redirect URL added to Google Console

---

## Update Task Log

Mark task 0.1 through 0.5 in TASK_LOG.md when complete.
