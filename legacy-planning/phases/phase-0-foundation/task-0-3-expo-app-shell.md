# Task 0-3: Expo Mobile App Shell
**Phase:** 0 — Foundation  
**Status:** 🔲 Not Started  
**Depends on:** Task 0-1 (Supabase credentials)

---

## Objective

Initialize the React Native mobile app using Expo. Configure EAS for future builds. Connect to Supabase. Set up navigation structure and role-based routing. No features built yet — just the shell, navigation, and auth.

---

## Project Structure to Build

```
/app-mobile
├── app/
│   ├── _layout.tsx                ← Root layout, auth listener
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── welcome.tsx            ← Splash/onboarding
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   └── role-select.tsx        ← Choose: Artist, Venue, or Patron
│   ├── (patron)/
│   │   ├── _layout.tsx            ← Tab navigator
│   │   ├── index.tsx              ← Discovery feed (placeholder)
│   │   ├── map.tsx                ← Map view (placeholder)
│   │   ├── calendar.tsx           ← Weekly calendar (placeholder)
│   │   └── profile.tsx            ← Patron profile
│   ├── (artist)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              ← Artist dashboard (placeholder)
│   │   ├── events.tsx             ← My events (placeholder)
│   │   └── profile.tsx            ← Artist profile
│   └── (venue)/
│       ├── _layout.tsx
│       ├── index.tsx              ← Venue dashboard (placeholder)
│       └── profile.tsx            ← Venue profile
├── components/
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── LoadingScreen.tsx
│   └── layout/
│       └── TabBar.tsx
├── lib/
│   ├── supabase.ts                ← Supabase client
│   └── auth.ts                    ← Auth helpers
├── store/
│   └── auth.ts                    ← Zustand auth store
├── constants/
│   └── colors.ts                  ← Brand colors
├── app.json
├── eas.json
└── .env                           ← Expo env vars (EXPO_PUBLIC_*)
```

---

## Steps

### 1. Initialize Project
```bash
npx create-expo-app@latest app-mobile --template blank-typescript
cd app-mobile
npx expo install expo-router expo-linking expo-constants expo-status-bar
```

### 2. Install Dependencies
```bash
npx expo install @supabase/supabase-js
npx expo install expo-secure-store
npx expo install expo-camera expo-image-picker expo-sharing
npx expo install expo-notifications expo-location
npm install zustand @tanstack/react-query
npm install nativewind
npx expo install react-native-safe-area-context react-native-screens
```

### 3. Configure app.json

```json
{
  "expo": {
    "name": "Who's Playing",
    "slug": "whosplaying",
    "version": "1.0.0",
    "scheme": "whosplaying",
    "bundleIdentifier": "live.whosplaying.app",
    "android": {
      "package": "live.whosplaying.app"
    },
    "plugins": [
      "expo-router",
      "expo-camera",
      "expo-notifications",
      "expo-location"
    ]
  }
}
```

### 4. Configure EAS
```bash
npm install -g eas-cli
eas login
eas init
```

`eas.json`:
```json
{
  "cli": { "version": ">= 7.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
```

### 5. Supabase Client

`lib/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
}

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
)
```

### 6. Auth Store (Zustand)

`store/auth.ts`:
```typescript
import { create } from 'zustand'
import { supabase } from '../lib/supabase'

interface AuthState {
  session: any | null
  profile: any | null
  loading: boolean
  setSession: (session: any) => void
  setProfile: (profile: any) => void
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  profile: null,
  loading: true,
  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),
  signOut: async () => {
    await supabase.auth.signOut()
    set({ session: null, profile: null })
  },
}))
```

### 7. Root Layout Auth Listener

`app/_layout.tsx`: Listen to `supabase.auth.onAuthStateChange`, fetch profile, route to appropriate tab group based on `profile.role`.

### 8. Brand Colors

`constants/colors.ts`:
```typescript
export const Colors = {
  primary: '#FF6B35',      // Energetic orange — live music feel
  secondary: '#1A1A2E',    // Deep navy
  accent: '#E94560',       // Hot pink/red accent
  background: '#0F0F1A',   // Near-black background
  surface: '#16213E',      // Card surface
  text: '#FFFFFF',
  textMuted: '#9CA3AF',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
}
```

---

## Validation Checklist

- [ ] `npx expo start` launches without errors
- [ ] Auth flow: sign up → role select → correct tab group
- [ ] Session persists after app close (SecureStore working)
- [ ] Supabase connection confirmed (test query in `_layout.tsx`)
- [ ] EAS project initialized and linked
- [ ] Simulator runs on iOS and Android

---

## Update Task Log

Mark tasks 0.8 and 0.9 in TASK_LOG.md when complete.
