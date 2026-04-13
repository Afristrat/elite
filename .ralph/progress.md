# Ralph Progress — Portfolio Decision Platform

## État courant
- **Dernière story complétée :** S-001 (Initialisation Next.js)
- **Prochaine story :** S-002 (Schéma DB Supabase)
- **Bloquant :** Rotation des clés Supabase requise avant S-002

## Codebase Patterns

### Stack
- Next.js 15 App Router — jamais `pages/`
- Server Actions avec `'use server'` pour toutes les mutations
- `'use client'` uniquement pour l'interactivité browser stricte
- Toutes les Server Actions retournent `{ success: boolean, error?: string, data?: T }`

### Structure des routes
- Routes publiques : `app/(public)/`
- Routes protégées : `app/(app)/` — middleware vérifie session
- Routes admin : `app/admin/` — middleware vérifie `role = 'admin'`
- Routes API : `app/api/` — uniquement pour streaming IA et CRON

### Supabase
- Client SSR : `lib/supabase/server.ts` → `createServerClient`
- Client browser : `lib/supabase/client.ts` → `createBrowserClient`
- RLS activé sur TOUTES les tables — aucune exception
- Migrations versionnées : `supabase/migrations/001_initial_schema.sql`, `002_...`
- Types regénérés après chaque migration : `supabase gen types typescript --local > types/database.ts`

### Sécurité
- Jamais de secret dans le code
- Clés API utilisateurs : hash SHA-256 + preview 8 chars uniquement
- CRON protégé par `Authorization: Bearer CRON_SECRET`
- Décisions immuables : RLS INSERT ONLY sur table `decisions`

### Qualité
- Quality gates : `npm run typecheck` + `npm run lint` + `npm run build` avant chaque story
- Zéro `any` TypeScript sans commentaire
- Zéro erreur/warning toléré

## Log des itérations

### 2026-04-13 — S-001 : Initialisation Next.js
- Fichiers créés : projet Next.js 15, shadcn/ui, toutes dépendances installées
- Arborescence complète créée
- `.env.example` documenté, `.env.local` prêt (clés à remplir après rotation)
- CLAUDE.md Level 6 copié dans le projet
- `.ralph/prd.json` initialisé avec 49 stories
- **Learnings :** `toast` shadcn deprecated → utiliser `sonner` à la place
- **BLOQUANT :** clés Supabase partagées en clair dans le chat → rotation requise avant S-002
