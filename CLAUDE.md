# CLAUDE.md — Portfolio Decision Platform

> Ce fichier est la source de vérité du projet. Claude Code doit le lire en premier
> avant toute action et s'y référer à chaque étape.

| Champ | Valeur |
|---|---|
| Projet | Portfolio Decision Platform — Veille Élite |
| Version | 0.1.0 |
| Dernière MAJ | 2026-04-13 |
| Auteur | Amine |
| Statut | En cours |
| Level | 6 — Enterprise Auditable |
| Stack | Next.js 15 + Supabase + Tailwind + shadcn/ui + TypeScript |
| Hébergement | Coolify (self-hosted, local) |
| PRD | `tasks/prd-portfolio-decision-platform.md` |

---

## Couche 1 — Directives

### 🎯 Objectif

**En une phrase :** Plateforme web fermée permettant au groupe Veille Élite d'évaluer collectivement des projets d'investissement via un processus structuré, aveugle et auditable.

**Développement :**
- **Problème résolu :** Processus décisionnel informel sur WhatsApp/Google Sheets — pas de traçabilité, biais de confirmation, pas de quorum, pas d'apprentissage collectif
- **Utilisateur cible :** Groupe fermé de 5–50 membres (évaluateurs professionnels, contributeurs financiers) invités par l'admin
- **Proposition de valeur :** 37 frameworks C-level intégrés (AHP, PROMETHEE, Monte Carlo, Pre-Mortem, AAR…) dans une UX accessible aux non-techniciens, avec vote aveugle jusqu'au quorum et historique immuable
- **Modèle d'usage :** Outil interne — pas de revenus directs. Valeur = qualité des décisions d'investissement du groupe
- **Métriques de succès :** Batting Average > 60%, taux de complétion évaluation > 80%, AAR remplis > 70%, zéro décision sans quorum

### 📅 Types de projets & timelines post-investissement

| Type | Early Check-In | AAR | Outcome Harvesting | Review annuelle |
|---|---|---|---|---|
| **Startup early-stage** | J+30 | J+100 (fin 100-Day Plan) | J+6 mois | J+12 mois |
| **Growth / scale-up** | J+45 | J+100 | J+9 mois | J+18 mois |
| **B2B / infra** | J+60 | J+90 | J+12 mois | J+24 mois |

**Règle :** le type est sélectionné à la soumission du projet et détermine les CRON automatiques. Il peut être modifié par l'admin avant la décision. Par défaut : `startup-early-stage`.

**Logique Early Check-In (J+30) :** signaux quantitatifs uniquement — ARR, nb users actifs, burn mensuel, runway. Pas d'appréciation qualitative (trop tôt). Formulaire simple, 5 champs max.

### 📥 Inputs

| Source | Format | Validation | Description |
|---|---|---|---|
| Formulaire soumission projet | React Hook Form + Zod | 9 champs, auto-save 30s | Soumission de projet par un membre |
| Formulaire évaluation | React Hook Form + Zod | 5 critères + Red Team + commentaire min 50 chars | Vote d'un évaluateur |
| Formulaire Pre-Mortem | Textarea | Min 50 chars par champ | Exercice collectif pré-évaluation |
| Upload fichiers | PDF/XLSX/PPTX | Max 10MB/fichier, 5 fichiers max, MIME + magic bytes | Pièces jointes projet |
| API keys externes | Texte (input password) | Jamais stockées en clair — hash SHA-256 + preview 8 chars | Clés Anthropic/OpenAI/Perplexity |
| Webhook Evolution API | — | Token bearer validé | Statut livraison WhatsApp |
| CRON events | HTTP + Bearer CRON_SECRET | Header Authorization requis | Rappels, revues, AAR, backups |

### 📤 Outputs

| Output | Format | Destination | SLA |
|---|---|---|---|
| Page résultats agrégés | JSON → React UI | Membres connectés | Temps réel (Supabase Realtime) |
| Notification email | React Email HTML | Resend → inbox membre | < 30s après événement |
| Notification WhatsApp | Texte structuré | Evolution API → WhatsApp | < 10s après événement |
| Rapport de revue portefeuille | Email HTML + DB | Admin | Selon fréquence configurée |
| Export CSV décisions | CSV | Download navigateur | < 2s |
| Backup DB | .sql.gz chiffré | Minio local / /backups | 03h00 chaque nuit |
| Ranking PROMETHEE | JSON → tableau UI | Admin | < 500ms recalcul |

### 👥 Personas

| Persona | Rôle | Permissions | Parcours critique |
|---|---|---|---|
| Admin | Gestion complète, décisions | CRUD all + voir scores individuels + décider | Login → Dashboard → Ouvrir projet → Résultats → Décider |
| Évaluateur | Évaluation des projets | Soumettre projets + évaluer (pas son propre) + voir agrégats | Login → Onboarding → Projets → Évaluer → Voir résultats |
| Contributeur financier | Lecture + notification décision | SELECT projets (hors draft) + decisions + repo_url | Login → Dashboard → Décisions → Détail |

### 🛠️ Stack technique

| Catégorie | Outil | Version | Justification |
|---|---|---|---|
| Frontend | Next.js | 15.x (App Router) | SSR natif, Server Actions, streaming — aligné stack Amine |
| UI | shadcn/ui + Tailwind | latest | Composants accessibles, customisables, pas de lock-in |
| Auth | Supabase Auth | latest | Google OAuth natif, RLS intégré, gestion sessions SSR |
| Base de données | Supabase (PostgreSQL) | 16 | RLS, Realtime, Storage — tout-en-un cohérent |
| Stockage fichiers | Supabase Storage | latest | Intégré à l'auth, signed URLs, buckets privés |
| Email transactionnel | Resend + React Email | latest | Templates React typés, deliverability excellente |
| WhatsApp | Evolution API | instance existante | Instance déjà configurée et connectée |
| Graphiques | recharts | latest | Flexible, composable, TypeScript natif |
| Formulaires | react-hook-form + zod | latest | Performances, validation typée |
| Drag & drop | @dnd-kit | latest | Accessible, composable |
| Analytics | PROMETHEE II (lib interne) | — | Implémenté en TypeScript pur dans `lib/analytics/` |
| Hébergement | Coolify | self-hosted | Contrôle total, données on-premise, déjà maîtrisé |
| Backup | pg_dump + Minio/local | — | Récupération disaster en < 15 min |
| Tests E2E | Playwright | latest | Parcours critiques automatisés |

> ⚠️ **Règle absolue :** jamais de clés API, mots de passe, tokens dans le code. Toujours `.env`.
> ⚠️ **Règle absolue :** RLS activé sur TOUTES les tables Supabase sans exception.
> ⚠️ **Règle absolue :** zéro `any` TypeScript sans commentaire justificatif explicite.
> ⚠️ **Règle absolue :** les clés API tierces sont hashées SHA-256 avant stockage — jamais en clair en DB.

### 📋 SOPs

#### SOP-01 : Soumission d'un projet

**Déclencheur :** Membre clique "Soumettre pour évaluation" sur un projet en brouillon  
**Responsable :** Server Action `submitProject`  
**Pré-conditions :** User authentifié, projet status='draft', formulaire valide (Zod)

1. Valider le payload côté serveur (Zod schema `ProjectSubmitSchema`)
2. Vérifier que `proposant_id = auth.uid()` (RLS)
3. Déterminer la vitesse de gouvernance (V1/V2) selon les règles settings
4. UPDATE `projects.status = 'pre-mortem'` si Pre-Mortem activé en settings, sinon `'open'`
5. Si Pre-Mortem activé : notifier tous les évaluateurs (email + WhatsApp si dispo)
6. Si Pre-Mortem désactivé : notifier l'admin du nouveau projet
7. Logger dans `notifications_log`

**Post-conditions :** `projects.status IN ('pre-mortem', 'open')`, notifications envoyées  
**En cas d'échec :** Rollback UPDATE, retourner `{ success: false, error: message }`, toast erreur  
**Logs :** `{ event: 'project_submitted', project_id, proposant_id, status, governance_speed }`

---

#### SOP-02 : Soumission d'une évaluation

**Déclencheur :** Évaluateur clique "Soumettre mon évaluation" après confirmation modale  
**Responsable :** Server Action `submitEvaluation`  
**Pré-conditions :** User authentifié, rôle évaluateur, projet status='open', pas déjà évalué, user != proposant

1. Vérifier RLS : `evaluateur_id != project.proposant_id` — erreur 403 sinon
2. Vérifier unicité : SELECT COUNT(*) FROM evaluations WHERE project_id=X AND evaluateur_id=Y — erreur si > 0
3. Valider payload (Zod `EvaluationSchema`) : scores [0-10], commentary min 50 chars
4. INSERT dans `evaluations`
5. Calculer quorum atteint : comparer nb évaluations soumises vs `projects.quorum_required`
6. Si quorum atteint → UPDATE `projects.status = 'closed'` + notifier tous (évaluateurs + admin)
7. Si quorum non atteint → notifier admin (compteur actuel/requis)

**Post-conditions :** Évaluation en DB, statut projet potentiellement mis à jour  
**En cas d'échec :** Aucun INSERT partiel (transaction), message erreur explicite  
**Logs :** `{ event: 'evaluation_submitted', project_id, evaluateur_id, quorum_reached }`

---

#### SOP-03 : Prise de décision

**Déclencheur :** Admin clique "Confirmer la décision" dans le Dialog de décision  
**Responsable :** Server Action `recordDecision`  
**Pré-conditions :** User rôle admin, projet status='closed' (quorum atteint), décision non encore prise

1. Vérifier rôle admin côté serveur (ne jamais faire confiance au client)
2. Vérifier `project.status = 'closed'`
3. Valider payload : décision IN ('approved','rejected','deferred'), justification min 100 chars
4. Si décision='deferred' : valider `real_option_data` (trigger + date + valeur info — tous requis)
5. INSERT dans `decisions` (table INSERT ONLY — RLS bloque UPDATE/DELETE)
6. UPDATE `projects.status = 'decided'`, `decided_at = NOW()`, `repo_url` si fourni
7. Notifier évaluateurs (email complet + WhatsApp) + contributeurs (email simplifié + lien repo)
8. Si décision='approved' : déclencher création 100-Day Plan (modal ou auto)

**Post-conditions :** Décision immuable en DB, projet status='decided', toutes notifications envoyées  
**En cas d'échec :** Transaction atomique — aucune notification si INSERT échoue  
**Logs :** `{ event: 'decision_recorded', project_id, decision, decided_by, quorum_count }`

---

#### SOP-04 : Envoi de notifications (email + WhatsApp)

**Déclencheur :** Événement déclencheur (soumission, quorum, décision, rappel CRON)  
**Responsable :** `lib/notifications/send.ts` → `sendEmail()` + `sendWhatsApp()`  
**Pré-conditions :** Événement validé, liste destinataires construite, préférences respectées

1. Construire la liste des destinataires selon le type d'événement et les rôles
2. Filtrer selon `profiles.notification_prefs` de chaque destinataire
3. Pour chaque destinataire :
   - Email : envoyer via Resend, logger résultat dans `notifications_log`
   - WhatsApp : si `whatsapp_number` présent, envoyer via Evolution API, logger résultat
4. Si Evolution API down : logger warning, continuer avec email uniquement
5. Retry email x2 si status Resend != 200 (délai 5s)
6. En cas d'échec définitif : logger status='failed' — pas de propagation d'erreur vers l'appelant

**Post-conditions :** Toutes les notifications loggées (succès ou échec)  
**Règle critique :** Les notifications sont TOUJOURS asynchrones — elles ne bloquent jamais la réponse HTTP  
**Logs :** `{ event, recipient_id, channel, status, error? }`

---

#### SOP-05 : CRON — Rappels d'évaluation

**Déclencheur :** `0 9 * * *` via Coolify Scheduler → `GET /api/cron/evaluation-reminders`  
**Responsable :** Route API protégée par `Authorization: Bearer CRON_SECRET`  
**Pré-conditions :** Header Authorization valide, pas de rappel déjà envoyé < 24h à ce destinataire

1. Valider le header `Authorization: Bearer ${CRON_SECRET}`
2. SELECT projets status='open' avec `evaluation_deadline` dans les 48h à venir
3. Pour chaque projet : SELECT évaluateurs n'ayant pas soumis d'évaluation
4. Filtrer : exclure si `notifications_log` contient un rappel < 24h pour ce (project_id, evaluateur_id)
5. Filtrer : exclure si `notification_prefs.evaluation_reminder = false`
6. Envoyer email `EvaluationReminder.tsx` + WhatsApp
7. Retourner `{ processed, sent, skipped }` JSON

**Post-conditions :** Rappels envoyés, loggés  
**En cas d'échec :** Logger l'erreur, retourner HTTP 500 — Coolify Scheduler retentera

---

#### SOP-06 : Backup quotidien de la base de données

**Déclencheur :** `0 3 * * *` via Coolify Scheduler → script `scripts/backup.sh`  
**Responsable :** Script bash, variable `DATABASE_BACKUP_URL`

1. `pg_dump "$DATABASE_BACKUP_URL" | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz`
2. Si `BACKUP_GPG_PASSPHRASE` défini : chiffrer avec `gpg --symmetric --batch --passphrase`
3. Uploader vers Minio bucket `veille-elite-backups` (ou copier vers `/backups`)
4. Supprimer les backups > 30 jours
5. Envoyer email admin : succès (taille fichier, durée) ou échec (stderr)

**Post-conditions :** Fichier backup présent, retention appliquée  
**En cas d'échec :** Email admin avec message d'erreur complet  
**Test trimestriel obligatoire :** Restaurer sur une DB de test, vérifier intégrité

---

#### SOP-07 : Cycle de suivi post-investissement

**Déclencheur :** Décision `approved` enregistrée → CRON automatiques planifiés selon `project.type`  
**Responsable :** Routes `/api/cron/early-checkin`, `/api/cron/aar-trigger`, `/api/cron/outcome-harvesting`

**J+30 — Early Check-In :**
1. CRON calcule les projets approved avec `decided_at` entre J+28 et J+32 (fenêtre 4 jours)
2. Email admin : formulaire 5 champs — ARR actuel, nb users actifs, burn mensuel, runway, blocage principal
3. Résultat sauvegardé dans `project_checkins` (table dédiée)
4. Aucune agrégation — données quantitatives brutes uniquement

**J+100 — AAR (After Action Review) :**
1. CRON détecte projets avec `decided_at + 100j` dans les 48h
2. Notifier tous les évaluateurs originaux : lien vers `/projects/[id]/aar`
3. Formulaire AAR : ce qui s'est passé, écarts vs thèses, apprentissages, note rétrospective 0-10
4. Clore le formulaire après 7 jours ou quand tous les évaluateurs ont répondu
5. Agréger et notifier admin du rapport final

**J+6 mois — Outcome Harvesting :**
1. CRON détecte projets avec `decided_at + 180j` (startup) ou selon le type
2. Notifier admin + fondateur (si email repo_url renseigné) : lien vers `/projects/[id]/outcomes`
3. Formulaire : unit economics, growth rate, pivots majeurs, probabilité de succès mise à jour
4. Alimenter le Batting Average global du portefeuille

**Post-conditions :** Chaque étape loggée, données dans `project_checkins` + `aar_responses` + `outcome_reports`  
**En cas d'échec :** Retry J+2 puis alerte admin si toujours sans réponse après 7 jours  
**Logs :** `{ event: 'post_investment_checkin', project_id, type: 'early|aar|outcome', status }`

---

### ⚠️ Cas limites et gestion d'erreurs

| Situation | Détection | Comportement | Fallback | Log |
|---|---|---|---|---|
| Auto-évaluation tentée | RLS + check Server Action | Erreur 403 + message explicite | Aucun — rejet définitif | `{ error: 'self_evaluation_attempt', user_id, project_id }` |
| Double évaluation | Contrainte UNIQUE DB | Erreur 409 + message "Déjà évalué" | Aucun | `{ error: 'duplicate_evaluation' }` |
| Evolution API down | HTTP timeout 5s | Log warning, email uniquement | Email de fallback | `{ error: 'whatsapp_failed', fallback: 'email' }` |
| Resend rate limit | HTTP 429 | Retry x2 avec backoff 5s | Log status='failed', alerte admin J+1 | `{ error: 'email_rate_limit', retry_count }` |
| Clé API IA invalide | HTTP 401 depuis provider | Message UI "Clé invalide — vérifiez vos paramètres" | Pas de génération IA | `{ error: 'api_key_invalid', provider, user_id }` |
| Serveur Coolify down | Unavailable pour l'utilisateur | — | Backup quotidien disponible — restauration manuelle | Monitoring uptime externe |
| Upload fichier > 10MB | Validation Zod + Supabase Storage | Message UI "Fichier trop lourd (max 10 MB)" | Aucun | Client-side uniquement |
| Token invitation expiré | Vérification `expires_at < NOW()` | Page `/invite/expired` + message explicite | Contacter admin pour nouveau lien | `{ event: 'expired_invite_used', email }` |
| CRON_SECRET invalide | Comparaison timing-safe | HTTP 401, aucune exécution | Aucun | `{ error: 'cron_unauthorized', ip }` |
| Quorum jamais atteint | — | Pas de blocage — admin peut décider manuellement avec confirmation | Décision possible sans quorum (override admin) | `{ event: 'quorum_override', project_id, admin_id }` |
| Décision tentée sans quorum | Check status = 'closed' | Bouton désactivé + message "Quorum non atteint" | Override admin possible avec confirmation explicite | `{ event: 'quorum_override_requested' }` |

---

## Couche 2 — Orchestration

### 🧠 Pipeline principal — Cycle de vie d'un projet

```
1. Soumission (status: draft)
        ↓ auto-save 30s
        ↓ submit → validation Zod
        ↓ (fail) → toast erreur, pas de status change

2. Pre-Mortem (status: pre-mortem) [optionnel selon settings]
        ↓ notification tous évaluateurs
        ↓ délai configurable (default 3j)
        ↓ clôture auto ou manuelle admin
        ↓ (skip admin) → log confirmation explicite

3. Évaluation ouverte (status: open)
        ↓ notification admin
        ↓ évaluateurs soumettent (vote aveugle)
        ↓ chaque vote → check quorum
        ↓ (quorum atteint) → status: closed + notifications
        ↓ (deadline dépassée sans quorum) → rappels CRON + admin alerté

4. Résultats disponibles (status: closed)
        ↓ agrégats visibles de tous
        ↓ scores individuels visibles admin uniquement
        ↓ admin prend décision

5. Décision (status: decided)
        ↓ INSERT immuable dans decisions
        ↓ notifications évaluateurs (détail) + contributeurs (résumé + repo)
        ↓ si approved → 100-Day Plan + jalons J-Curve

6. Suivi post-décision (status: decided → monitoring)
        ↓ J+30 : Early Check-In — premiers signaux (traction, ARR, burn) — email admin
        ↓ J+100 : AAR (aligné fin du 100-Day Plan) — rapport collectif évaluateurs
        ↓ J+6 mois : Outcome Harvesting — bilan intermédiaire (growth, unit economics)
        ↓ J+12 mois : Review annuelle — Batting Average impact

7. Archivage (status: archived) [manuel ou auto après N jours]
        ↓ exclu des vues par défaut
        ↓ toujours consultable via filtre
        ↓ timelines configurables par type de projet (voir "Types de projets & timelines")
```

### 🔄 Règles de décision

- **Si `project.status != 'open'`** : bouton "Évaluer" masqué et route `/evaluate` retourne 403
- **Si `auth.uid() = project.proposant_id`** : évaluation bloquée côté RLS ET Server Action
- **Si `evaluation.evaluateur_id` déjà présent** : INSERT rejeté par contrainte UNIQUE
- **Si PROMETHEE calculé sur < 2 projets avec quorum** : afficher message "Données insuffisantes"
- **Si CR > 0,10 dans AHP** : bloquer la sauvegarde des poids, afficher les paires incohérentes
- **Si backup échoue 3 nuits consécutives** : email critique admin "Backup en échec depuis 3 jours"
- **Avant tout Server Action mutatif** : vérifier session Supabase côté serveur (jamais de confiance client)
- **Avant décision** : vérifier `project.status = 'closed'` ET `auth.role = 'admin'`

### ❓ Quand stopper et demander validation humaine

Claude Code DOIT s'arrêter et poser une question si :
- Le schéma DB doit être modifié (migrations irréversibles)
- Une RLS policy existante doit être altérée
- Un secret ou credential doit être manipulé
- Une US implique de modifier la logique de vote ou d'audit trail
- Un nouveau provider externe (email, WhatsApp, IA) doit être intégré
- Le flux de statut projet doit être modifié
- Plus de 3 fichiers de migration Supabase en attente non testés

### ⏪ Rollback Procedures

| Composant | Méthode de rollback | RTO | Testé |
|---|---|---|---|
| Application Next.js | Coolify → redéployer image précédente (tag Docker) | < 5 min | [ ] |
| Migrations DB | `supabase db reset` sur staging, migration SQL DOWN sur prod | < 15 min | [ ] |
| RLS policies | Script SQL de rollback dans `supabase/migrations/rollback/` | < 5 min | [ ] |
| Backup DB | `pg_restore` depuis fichier Minio le plus récent | < 15 min | [ ] Tester trimestriellement |
| Variables d'env | Coolify → modifier variables + redéployer | < 5 min | [ ] |

---

## Couche 3 — Exécution

### 📁 Structure du projet

```
/veille-elite-platform
├── /app                          → Next.js App Router
│   ├── /(public)                 → Routes publiques
│   │   ├── /login                → Page connexion Google OAuth
│   │   ├── /invite/[token]       → Acceptation invitation
│   │   ├── /access-denied        → Email non invité
│   │   └── /auth/callback        → OAuth callback Supabase
│   ├── /(app)                    → Routes protégées (middleware)
│   │   ├── layout.tsx            → Layout principal + sidebar
│   │   ├── /dashboard            → Dashboard KPIs + scatter
│   │   ├── /projects             → Liste (grille + kanban) + filtres
│   │   │   └── /[id]             → Détail projet (tabs)
│   │   │       ├── /evaluate     → Formulaire évaluation
│   │   │       ├── /results      → Résultats agrégés
│   │   │       ├── /aar          → After Action Review
│   │   │       └── /outcomes     → Outcome Harvesting
│   │   ├── /decisions            → Journal des décisions
│   │   ├── /analytics            → Comparatif admin (9-Box, PROMETHEE)
│   │   ├── /committee-charter    → IC Charter
│   │   └── /settings             → Profil, notifs, clés API
│   │       ├── /notifications
│   │       └── /api-keys
│   ├── /admin                    → Routes admin uniquement
│   │   ├── /members              → Gestion membres
│   │   ├── /invitations          → Gestion invitations
│   │   ├── /theses               → Thèses macro portfolio
│   │   ├── /api-keys             → Clés API globales
│   │   └── /settings             → Paramètres globaux
│   └── /api                      → Routes API (streaming + cron)
│       ├── /ai/improve           → Streaming IA amélioration texte
│       ├── /health               → Health check Coolify
│       └── /cron
│           ├── /evaluation-reminders
│           ├── /portfolio-review
│           ├── /early-checkin          → J+30 signaux quantitatifs (par type projet)
│           ├── /aar-trigger            → J+100 After Action Review
│           └── /outcome-harvesting     → J+6 mois bilan intermédiaire
├── /actions                      → Server Actions (mutations)
│   ├── projects.ts               → submitProject, archiveProject
│   ├── evaluations.ts            → submitEvaluation
│   ├── decisions.ts              → recordDecision
│   ├── invitations.ts            → createInvitation, revokeInvitation
│   ├── members.ts                → updateMemberRole, suspendMember
│   └── settings.ts               → updateSettings
├── /components
│   ├── /ui                       → Composants shadcn/ui re-exportés
│   ├── /charts                   → Wrappers recharts (Scatter, Radar, Bar, Line, Pie)
│   ├── /projects                 → ProjectCard, ProjectForm, EvaluationForm
│   ├── /dashboard                → KPICard, ActivityFeed, Timeline
│   ├── /analytics                → NineBoxMatrix, PrometheeTabel, JCurveChart
│   └── /notifications            → ToastProvider, NotificationBell
├── /lib
│   ├── /supabase
│   │   ├── server.ts             → createServerClient (SSR)
│   │   └── client.ts             → createBrowserClient
│   ├── /notifications
│   │   ├── email.ts              → sendEmail() via Resend
│   │   └── whatsapp.ts           → sendWhatsApp() via Evolution API
│   ├── /analytics
│   │   ├── promethee.ts          → PROMETHEE II implémentation pure TS
│   │   └── ahp.ts                → AHP pairwise + Consistency Ratio
│   ├── /ai
│   │   ├── keys.ts               → getApiKey(userId, provider)
│   │   └── improve.ts            → streamTextImprovement()
│   └── utils.ts                  → Helpers génériques
├── /hooks
│   ├── useAutoSave.ts            → Brouillon toutes les 30s
│   ├── useRealtimeDashboard.ts   → Supabase Realtime channel
│   └── useOnboarding.ts          → État progression onboarding
├── /types
│   ├── database.ts               → Types générés Supabase CLI
│   └── index.ts                  → Types métier custom
├── /emails                       → Templates React Email
│   ├── ProjectSubmitted.tsx
│   ├── EvaluationRequested.tsx
│   ├── EvaluationReminder.tsx
│   ├── QuorumReached.tsx
│   ├── DecisionMade.tsx
│   ├── DecisionMadeContributor.tsx
│   └── Invitation.tsx
├── /scripts
│   └── backup.sh                 → pg_dump + gzip + GPG + upload
├── /supabase
│   ├── /migrations               → SQL versionnés (001_, 002_...)
│   │   └── /rollback             → Scripts SQL de rollback
│   └── /seed
│       └── demo_project.sql      → Projet démo onboarding
├── /tests
│   └── /e2e                      → Specs Playwright
├── middleware.ts                 → Protection routes /app/* + /admin/*
├── .env.example                  → Variables sans valeurs (commité)
├── .env.local                    → Secrets locaux (gitignore)
├── Dockerfile                    → Multi-stage build
├── docker-compose.yml            → Dev local
├── playwright.config.ts
├── CLAUDE.md                     → CE FICHIER
└── README.md
```

### 🔑 Variables d'environnement

| Variable | Description | Requis | Serveur uniquement |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL projet Supabase | Oui | Non |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé anon Supabase | Oui | Non |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service Supabase | Oui | ✅ |
| `RESEND_API_KEY` | Clé API Resend | Oui | ✅ |
| `EVOLUTION_API_URL` | URL instance Evolution API | Oui | ✅ |
| `EVOLUTION_API_KEY` | Clé API Evolution | Oui | ✅ |
| `EVOLUTION_INSTANCE` | Nom instance WhatsApp | Oui | ✅ |
| `NEXT_PUBLIC_APP_URL` | URL publique plateforme | Oui | Non |
| `CRON_SECRET` | Token CRON (≠ service_role_key) | Oui | ✅ |
| `DATABASE_BACKUP_URL` | Connection string pg_dump | Oui | ✅ |
| `BACKUP_GPG_PASSPHRASE` | Passphrase chiffrement backup | Non | ✅ |
| `MAX_MEMBERS` | Limite membres actifs | Non (default: 50) | ✅ |

> ⚠️ `.env.local` dans `.gitignore`. Ne jamais commiter de vraies valeurs.
> ⚠️ `CRON_SECRET` doit être distinct de `SUPABASE_SERVICE_ROLE_KEY`.
> ⚠️ `NEXT_PUBLIC_*` est exposé au client — aucune valeur sensible dans ces variables.

### 💻 Commandes

| Commande | Description |
|---|---|
| `npm run dev` | Dev server local (hot-reload) |
| `npm run build` | Build production Next.js |
| `npm run typecheck` | TypeScript — zéro erreur requis avant commit |
| `npm run lint` | ESLint — zéro warning requis avant commit |
| `npm test` | Tests unitaires (Vitest) |
| `npx playwright test` | Tests E2E (headless) |
| `npx playwright test --headed` | Tests E2E (navigateur visible) |
| `npx playwright test --ui` | Interface interactive Playwright |
| `npm audit` | Audit sécurité dépendances |
| `supabase db diff` | Vérifier migrations en attente |
| `supabase gen types typescript` | Regénérer types DB |
| `docker build -t veille-elite .` | Build image Docker |
| `docker compose up` | Stack complète locale |

---

## Couche 4 — Sécurité

### 🔐 Modèle de menace — STRIDE

| Menace | Vecteur spécifique à ce projet | Probabilité | Impact | Mitigation |
|---|---|---|---|---|
| **Spoofing** | Usurpation d'identité d'un évaluateur pour voter à sa place | Faible | Critique | Google OAuth SSO + RLS uid() côté DB + vérification session serveur à chaque Server Action |
| **Spoofing** | Token invitation forgé pour s'inviter soi-même | Faible | Haut | UUID v4 cryptographiquement sécurisé + expiration 7j + vérification email = Google email |
| **Tampering** | Modification d'un score d'évaluation après soumission | Faible | Critique | Contrainte UNIQUE DB + absence de Server Action UPDATE sur evaluations + RLS INSERT only |
| **Tampering** | Modification d'une décision immuable | Très faible | Critique | RLS decisions = INSERT only, zéro UPDATE/DELETE, aucune route API mutatrice |
| **Repudiation** | Évaluateur nie avoir soumis une évaluation | Faible | Moyen | `submitted_at` non modifiable + audit log `notifications_log` |
| **Information Disclosure** | Évaluateur voit les scores individuels des autres avant quorum | Moyen | Haut | RLS : SELECT sur evaluations filtre `evaluateur_id = auth.uid()` pour non-admins + vue agrégats uniquement via `project_evaluation_stats` |
| **Information Disclosure** | Clé API IA exposée en DB | Faible | Haut | Hash SHA-256 + preview 8 chars — clé en clair jamais stockée ni renvoyée |
| **Information Disclosure** | Contributeur accède aux scores d'évaluation | Moyen | Moyen | RLS role='contributeur' : SELECT restreint à `projects` (status != draft) et `decisions` uniquement |
| **Denial of Service** | Spam de soumissions de projets | Faible | Moyen | Rate limiting sur Server Actions + limite `MAX_MEMBERS` + groupe fermé invitation uniquement |
| **Denial of Service** | Abuse endpoint `/api/ai/improve` | Moyen | Moyen | Rate limiting par user_id (10 req/min) + vérification clé API valide avant streaming |
| **Elevation of Privilege** | Contributeur tente d'accéder à `/admin/*` | Faible | Haut | Middleware Next.js vérifie role='admin' + RLS double vérification en DB |
| **Elevation of Privilege** | Proposant évalue son propre projet | Moyen | Haut | RLS CHECK `proposant_id != auth.uid()` + vérification Server Action |

### ✅ OWASP Top 10 — Checklist projet

**A01 : Broken Access Control**
- [ ] RLS activé sur toutes les tables Supabase (vérification via `supabase inspect db`)
- [ ] Middleware Next.js protège `/app/*` et `/admin/*`
- [ ] Chaque Server Action vérifie le rôle côté serveur (jamais de confiance client)
- [ ] Contributeurs ne peuvent pas accéder aux évaluations ni scores
- [ ] Rate limiting sur les endpoints `/api/*`

**A02 : Cryptographic Failures**
- [ ] TLS enforced par Coolify (certificat SSL configuré)
- [ ] Clés API tierces : hash SHA-256, jamais en clair en DB
- [ ] Tokens invitation : UUID v4 (128 bits entropy)
- [ ] WebSocket Supabase Realtime via `wss://`
- [ ] Backups chiffrés GPG si `BACKUP_GPG_PASSPHRASE` défini

**A03 : Injection**
- [ ] Toutes les requêtes DB via Supabase SDK (requêtes paramétrées) — zéro string SQL concatenée
- [ ] Validation Zod sur tous les inputs formulaires (client + serveur)
- [ ] Fichiers uploadés : vérification MIME type + magic bytes (non trust Content-Type header)
- [ ] CSP header configuré dans `next.config.ts`
- [ ] Output HTML encodé par React (protection XSS par défaut)

**A04 : Insecure Design**
- [ ] Vote aveugle : agrégats seulement exposés aux non-admins (design-level, pas patch)
- [ ] Décisions immuables : INSERT ONLY by design en RLS
- [ ] Groupe fermé : aucune route d'inscription publique
- [ ] Onboarding obligatoire avant accès aux vrais projets

**A05 : Security Misconfiguration**
- [ ] Headers sécurité dans `next.config.ts` : HSTS, X-Frame-Options, X-Content-Type-Options, CSP
- [ ] Messages d'erreur ne révèlent pas de stack trace en production (`NODE_ENV=production`)
- [ ] Supabase : désactiver les providers Auth non utilisés (garder Google uniquement)
- [ ] Coolify : accès admin protégé par mot de passe fort + réseau local uniquement

**A06 : Vulnerable Components**
- [ ] `npm audit` dans pipeline CI — bloque si vulnérabilités critiques/hautes
- [ ] `package-lock.json` commité
- [ ] Revue des dépendances à chaque PR touchant `package.json`

**A07 : Authentication Failures**
- [ ] Google OAuth uniquement — pas de mot de passe local à gérer
- [ ] Session Supabase : JWT expiry 15 min, refresh token 7 jours
- [ ] Logout invalide le refresh token côté Supabase
- [ ] Membres suspendus : bloqués au middleware (vérification `profiles.status`)
- [ ] Email non invité : bloqué post-OAuth (vérification `invitations`)

**A08 : Data Integrity Failures**
- [ ] `package-lock.json` commité et utilisé (`npm ci` dans Dockerfile)
- [ ] Migrations SQL versionnées et testées sur staging avant prod

**A09 : Logging & Monitoring Failures**
- [ ] Tous les événements métier loggés dans `notifications_log`
- [ ] Toutes les actions admin loggées avec user_id + timestamp
- [ ] Échecs de notifications loggés avec status='failed'
- [ ] Health check `/api/health` monitoré en externe

**A10 : SSRF**
- [ ] Endpoints IA (`/api/ai/improve`) : URL provider hardcodée, pas d'URL user-provided
- [ ] Evolution API URL : définie en env server-side uniquement, jamais exposée client
- [ ] Perplexity : requête construite côté serveur — l'utilisateur ne contrôle pas l'URL

### 🇲🇦 CNDP / RGPD — Conformité

Ce projet collecte et traite des données personnelles (email, nom, numéro WhatsApp, votes, commentaires).

- [ ] Responsable du traitement identifié : Amine (admin de la plateforme)
- [ ] Finalité du traitement documentée : évaluation collective de projets d'investissement, groupe fermé
- [ ] Base légale : consentement explicite via acceptation de l'invitation
- [ ] Durée de conservation : profils actifs indéfiniment, profils supprimés sur demande
- [ ] **Droit à l'effacement (RGPD Art. 17) vs immuabilité des décisions :**
  - Les votes/commentaires/Red Teams sont anonymisés (préfixe "Évaluateur X") — le lien evaluateur_id peut être supprimé sans supprimer les données agrégées
  - Les décisions (`decisions`) restent immuables mais sans données personnelles directes
  - Procédure : Server Action `anonymizeMember(userId)` → NULL evaluateur_id dans evaluations + suppression profil → log de l'opération
- [ ] Droit d'accès : export des données personnelles d'un membre sur demande admin
- [ ] Transferts internationaux : Resend (US) → DPA requis ; Evolution API (local) → OK

### 🔑 Gestion des secrets

```
Règle 1 : jamais de secret dans le code, les commentaires, les commits, les logs
Règle 2 : .env.local dans .gitignore — vérifier avec `git status` avant chaque commit
Règle 3 : clés API utilisateurs : hash SHA-256 avant stockage, jamais de lecture inverse
Règle 4 : CRON_SECRET : généré via `openssl rand -hex 32`, distinct de tout autre secret
Règle 5 : rotation des clés : si un secret est commité par erreur → le révoquer immédiatement avant tout push
```

---

## Couche 5 — Tests & Qualité

### 🧪 Stratégie de test

| Niveau | Outil | Couverture cible | Fréquence |
|---|---|---|---|
| Unit | Vitest | > 80% sur `lib/analytics/` (PROMETHEE, AHP, Monte Carlo) | Chaque commit |
| Integration | Vitest + Supabase local | Toutes les Server Actions critiques | Chaque PR |
| E2E | Playwright | Tous les parcours critiques | Avant chaque déploiement |
| Security | `npm audit` | Zéro CVE critique/haute | Chaque PR |

### 🎭 Parcours critiques Playwright

| ID | Parcours | Priorité | Spec file |
|---|---|---|---|
| TC-01 | Login Google OAuth → redirection dashboard | P1 | `tests/e2e/auth/login.spec.ts` |
| TC-02 | Email non invité → page access-denied | P1 | `tests/e2e/auth/access-denied.spec.ts` |
| TC-03 | Onboarding complet (5 étapes) | P1 | `tests/e2e/onboarding/flow.spec.ts` |
| TC-04 | Soumission projet complet (brouillon → soumis) | P1 | `tests/e2e/projects/submit.spec.ts` |
| TC-05 | Auto-save brouillon (coupure connexion simulée) | P2 | `tests/e2e/projects/autosave.spec.ts` |
| TC-06 | Évaluation complète (critères + Red Team + submit) | P1 | `tests/e2e/evaluations/submit.spec.ts` |
| TC-07 | Auto-évaluation bloquée (RLS) | P1 | `tests/e2e/evaluations/self-eval-blocked.spec.ts` |
| TC-08 | Quorum atteint → résultats débloqués | P1 | `tests/e2e/evaluations/quorum.spec.ts` |
| TC-09 | Décision admin (Approuvé + Différé + Rejeté) | P1 | `tests/e2e/decisions/record.spec.ts` |
| TC-10 | Contributeur ne voit pas les scores individuels | P1 | `tests/e2e/rbac/contributor.spec.ts` |
| TC-11 | Admin voit les scores individuels | P1 | `tests/e2e/rbac/admin-scores.spec.ts` |
| TC-12 | Invitation → acceptation → profil créé | P1 | `tests/e2e/auth/invitation.spec.ts` |
| TC-13 | Responsive mobile (375px) — formulaire soumission | P2 | `tests/e2e/responsive/mobile.spec.ts` |
| TC-14 | Dashboard Realtime (nouveau vote → KPI mis à jour) | P2 | `tests/e2e/dashboard/realtime.spec.ts` |
| TC-15 | Amélioration IA texte (streaming) | P2 | `tests/e2e/ai/improve.spec.ts` |
| TC-16 | Export CSV décisions (admin) | P3 | `tests/e2e/analytics/export.spec.ts` |

### 🚦 Pipeline CI/CD

```
Push → npm run typecheck (0 erreur)
      → npm run lint (0 warning)
      → npm audit (0 CVE critique/haute)
      → npm test (Vitest, coverage > 80% lib/analytics/)
      → npm run build (build OK)
      → npx playwright test (tous TC passent)
      → docker build (image construite)
      → Deploy staging Coolify
      → Smoke tests staging (TC-01, TC-04, TC-06, TC-09)
      → Deploy prod Coolify (manuel, approbation Amine)
```

### ✅ Definition of Done

Une US est "done" uniquement quand :
- [ ] Code typecheck `npm run typecheck` → 0 erreur
- [ ] Code lint `npm run lint` → 0 warning
- [ ] Tests Playwright correspondants passent
- [ ] Vérification visuelle dans le navigateur (desktop + mobile 375px)
- [ ] RLS vérifiée pour les tables touchées (test tentative accès non autorisé)
- [ ] Notifications déclenchées vérifiées (email + WhatsApp si applicable)
- [ ] Server Actions retournent `{ success, error?, data? }` sans exception non capturée
- [ ] Aucune erreur console browser en production (`NODE_ENV=production`)

---

## Couche 6 — Observabilité & Audit

### 📊 Logging Strategy

| Type d'événement | Niveau | Rétention | Alerte |
|---|---|---|---|
| Auth success/failure | INFO/WARN | 90 jours | Si 5+ échecs/min même IP |
| Soumission projet | INFO | Permanent (audit trail) | — |
| Évaluation soumise | INFO | Permanent | — |
| Décision enregistrée | INFO | Permanent (immuable) | — |
| Notification envoyée/échouée | INFO/WARN | 180 jours | Si 3+ échecs consécutifs même destinataire |
| Action admin (rôle, suspension) | WARN | 365 jours | Immédiat |
| Tentative auto-évaluation | WARN | 90 jours | — |
| Clé API invalide utilisée | WARN | 90 jours | — |
| CRON_SECRET invalide | CRITICAL | 365 jours | Immédiat |
| Backup échoué | ERROR | 365 jours | Email admin immédiat |
| Backup échoué 3 nuits | CRITICAL | 365 jours | Email admin critique |

Tous les logs métier → table `notifications_log` (Supabase).
Tous les logs applicatifs → `console.error` en prod → Coolify logs.

### 📡 Monitoring

| Métrique | Outil | Seuil | Action |
|---|---|---|---|
| Uptime | UptimeRobot (free) sur `/api/health` | < 99% sur 24h | Notification Amine |
| Latence réponse | Coolify metrics | P95 > 2s | Investiguer requêtes lentes |
| Taux erreur 5xx | Coolify logs | > 1% sur 1h | Investiguer immédiatement |
| Taille DB | Supabase dashboard | > 80% quota | Archiver + contacter Amine |
| Backup size delta | Script backup.sh | > 50% variation | Email admin "Variation inhabituelle" |

### 🔍 Audit Trail

Chaque action mutatrice en DB contient :
- **Qui :** `auth.uid()` + rôle (via RLS context)
- **Quoi :** type d'action + resource_id
- **Quand :** `created_at TIMESTAMPTZ DEFAULT NOW()` (timezone UTC)
- **Résultat :** success implicite (en DB) ou erreur loggée dans `notifications_log`

Tables avec historique immuable :
- `decisions` — INSERT ONLY
- `evaluations` — INSERT ONLY (contrainte UNIQUE, pas de UPDATE)
- `notifications_log` — INSERT ONLY

### ⚡ Performance Budgets

| Métrique | Budget | Outil de mesure |
|---|---|---|
| First Contentful Paint | < 1,5s | Lighthouse CI |
| Largest Contentful Paint | < 2,5s | Lighthouse CI |
| Time to Interactive | < 3,5s | Lighthouse CI |
| API response time P95 | < 500ms | Coolify logs |
| PROMETHEE recalcul | < 500ms | `console.time` en dev |
| Monte Carlo 10 000 itérations | < 100ms | Vitest bench |

### 🩺 Plan de réponse aux incidents

**Niveaux de sévérité :**
- P1 (Critique) : données compromises, service down complet, exploit actif
- P2 (Haut) : feature critique cassée (vote, décision), notifications down
- P3 (Moyen) : dégradation partielle avec workaround
- P4 (Bas) : cosmétique, aucun impact utilisateur

**Timeline :**
- P1 : acknowledger 15 min, mitiger 1h, résoudre 4h → notifier membres si données affectées
- P2 : acknowledger 1h, résoudre 24h
- P3 : résoudre dans les 7 jours
- P4 : résoudre au prochain sprint

**Étapes P1 :**
1. Détecter (UptimeRobot / signalement membre)
2. Isoler (Coolify → arrêter le service si nécessaire)
3. Évaluer l'impact (logs Coolify + Supabase)
4. Restaurer (rollback image Docker OU `pg_restore` depuis backup)
5. Vérifier (smoke tests TC-01, TC-06, TC-09)
6. Communiquer (WhatsApp groupe + email admin)
7. Post-mortem (remplir `docs/incidents/YYYY-MM-DD.md`)

### 📋 Checklist pré-déploiement

**À chaque déploiement production :**

Code :
- [ ] `npm run typecheck` → 0 erreur
- [ ] `npm run lint` → 0 warning
- [ ] `npm audit` → 0 CVE critique/haute
- [ ] `npx playwright test` → tous les TC passent
- [ ] Zéro `console.log` de debug dans le code livré

Sécurité :
- [ ] Aucun secret dans le code (`git grep -r "sk-" --include="*.ts"` → 0 résultat)
- [ ] Variables d'env correctes en staging → vérifier `.env.example` à jour
- [ ] RLS policies vérifiées pour les tables touchées par ce déploiement
- [ ] Headers sécurité présents (`curl -I https://app_url | grep -E "HSTS|CSP|X-Frame"`)

Infrastructure :
- [ ] Migration DB testée sur staging en premier
- [ ] Script de rollback DB documenté
- [ ] Backup de la veille vérifié (fichier présent + non corrompu)
- [ ] UptimeRobot actif sur `/api/health`

Business :
- [ ] Amine a validé les features en staging
- [ ] Membres affectés par la feature informés si besoin
