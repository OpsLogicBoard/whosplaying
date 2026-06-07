# Task 0-2: Next.js Admin Web App Shell
**Phase:** 0 — Foundation  
**Status:** 🔲 Not Started  
**Depends on:** Task 0-1 (Supabase credentials needed)

---

## Objective

Initialize the admin web application. This is a browser-only tool used by the single admin. It must be clean, fast, and functional — not patron-facing. Deploy to Vercel at `admin.whosplaying.live`.

---

## Project Structure to Build

```
/admin
├── app/
│   ├── layout.tsx                 ← Root layout, auth guard
│   ├── page.tsx                   ← Redirect to /dashboard or /login
│   ├── login/
│   │   └── page.tsx               ← Admin login page
│   └── dashboard/
│       ├── layout.tsx             ← Dashboard shell with sidebar
│       ├── page.tsx               ← Overview / today summary
│       ├── captures/
│       │   └── page.tsx           ← Social capture review queue (Phase 1)
│       ├── events/
│       │   ├── page.tsx           ← Event list
│       │   └── [id]/page.tsx      ← Event detail / edit
│       └── posts/
│           └── page.tsx           ← Daily post generator (Phase 1)
├── components/
│   ├── ui/                        ← Shadcn/ui components
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│   └── events/
│       └── EventCard.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts              ← Browser client
│   │   └── server.ts              ← Server client (uses service role)
│   └── utils.ts
├── middleware.ts                   ← Auth protection on /dashboard/*
├── .env.local                      ← Local environment variables
└── next.config.ts
```

---

## Steps

### 1. Initialize Project
```bash
npx create-next-app@latest admin --typescript --tailwind --app --src-dir=false
cd admin
```

### 2. Install Dependencies
```bash
npm install @supabase/supabase-js @supabase/ssr
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-label @radix-ui/react-select @radix-ui/react-toast
npm install lucide-react
npm install class-variance-authority clsx tailwind-merge
npm install react-hook-form zod @hookform/resolvers
npm install @tanstack/react-query
```

### 3. Configure Supabase Clients

`lib/supabase/client.ts`:
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

`lib/supabase/server.ts`:
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  )
}
```

### 4. Auth Middleware

`middleware.ts`:
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const supabase = createServerClient(/* config */)
  const { data: { session } } = await supabase.auth.getSession()

  if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Verify admin role
  if (session) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (profile?.role !== 'admin' && request.nextUrl.pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*']
}
```

### 5. Dashboard Shell
- Build `Sidebar.tsx` with navigation links: Dashboard, Captures, Events, Posts
- Build `Header.tsx` with admin email display and logout button
- Dashboard home page shows: today's event count, pending captures count, last post generated date

### 6. Configure Environment Variables
Copy `.env.local` template from `credentials/setup-guide.md` and fill in Supabase values.

### 7. Deploy to Vercel
```bash
vercel
```
- Select: Create new project
- Framework: Next.js
- Add all environment variables in Vercel dashboard
- Custom domain: `admin.whosplaying.live` (requires DNS access to whosplaying.live)

---

## Validation Checklist

- [ ] `npm run dev` starts without errors
- [ ] Admin can log in via email/password
- [ ] `/dashboard` is protected — redirects to `/login` when unauthenticated
- [ ] Non-admin users are blocked from `/dashboard`
- [ ] Vercel deployment live at `admin.whosplaying.live`
- [ ] Environment variables present in Vercel dashboard

---

## Update Task Log

Mark tasks 0.6 and 0.7 in TASK_LOG.md when complete.
