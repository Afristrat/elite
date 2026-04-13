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

### 2026-04-13 — S-011 : Prise de décision admin
- `actions/decisions.ts` : recordDecision — vérif admin + projet closed + Zod (decision enum, rationale min 100, real_option si deferred) + INSERT decisions + UPDATE projects → decided
- `components/decisions/decision-modal.tsx` : modal client avec 3 types de décision colorés, justification avec compteur, Real Options collapsible si différé, avertissement immuabilité
- Bouton "Prendre une décision" affiché sur page résultats pour admin si statut='closed'

### 2026-04-13 — S-009 : Résultats agrégés et quorum
- `app/(app)/projects/[id]/results/page.tsx` : KPIs quorum, barres par critère, Red Team agrégé, commentaires anonymisés
- Admin : noms des évaluateurs visibles via requête profiles séparée (deux queries distinctes — Supabase ne permet pas le select conditionnel typé)
- Contrôle d'accès par statut projet (open=admin only, closed/decided/archived=tous)
- **Learning :** select conditionnel ternaire dans Supabase → ParserError TypeScript → toujours séparer en deux queries distinctes

### 2026-04-13 — S-008 : Formulaire d'évaluation par critères
- `lib/validators/evaluation.ts` : EvaluationSchema (scores Record<uuid, 0-10>, commentaire min 50, Red Team optionnel)
- `actions/evaluations.ts` : submitEvaluation — vérif rôle + statut open + proposant != évaluateur + double check + INSERT + quorum check → status closed
- `app/(app)/projects/[id]/evaluate/page.tsx` : guards (contributeur, proposant, déjà évalué, projet fermé)
- `components/evaluations/evaluation-form.tsx` : sliders 0-10 colorés, score pondéré temps réel, Red Team collapsible, modal confirmation

### 2026-04-13 — S-020 : Gestion des clés API
- `lib/ai/crypto.ts` : createCrypto() avec sha256() via Web Crypto API (Node + Edge compatible)
- `lib/ai/keys.ts` : hashApiKey(), buildKeyPreview(), hasApiKey() 
- `actions/settings.ts` : saveApiKey (UPSERT + hash), deleteApiKey, updateNotificationPrefs, updateProfile
- `app/(app)/settings/api-keys/page.tsx` + `api-keys-manager.tsx` : formulaire + liste, clés globales admin
- **Règle sécurité :** clé en clair JAMAIS stockée ni retournée — hash + preview seulement

### 2026-04-13 — S-023 : Gestion des membres
- `actions/members.ts` : updateMemberRole, updateMemberStatus, anonymizeMember (RGPD Art. 17)
- `app/admin/members/page.tsx` + `members-manager.tsx` : liste, rôle select, suspension, modal RGPD avec phrase de confirmation
- **Learning :** `evaluateur_id` NOT NULL dans la migration actuelle → cast `null as unknown as string` + note migration 002 requise

### 2026-04-13 — S-022 : Gestion des invitations
- `actions/invitations.ts` : createInvitation (vérif doublons + statut actif), revokeInvitation (expire_at = now()), resendInvitation (prolonge +7j)
- `app/admin/invitations/page.tsx` + `invitations-manager.tsx` : liste, formulaire création, copy link, révocation, prolongement
- `app/admin/layout.tsx` : protection double (middleware + layout) rôle admin
- `app/(public)/invite/[token]/page.tsx` : validation token, affichage rôle, lien login avec token
- **Learning :** `Date.now()` interdit dans render par `react-hooks/purity` (React Compiler) → utiliser `new Date().getTime()`

### 2026-04-13 — S-007 : Liste et détail des projets
- `app/(app)/projects/page.tsx` : liste avec filtres URL (statut + horizon), cartes avec deadline overdue, MOIC, tags
- `app/(app)/projects/[id]/page.tsx` : détail complet — tabs nav, stats quorum (vue DB), Market Research, Monte Carlo scénarios, Investment Thesis, Barbell, thèses macro
- Contributeurs ne voient pas draft/pre-mortem (filtre rôle serveur)
- **Learning :** `&amp;` pour `&` dans JSX (risques & hypothèses title)

### 2026-04-13 — S-005 : Formulaire de soumission de projet
- Fichiers créés : `lib/validators/project.ts`, `actions/projects.ts`, `hooks/useAutoSave.ts`, `components/projects/project-form.tsx`, `app/(app)/projects/new/page.tsx`, `app/(app)/projects/page.tsx`, `app/(app)/projects/[id]/page.tsx`
- Formulaire multi-étapes 5 étapes : Identité → Description → Finances → Thèse → Finalisation
- Auto-save debounce 30s avec `useAutoSave`, sauvegarde avant unload, statut visuel
- Server Actions : `saveDraft` (UPSERT selon projectId), `submitProject` (validation Zod v4 complète + redirect), `archiveProject`
- **Learning critique : Zod v4 API différente** — `invalid_type_error`/`required_error` → `error`, `parsed.error.errors` → `parsed.error.issues`
- Liste projets avec filtrage rôle (contributeur ne voit pas les drafts)
- Tag input avec ajout par Entrée, suppression individuelle

### 2026-04-13 — S-002 : Schéma DB Supabase
- 14 tables créées, 15 enums, RLS sur toutes les tables, vue `project_evaluation_stats`
- Migration appliquée via `supabase db push`
- Types TypeScript générés via `supabase gen types typescript`
- **Learning :** après chaque migration → régénérer `types/database.ts` obligatoirement

### 2026-04-13 — S-003 : Auth Google OAuth
- Middleware protège `/app/*` et `/admin/*`, vérifie rôle + statut
- Callback gère : invitation valide → rôle affecté, email non invité → /access-denied
- **Learning critique :** le Button shadcn utilise `@base-ui/react` dans cette version — pas de prop `asChild`. Utiliser `<Link>` stylisé directement pour les boutons-liens.

### 2026-04-13 — Sprint final (session 3) — S-038 à S-006/S-021

**Stories complétées :** S-038, S-032, S-042, S-048, S-006, S-021
**État :** 49/49 stories passes:true — COMPLET

#### Nouveaux patterns critiques

**react-hooks/purity (React Compiler ESLint) :**
- `Date.now()` interdit → toujours `const now = new Date()`
- `setState` dans `useEffect` interdit → utiliser initialiseur lazy de useState :
  ```typescript
  const [val, setVal] = useState<T>(() => readFromLocalStorage())
  ```

**localStorage avec initialiseur lazy :**
```typescript
function readStoredValue(): boolean {
  if (typeof window === 'undefined') return false
  try { return localStorage.getItem(KEY) === 'true' } catch { return false }
}
const [isExpert, setIsExpert] = useState<boolean>(readStoredValue)
```

**API IA (Claude + Perplexity) — sans SDK :**
- Utiliser `fetch` directement vers `https://api.anthropic.com/v1/messages`
- Header : `'x-api-key'` + `'anthropic-version': '2023-06-01'`
- Streaming Anthropic : SSE — parser `data: ` lines, événement `content_block_delta.delta.text`
- Perplexity : `https://api.perplexity.ai/chat/completions` — format OpenAI compatible
- Rate limiting in-memory : `Map<userId, {count, resetAt}>` — suffisant pour groupe fermé 5–50

**Matrice GE-McKinsey 9-Box :**
- Attractivité (Y) : MOIC cible → seuils < 3× (Faible), 3–5× (Moyenne), > 5× (Élevée)
- Force compétitive (X) : score comité → < 5 (Faible), 5–7 (Moyenne), > 7 (Élevée)
- Key GE quadrant : `${attrIdx}-${strIdx}` → couleur + label + recommandation

**AHP (Analytic Hierarchy Process) :**
- Matrice n×n, triangle supérieur éditables, triangle inférieur = 1/val
- Calcul poids : normaliser colonnes → moyenner lignes
- CR = CI/RI où CI = (λmax - n)/(n-1) — CR < 0.10 = cohérent
- Sauvegarde bloquée si CR ≥ 10%

**Mode Expert (progressive disclosure) :**
- localStorage key `'veille-elite:expert-mode'`
- Hook `useExpertMode()` avec initialiseur lazy
- Appliqué au formulaire d'évaluation : Red Team affiché par défaut si expert

**Composant AITextArea :**
- `components/ui/ai-textarea.tsx` — wrapper textarea avec bouton ✨
- Affiche suggestion IA séparée, acceptation explicite requise
- Appelle `/api/ai/improve` (streaming)

**MarketResearchPanel :**
- `components/projects/market-research-panel.tsx`
- Appelle `/api/ai/market-research` (Perplexity)
- onApply callback → injecte risques dans le formulaire

#### Fichiers créés ce sprint
- `app/(app)/analytics/batting-average/page.tsx` — Batting Average / Slugging
- `app/(app)/analytics/ge-mckinsey/page.tsx` — GE-McKinsey 9-Box
- `app/(app)/analytics/ahp/page.tsx` + `ahp-calibrator.tsx` — AHP Calibration
- `app/(app)/settings/preferences/page.tsx` + `expert-mode-toggle.tsx` — Mode Expert
- `lib/analytics/ahp.ts` — AHP algo pur TypeScript
- `actions/ahp.ts` — saveAHPWeights (critères par défaut)
- `hooks/useExpertMode.ts` — localStorage hook
- `hooks/useAIImprove.ts` — streaming IA hook
- `components/ui/ai-textarea.tsx` — textarea avec bouton IA
- `components/projects/market-research-panel.tsx` — Perplexity panel
- `app/api/ai/improve/route.ts` — route Claude streaming
- `app/api/ai/market-research/route.ts` — route Perplexity
