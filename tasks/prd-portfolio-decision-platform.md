# PRD : Portfolio Decision Platform — Veille Élite

## Overview

Plateforme web dédiée au management de portefeuille de projets pour un groupe fermé (Veille Élite). Remplace Google Sheets par un système structuré intégrant évaluation aveugle, quorum configurable, frameworks C-level, IA générative et notifications multicanal.

**Stack :** Next.js 15 (App Router) + Supabase (Auth, DB, Realtime) + Tailwind CSS + shadcn/ui + TypeScript  
**Hébergement :** Coolify (self-hosted, local — jamais Vercel)  
**Notifications :** Resend (email) + Evolution API (WhatsApp — instance déjà configurée et connectée)

---

## Goals

- Remplacer Google Sheets par une plateforme professionnelle adaptée aux décisions C-level
- Garantir l'intégrité de l'évaluation via vote aveugle jusqu'au quorum
- Offrir une expérience fluide aux évaluateurs non-techniques
- Intégrer l'IA pour améliorer la qualité des soumissions et analyses
- Constituer un historique de décision immuable et auditable

---

## Quality Gates

Ces commandes doivent passer pour chaque user story :

```bash
npm run typecheck   # Zéro erreur TypeScript
npm run lint        # Zéro warning ESLint
npm run build       # Build Next.js sans erreur
```

Pour les stories UI (composants, pages) :
- Vérification visuelle dans le navigateur via dev-browser skill
- Vérifier responsive sur mobile (375px) et desktop (1440px)

---

## User Stories

---

### MODULE 1 — FONDATION & INFRASTRUCTURE

---

### US-001 : Initialisation du projet Next.js

**Description :** En tant que développeur, je veux un projet Next.js 15 configuré avec toutes les dépendances de la stack afin d'avoir une base solide pour toutes les features.

**Acceptance Criteria :**
- [ ] `npx create-next-app@latest` avec App Router, TypeScript, Tailwind
- [ ] shadcn/ui initialisé (`npx shadcn@latest init`)
- [ ] Composants shadcn installés : Button, Card, Dialog, Input, Textarea, Select, Badge, Avatar, Tabs, Table, Sheet, Dropdown, Toast, Skeleton, Slider
- [ ] `@supabase/ssr` et `@supabase/supabase-js` installés
- [ ] `resend` et `@react-email/components` installés pour les emails
- [ ] `recharts` installé pour les graphiques
- [ ] `react-hook-form` et `zod` installés
- [ ] `@dnd-kit/core` et `@dnd-kit/sortable` installés pour le drag & drop
- [ ] Structure de dossiers : `app/`, `components/`, `lib/`, `hooks/`, `types/`, `actions/`, `emails/`
- [ ] Fichier `types/database.ts` généré depuis Supabase CLI
- [ ] Variables d'environnement documentées dans `.env.example`
- [ ] `next.config.ts` configuré (images Supabase autorisées)
- [ ] Fichiers `lib/supabase/server.ts` et `lib/supabase/client.ts` créés

---

### US-002 : Schéma de base de données Supabase

**Description :** En tant que développeur, je veux le schéma SQL complet dans Supabase afin que toutes les tables, relations et politiques RLS soient en place.

**Acceptance Criteria :**
- [ ] Table `profiles` (id, email, full_name, avatar_url, role enum['admin','evaluateur','contributeur'], whatsapp_number, notification_prefs JSONB, status enum['active','suspended'], created_at)
- [ ] Table `projects` (id, title, description, sector, tags TEXT[], proposant_id FK profiles, status enum['draft','open','closed','decided','archived'], quorum_required INT, quorum_type enum['absolute','percentage'], evaluation_deadline TIMESTAMPTZ, decided_at, decision_notes, repo_url TEXT, market_research JSONB, horizon enum['H1','H2','H3'], barbell_category enum['core','growth','moonshot'], investment_thesis JSONB, scenarios JSONB, moic_target FLOAT, thesis_ids UUID[], governance_speed enum['V1','V2'], outcomes JSONB, created_at)
- [ ] Table `project_files` (id, project_id FK, file_url, file_name, file_type, file_size INT, uploaded_by FK)
- [ ] Table `evaluations` (id, project_id FK, evaluateur_id FK profiles, scores JSONB, commentary TEXT, red_team JSONB, submitted_at) — UNIQUE(project_id, evaluateur_id)
- [ ] Table `evaluation_criteria` (id, project_id FK, label, weight FLOAT, description, order_index) — NULL project_id = critères globaux par défaut
- [ ] Table `decisions` (id, project_id FK, made_by FK profiles, decision enum['approved','rejected','deferred'], rationale TEXT, created_at) — INSERT ONLY via RLS
- [ ] Table `notifications_log` (id, recipient_id FK, channel enum['email','whatsapp'], type TEXT, sent_at, status enum['sent','failed','pending'])
- [ ] Table `api_keys` (id, owner_id FK profiles, label, key_hash TEXT, key_preview VARCHAR(8), provider enum['openai','anthropic','perplexity','other'], is_global BOOLEAN DEFAULT false, created_at, last_used_at)
- [ ] Table `invitations` (id, email, token UUID, role, invited_by FK, expires_at, accepted_at)
- [ ] Table `settings` (key TEXT PRIMARY KEY, value JSONB, updated_at, updated_by FK)
- [ ] Table `portfolio_theses` (id, title, description, horizon enum['H1','H2','H3'], status enum['active','archived'], created_by FK profiles, created_at)
- [ ] Table `project_milestones` (id, project_id FK, label TEXT, target_date TIMESTAMPTZ, actual_date TIMESTAMPTZ, value_delta FLOAT, notes TEXT, status enum['pending','achieved','missed'], created_at)
- [ ] Table `aar_responses` (id, project_id FK, filled_by FK profiles, responses JSONB, created_at)
- [ ] Table `project_premortems` (id, project_id FK, responses JSONB, aggregation JSONB, closed_at TIMESTAMPTZ)
- [ ] Colonne `decisions.real_option_data JSONB` pour les décisions de type Différé
- [ ] Colonne `evaluation_criteria.weight_method enum['manual','ahp']` + `ahp_matrix JSONB` pour stocker la matrice de comparaison
- [ ] Colonne `projects.status` : ajouter 'pre-mortem' dans l'enum ['draft','pre-mortem','open','closed','decided','archived']
- [ ] RLS activé sur TOUTES les tables
- [ ] Policy : evaluateur ne voit PAS les scores individuels des autres (vue agrégats seulement)
- [ ] Policy : proposant ne peut pas évaluer son propre projet (CHECK project.proposant_id != auth.uid())
- [ ] Policy : contributeur = SELECT uniquement sur projects (status != 'draft') et decisions
- [ ] Policy : decisions = INSERT uniquement, pas de UPDATE ni DELETE pour personne
- [ ] Policy : api_keys = SELECT/INSERT/DELETE owner uniquement + admin voit tout
- [ ] Indexes sur project_id, evaluateur_id, status, created_at, evaluation_deadline
- [ ] Vue `project_evaluation_stats` : score moyen, nb évaluations, quorum_reached BOOLEAN
- [ ] Migration SQL dans `supabase/migrations/001_initial_schema.sql`

---

### US-003 : Authentification Google OAuth

**Description :** En tant qu'utilisateur invité, je veux me connecter via Google afin d'accéder à la plateforme sans créer un nouveau mot de passe.

**Acceptance Criteria :**
- [ ] Google OAuth configuré dans Supabase Auth Dashboard
- [ ] Page `/login` avec bouton "Continuer avec Google" (shadcn Button + icône Google SVG)
- [ ] Middleware Next.js `middleware.ts` protège toutes les routes `/app/*` — redirige vers `/login` si non authentifié
- [ ] Après OAuth, vérification que l'email existe dans `invitations` avec `accepted_at IS NULL`
- [ ] Si email non invité → redirection vers `/access-denied` avec message explicite
- [ ] Si premier login valide → création du profil dans `profiles` avec le rôle de l'invitation + `invitations.accepted_at = NOW()`
- [ ] Route `/auth/callback` gère l'échange de code OAuth (`exchangeCodeForSession`)
- [ ] Session persistante via cookies SSR Supabase (`createServerClient`)
- [ ] Profil suspendu → redirection vers `/suspended` avec message

---

### US-004 : Layout principal et navigation

**Description :** En tant qu'utilisateur connecté, je veux une interface de navigation claire afin de me repérer facilement dans la plateforme.

**Acceptance Criteria :**
- [ ] Layout `app/(app)/layout.tsx` avec sidebar gauche fixe sur desktop (240px), bottom nav sur mobile
- [ ] Sidebar : logo Veille Élite, liens selon rôle :
  - Tous : Dashboard, Projets, Décisions
  - Évaluateur/Admin : Évaluations
  - Admin : Analytics, Administration (sous-menu : Membres, Invitations, Paramètres)
- [ ] Header : avatar utilisateur + nom + badge rôle (coloré par rôle) + bouton déconnexion
- [ ] Route active surlignée dans la nav
- [ ] Skeleton loading (shadcn Skeleton) pendant chargement des données
- [ ] Provider Toast (Sonner) disponible globalement
- [ ] Page `/access-denied`, `/suspended`, et 404 personnalisées avec CTA retour
- [ ] Theme sombre par défaut : bg-gray-950, sidebar bg-gray-900, texte gray-100

---

### MODULE 2 — GESTION DES PROJETS

---

### US-005 : Formulaire de soumission de projet

**Description :** En tant que membre, je veux soumettre un projet via un formulaire riche afin que toutes les informations nécessaires à l'évaluation soient capturées.

**Acceptance Criteria :**
- [ ] Route `/app/projects/new` avec stepper 5 étapes (barre de progression en haut)
- [ ] Étape 1 — Identité : Titre (required), Secteur (select), Tags (multi-input)
- [ ] Étape 2 — Problème & Solution : Problème (textarea), Solution proposée (textarea), Proposition de valeur (textarea)
- [ ] Étape 3 — Financier : Investissement requis (number + devise EUR/USD/MAD), ROI estimé (%), Horizon (select : 6m / 1a / 2a / 3a+)
- [ ] Étape 4 — Risques & Hypothèses : Risques principaux (textarea), Hypothèses clés (textarea)
- [ ] Étape 5 — Documents & Deadline : Upload fichiers (PDF/XLSX/PPTX — max 10 MB/fichier, 5 fichiers max → Supabase Storage), Date limite d'évaluation souhaitée (date picker)
- [ ] Sauvegarde automatique brouillon toutes les 30s (debounce, status='draft')
- [ ] Validation client avec `react-hook-form` + `zod`
- [ ] Bouton "Soumettre pour évaluation" → Server Action `submitProject` → status='open', notification admin
- [ ] Proposant ne peut plus modifier après soumission (champs désactivés si status != 'draft')
- [ ] Fichiers stockés dans bucket privé `project-files`, accès via signed URLs (1h)

---

### US-006 : Assistance IA dans les champs texte

**Description :** En tant que membre soumettant un projet, je veux une aide IA pour améliorer mes textes afin que mes soumissions soient plus précises et convaincantes.

**Acceptance Criteria :**
- [ ] Bouton "✨ Améliorer" apparu sous chaque textarea du formulaire au focus
- [ ] Clic → Dialog avec : texte original (gauche), texte amélioré streamé (droite)
- [ ] Streaming SSE via route `/api/ai/improve` (Response stream)
- [ ] Provider utilisé : Anthropic claude-sonnet-4-6 (clé depuis `api_keys` user OU clé globale admin)
- [ ] Prompt système : "Tu es un analyste C-level. Améliore ce texte pour le rendre plus précis, structuré et convaincant. Ne rajoute aucune information fictive. Conserve le sens exact."
- [ ] Bouton "Utiliser ce texte" remplace le champ (react-hook-form setValue)
- [ ] Si aucune clé disponible → message "Configurez une clé IA dans Paramètres > Clés API" avec lien
- [ ] Spinner pendant génération, gestion erreurs (rate limit → message explicite)

---

### US-007 : Liste et détail des projets

**Description :** En tant que membre, je veux voir tous les projets avec leur statut afin de savoir sur quoi évaluer.

**Acceptance Criteria :**
- [ ] Route `/app/projects` — grille de cards
- [ ] Card : titre, secteur badge, statut badge coloré, proposant avatar + nom, date soumission, progression quorum (barre X/Y), deadline (rouge si < 48h)
- [ ] Filtre par status (Tous / Ouvert / Clôturé / Décidé / Archivé) et secteur — persisté en URL params
- [ ] Tri par : date soumission, deadline, score moyen (admin uniquement)
- [ ] Contributeurs ne voient pas les projets status='draft'
- [ ] Page `/app/projects/[id]` avec tabs :
  - "Présentation" : contenu complet du formulaire, fichiers téléchargeables
  - "Évaluation" : visible si status='open' ET user != proposant ET pas encore évalué
  - "Résultats" : visible si quorum atteint OU user=admin
  - "Intelligence" : recherche Perplexity + résultats sauvegardés
- [ ] Badge "Déjà évalué ✓" si user a soumis
- [ ] Badge "Quorum atteint" si seuil dépassé
- [ ] Projets archivés : badge "Archivé" + bannière grise + lecture seule pour tous

---

### MODULE 3 — SYSTÈME D'ÉVALUATION

---

### US-008 : Formulaire d'évaluation par critères

**Description :** En tant qu'évaluateur, je veux noter un projet sur des critères pondérés afin de contribuer à une décision collective éclairée.

**Acceptance Criteria :**
- [ ] Route `/app/projects/[id]/evaluate`
- [ ] Critères chargés depuis `evaluation_criteria` (project_id = ce projet OU critères globaux si aucun custom)
- [ ] Critères par défaut : Pertinence stratégique (25%), Viabilité financière (25%), Faisabilité opérationnelle (20%), Impact risque (15%), Innovation différenciante (15%)
- [ ] Chaque critère : slider 0–10 (shadcn Slider) + description du critère + textarea commentaire optionnel
- [ ] Score pondéré global calculé en temps réel en bas de page (ex: "Score : 7,4 / 10")
- [ ] Champ "Commentaire global" (textarea, requis, min 50 caractères, compteur live)
- [ ] Modal confirmation avant soumission : "Cette évaluation est définitive et ne pourra pas être modifiée."
- [ ] Server Action `submitEvaluation` → INSERT dans `evaluations`
- [ ] RLS bloque si user = proposant → erreur "Vous ne pouvez pas évaluer votre propre projet"
- [ ] RLS bloque si déjà évalué → erreur "Vous avez déjà soumis une évaluation"
- [ ] Après soumission : vérification quorum → si atteint, déclencher notifications quorum

---

### US-009 : Résultats agrégés et quorum

**Description :** En tant qu'évaluateur, je veux voir les résultats agrégés une fois le quorum atteint afin de comprendre le consensus du groupe.

**Acceptance Criteria :**
- [ ] Route `/app/projects/[id]/results`
- [ ] Si quorum non atteint ET user != admin → message avec progression "X / Y évaluations reçues" + ETA si deadline définie
- [ ] Si quorum atteint OU admin → afficher :
  - Gauge circulaire : score moyen global (recharts RadialBarChart)
  - Radar chart : score moyen par critère (recharts RadarChart)
  - Histogramme distribution des scores globaux (recharts BarChart)
  - "N évaluateurs ont participé" (jamais leurs noms pour non-admins)
  - Commentaires anonymisés : "Évaluateur A : ...", "Évaluateur B : ..."
- [ ] Admin voit EN PLUS : tableau détaillé (nom évaluateur, scores par critère, commentaire, date)
- [ ] Bouton "Prendre la décision" visible admin + quorum atteint (→ US-011)

---

### US-010 : Critères personnalisés par projet

**Description :** En tant qu'admin, je veux configurer les critères d'évaluation par projet afin d'adapter la grille aux spécificités de chaque projet.

**Acceptance Criteria :**
- [ ] Section "Critères d'évaluation" dans `/app/admin/projects/[id]/criteria`
- [ ] CRUD : ajouter critère (label + poids + description), modifier, supprimer, réordonner (@dnd-kit drag & drop)
- [ ] Validation : somme des poids = 100% exactement, indicateur visuel coloré (vert OK / rouge KO)
- [ ] Modification uniquement si aucune évaluation encore soumise (sinon champs disabled + message)
- [ ] Bouton "Réinitialiser aux critères par défaut" avec confirmation
- [ ] Critères immuables dès le premier vote soumis (trigger DB ou CHECK côté Server Action)

---

### MODULE 4 — DÉCISIONS & HISTORIQUE

---

### US-011 : Prise de décision admin

**Description :** En tant qu'admin, je veux enregistrer la décision finale sur un projet afin de clore le processus avec une trace immuable.

**Acceptance Criteria :**
- [ ] Bouton "Prendre la décision" dans `/app/projects/[id]/results` — visible admin uniquement, activé si quorum atteint
- [ ] Dialog de décision :
  - RadioGroup : Approuvé / Rejeté / Différé (avec couleurs distinctes)
  - Textarea justification (requis, min 100 caractères, compteur live)
  - Champ optionnel URL dépôt/repo (lien GitHub, Drive, Notion...)
  - Checklist frameworks C-level consultés (non obligatoire, mémorielle)
- [ ] Confirmation : "Cette décision sera enregistrée de façon permanente et ne pourra pas être modifiée."
- [ ] Server Action `recordDecision` :
  - INSERT dans `decisions`
  - UPDATE `projects.status = 'decided'`, `decided_at = NOW()`, `repo_url = ...`
  - Déclencher notifications : email + WhatsApp → tous membres évaluateurs (détail complet) + contributeurs (notification simplifiée avec lien repo si fourni)

---

### US-012 : Journal des décisions

**Description :** En tant que membre, je veux consulter l'historique de toutes les décisions prises afin d'apprendre des décisions passées.

**Acceptance Criteria :**
- [ ] Route `/app/decisions` — tableau chronologique (ordre décroissant)
- [ ] Colonnes : Date, Projet (cliquable), Secteur, Décision (badge coloré : vert/rouge/orange), Score agrégé, Décideur (admin)
- [ ] Filtre par décision et période (date range picker)
- [ ] Clic ligne → Sheet latéral : justification complète, frameworks cités, lien repo si disponible, lien vers projet complet
- [ ] Export CSV des décisions (admin uniquement) → Server Action `exportDecisionsCSV`
- [ ] Contributeurs voient le journal complet (avec lien repo si fourni)

---

### US-013 : Archivage des projets décidés

**Description :** En tant qu'admin, je veux archiver les anciens projets décidés afin de garder le tableau de bord focalisé sur l'actif sans perdre l'historique.

**Acceptance Criteria :**
- [ ] Bouton "Archiver" dans la page d'un projet (status='decided', admin uniquement)
- [ ] Confirmation : "Ce projet sera archivé. Il restera consultable mais n'apparaîtra plus dans les vues par défaut."
- [ ] Server Action `archiveProject` → UPDATE status='archived'
- [ ] Projets archivés : exclus par défaut des listes et du dashboard
- [ ] Filtre "Archivés" dans `/app/projects` permet de les retrouver
- [ ] Page projet archivé : bannière "Archivé le [date]" + tout en lecture seule
- [ ] Job CRON optionnel : archivage automatique des projets décidés depuis > 180 jours (configurable dans settings)

---

### MODULE 5 — TABLEAU DE BORD

---

### US-014 : Dashboard principal

**Description :** En tant que membre, je veux un tableau de bord synthétique afin de voir l'état du portefeuille en un coup d'œil.

**Acceptance Criteria :**
- [ ] Route `/app/dashboard` — page d'accueil post-login
- [ ] KPI cards (4) : Projets ouverts / À évaluer (ce user) / Décisions ce mois / Score moyen portfolio
- [ ] Scatter plot "ROI estimé vs Score d'évaluation" (recharts ScatterChart) — un point par projet, coloré par statut, tooltip au survol avec titre + détails
- [ ] Tableau "Mes évaluations en attente" : titre projet, deadline (badge rouge si < 48h), bouton "Évaluer →"
- [ ] Timeline activité récente (10 derniers événements) : icône par type, date relative, lien
- [ ] Données en temps réel via Supabase Realtime (channel `portfolio-updates`)
- [ ] Contributeurs : KPI cards simplifiées (Projets actifs / Décisions) + scatter (sans scores détaillés)

---

### US-015 : Analyse comparative des projets

**Description :** En tant qu'admin, je veux comparer plusieurs projets visuellement afin de prioriser l'allocation du capital.

**Acceptance Criteria :**
- [ ] Route `/app/analytics` (admin uniquement)
- [ ] Radar chart comparatif : multi-select jusqu'à 4 projets, superposition des profils par critère
- [ ] Matrice 2×2 : axes X/Y configurables parmi (Score global, ROI estimé, Investissement, Risque)
- [ ] Tableau ranking : projets triés par score pondéré décroissant, delta vs seuil configurable
- [ ] Mise en évidence Pareto-frontière sur le scatter (projets Pareto-optimaux bordure dorée)
- [ ] Filtres : secteur, horizon, range investissement (Slider double)
- [ ] Tous les graphiques : recharts responsive, export PNG via `html-to-image`

---

### MODULE 6 — NOTIFICATIONS

---

### US-016 : Infrastructure de notifications email

**Description :** En tant que système, je veux envoyer des emails transactionnels via Resend afin d'informer les membres des événements importants.

**Acceptance Criteria :**
- [ ] Resend configuré dans `lib/notifications/email.ts` avec `RESEND_API_KEY` env
- [ ] Templates React Email dans `emails/` :
  - `ProjectSubmitted.tsx` → admin
  - `EvaluationRequested.tsx` → évaluateurs (avec deadline)
  - `EvaluationReminder.tsx` → évaluateurs non ayant voté (cron)
  - `QuorumReached.tsx` → admin + évaluateurs
  - `DecisionMade.tsx` → évaluateurs (détail complet)
  - `DecisionMadeContributor.tsx` → contributeurs (résumé + lien repo optionnel)
  - `Invitation.tsx` → invités
- [ ] Chaque template : header Veille Élite, CTA bouton, footer avec lien plateforme
- [ ] Log dans `notifications_log` à chaque envoi (success ou failure)
- [ ] Retry x2 si échec Resend (délai 5s entre tentatives)
- [ ] Respect des préférences `notification_prefs` du profil avant envoi

---

### US-017 : Notifications WhatsApp via Evolution API

**Description :** En tant que membre avec numéro WhatsApp, je veux recevoir des notifications WhatsApp afin d'être alerté en temps réel.

**Acceptance Criteria :**
- [ ] Fonction `sendWhatsApp(phone: string, message: string)` dans `lib/notifications/whatsapp.ts`
- [ ] Utilise `EVOLUTION_API_URL` + `EVOLUTION_API_KEY` + `EVOLUTION_INSTANCE` depuis env
- [ ] Appel REST POST `{EVOLUTION_API_URL}/message/sendText/{EVOLUTION_INSTANCE}`
- [ ] Format message WhatsApp : texte structuré avec emojis + URL courte vers le projet
- [ ] Déclenchements :
  - Nouveau projet soumis → admin
  - Nouveau vote reçu → admin (avec compteur actuel/quorum)
  - Quorum atteint → admin + tous évaluateurs
  - Décision prise → tous évaluateurs (détail) + contributeurs (résumé + repo si fourni)
- [ ] Si Evolution API down → log warning + fallback email uniquement
- [ ] Si numéro WhatsApp absent dans profil → email uniquement
- [ ] Respect des préférences `notification_prefs`

---

### US-018 : Centre de préférences de notifications

**Description :** En tant que membre, je veux configurer mes préférences de notification afin de ne pas être spammé.

**Acceptance Criteria :**
- [ ] Page `/app/settings/notifications`
- [ ] Tableau de bascules : événement × canal (email / WhatsApp)
  - Nouveau projet soumis / Rappel évaluation / Quorum atteint / Décision prise
- [ ] Préférences stockées dans `profiles.notification_prefs JSONB`
- [ ] Champ numéro WhatsApp (format international +212...) avec validation regex `^\+[1-9]\d{7,14}$`
- [ ] Bouton "Tester WhatsApp" → envoie message de test immédiat
- [ ] Sauvegarde auto (debounce 800ms) avec toast "Préférences sauvegardées"

---

### US-019 : CRON de rappels d'évaluation

**Description :** En tant que système, je veux envoyer des rappels automatiques aux évaluateurs n'ayant pas encore voté avant la deadline afin de maximiser la participation.

**Acceptance Criteria :**
- [ ] Route API `/api/cron/evaluation-reminders` protégée par header `Authorization: Bearer CRON_SECRET`
- [ ] Logique : SELECT projets status='open' avec deadline dans les prochaines 48h + évaluateurs n'ayant pas soumis
- [ ] Envoi email `EvaluationReminder.tsx` + WhatsApp à chaque évaluateur concerné
- [ ] Log dans `notifications_log` type='reminder'
- [ ] Ne pas envoyer si évaluateur a désactivé les rappels dans ses préférences
- [ ] Pas de double envoi : vérifier `notifications_log` pour éviter rappel déjà envoyé < 24h
- [ ] Configuration Coolify Scheduler (cron) : `0 9 * * *` (9h00 chaque jour)
- [ ] Endpoint health check : retourne JSON `{ processed: N, sent: N, skipped: N }`

---

### MODULE 7 — INTÉGRATIONS IA

---

### US-020 : Gestion des clés API

**Description :** En tant qu'utilisateur, je veux gérer mes clés API IA de façon sécurisée afin d'utiliser mes propres crédits sans exposer mes clés.

**Acceptance Criteria :**
- [ ] Page `/app/settings/api-keys`
- [ ] Formulaire : label (requis), provider (select : OpenAI / Anthropic / Perplexity / Autre), clé (input type=password, requis)
- [ ] Server Action `saveApiKey` :
  - Hash SHA-256 de la clé → `key_hash`
  - Stocker 8 premiers chars → `key_preview`
  - La clé complète n'est JAMAIS persistée ni renvoyée
- [ ] Affichage : label + provider icon + `sk-ant-••••••••` + date création + dernière utilisation
- [ ] Bouton "Tester" → appel minimal à l'API (ex: liste modèles) → toast OK/KO
- [ ] Bouton "Supprimer" avec Dialog confirmation
- [ ] Admin : page `/app/admin/api-keys` voit toutes les clés + clés globales (is_global=true) utilisées en fallback
- [ ] Fonction `getApiKey(userId, provider)` dans `lib/ai/keys.ts` : clé user en priorité, sinon clé globale admin, sinon null

---

### US-021 : Recherche Perplexity pour analyse marché

**Description :** En tant que membre évaluant un projet, je veux lancer une recherche Perplexity afin d'enrichir mon analyse avec des données de marché récentes.

**Acceptance Criteria :**
- [ ] Tab "Intelligence" dans `/app/projects/[id]`
- [ ] Bouton "🔍 Analyser le marché" → déclenche recherche
- [ ] Requête auto-construite : `"{titre}" {secteur} marché taille concurrence tendances 2025`
- [ ] Panel résultats : réponse streamée + sources avec liens cliquables
- [ ] Bouton "Sauvegarder cette analyse" → Server Action `saveMarketResearch` → UPDATE `projects.market_research`
- [ ] Si analyse déjà sauvegardée → l'afficher par défaut avec date + bouton "Relancer"
- [ ] Utilise clé Perplexity user OU clé admin globale
- [ ] Si aucune clé → message "Ajoutez une clé Perplexity dans Paramètres > Clés API" avec lien

---

### MODULE 8 — ADMINISTRATION

---

### US-022 : Gestion des invitations

**Description :** En tant qu'admin, je veux inviter des membres par email avec un rôle défini afin de contrôler qui accède à la plateforme.

**Acceptance Criteria :**
- [ ] Page `/app/admin/invitations`
- [ ] Formulaire : email (requis, validation format), rôle (select : Évaluateur / Contributeur financier), message optionnel
- [ ] Server Action `createInvitation` → génère token UUID → INSERT invitations (expire 7j) → email `Invitation.tsx`
- [ ] Page publique `/invite/[token]` : vérifie token valide + non expiré + non utilisé → bouton "Rejoindre avec Google"
- [ ] Si token invalide/expiré → message explicite + lien contact admin
- [ ] Liste invitations : email, rôle badge, statut (En attente / Acceptée / Expirée), date envoi
- [ ] Actions : "Renvoyer" (nouveau token, reset expiration) + "Révoquer" (DELETE)
- [ ] Limite configurable dans settings `MAX_MEMBERS` (default: 50)

---

### US-023 : Gestion des membres

**Description :** En tant qu'admin, je veux gérer les membres actifs afin de maintenir l'intégrité du groupe.

**Acceptance Criteria :**
- [ ] Page `/app/admin/members`
- [ ] Tableau : avatar, nom, email, rôle (select inline modifiable), nb évaluations, date inscription, statut badge
- [ ] Modifier rôle → Server Action `updateMemberRole` → log dans notifications_log type='admin_action'
- [ ] Suspendre → Dialog confirmation → UPDATE status='suspended' → log
- [ ] Réactiver → UPDATE status='active' → log
- [ ] Guard : impossible de suspendre ou rétrograder le dernier admin actif
- [ ] Filtre : Actifs / Suspendus / Par rôle

---

### US-024 : Paramètres globaux de la plateforme

**Description :** En tant qu'admin, je veux configurer les paramètres globaux afin d'adapter la plateforme aux besoins du groupe.

**Acceptance Criteria :**
- [ ] Page `/app/admin/settings` avec sections :
  - **Général** : nom plateforme, logo (upload → Storage), URL publique
  - **Évaluation** : quorum par défaut (type + valeur), critères par défaut (CRUD avec drag & drop — même UI que US-010)
  - **Délais** : délai par défaut pour reminders (ex: 48h avant deadline), auto-archivage après N jours (0 = désactivé)
  - **Notifications** : activation email ON/OFF, activation WhatsApp ON/OFF, URL Evolution API + instance + test connexion
  - **Clés API globales** : Anthropic / OpenAI / Perplexity admin (fallback si user sans clé)
- [ ] Toutes valeurs persistées dans table `settings` (key TEXT, value JSONB)
- [ ] Changements effectifs immédiatement (Server Action `updateSettings`)

---

### MODULE 9 — DÉPLOIEMENT

---

### US-025 : Configuration Coolify et Dockerfile

**Description :** En tant que développeur, je veux un Dockerfile optimisé et une configuration de déploiement Coolify afin de déployer sur le serveur self-hosted.

**Acceptance Criteria :**
- [ ] `Dockerfile` multi-stage (builder → runner) basé sur `node:20-alpine`
- [ ] Stage builder : `npm ci`, `npm run build`
- [ ] Stage runner : copie `.next/standalone` + `.next/static` + `public/`
- [ ] `.dockerignore` : node_modules, .next/cache, .env*, *.md
- [ ] `docker-compose.yml` pour développement local avec hot-reload et variables d'env
- [ ] `.env.example` complet documenté :
  ```
  NEXT_PUBLIC_SUPABASE_URL=
  NEXT_PUBLIC_SUPABASE_ANON_KEY=
  SUPABASE_SERVICE_ROLE_KEY=
  RESEND_API_KEY=
  EVOLUTION_API_URL=
  EVOLUTION_API_KEY=
  EVOLUTION_INSTANCE=
  NEXT_PUBLIC_APP_URL=
  CRON_SECRET=
  MAX_MEMBERS=50
  ```
- [ ] Endpoint `/api/health` → `{ status: 'ok', version, timestamp }` HTTP 200
- [ ] `README.md` section "Deploy on Coolify" : étapes Git source → New Application → Variables d'env → Deploy
- [ ] Build Docker validé localement (`docker build -t veille-elite .`)

---

### MODULE 10 — FRAMEWORKS STRATÉGIQUES C-LEVEL

---

### US-026 : Three Horizons + Barbell — Catégorisation stratégique des projets

**Description :** En tant que membre soumettant un projet, je veux indiquer son horizon stratégique et son profil risque/potentiel afin que le comité dispose du contexte stratégique pour sa décision.

**Acceptance Criteria :**
- [ ] Dans l'Étape 1 du formulaire (US-005), ajouter deux champs obligatoires :
  - "Horizon stratégique" : radio H1 (cœur de métier, 0–2 ans) / H2 (émergence, 2–5 ans) / H3 (option future, 5+ ans) avec description de chaque horizon au survol
  - "Profil risque/potentiel" : radio Cœur (faible risque, rendement stable) / Croissance (risque modéré, fort potentiel) / Moonshot (risque élevé, rupture potentielle)
- [ ] Colonne `horizon enum['H1','H2','H3']` et `barbell_category enum['core','growth','moonshot']` dans table `projects`
- [ ] Badge H1/H2/H3 + badge Cœur/Croissance/Moonshot (colorés distinctement) affichés sur les cards projet et la page détail
- [ ] Filtres par horizon et par catégorie dans `/app/projects`
- [ ] Dashboard : répartition du portefeuille par horizon (donut chart) et par catégorie (donut chart)
- [ ] Analytics : filtrer le scatter plot et la matrice par horizon/catégorie

---

### US-027 : Monte Carlo — Simulateur de scénarios ROI

**Description :** En tant que membre soumettant un projet, je veux saisir trois scénarios financiers afin que le comité dispose d'une distribution de probabilité du retour sur investissement.

**Acceptance Criteria :**
- [ ] Dans l'Étape 3 du formulaire (Financier), remplacer le champ "ROI estimé" unique par :
  - Scénario Pessimiste : ROI (%) + Probabilité (%)
  - Scénario Réaliste : ROI (%) + Probabilité (%)
  - Scénario Optimiste : ROI (%) + Probabilité (%)
  - Validation : somme des probabilités = 100% (indicateur live)
- [ ] Champ `scenarios JSONB` dans table `projects` : `{ pessimiste: { roi, prob }, realiste: { roi, prob }, optimiste: { roi, prob } }`
- [ ] Calcul automatique : ROI pondéré = Σ(roi × prob/100) affiché en temps réel sous les champs
- [ ] Mini-graphique barre horizontale (pessimiste → réaliste → optimiste) affiché sous les inputs
- [ ] Ajout champ `moic_target FLOAT` : Multiple cible (ex: 3.5x) optionnel
- [ ] Page détail projet : affiche les 3 scénarios avec leurs probabilités + ROI pondéré + MOIC cible
- [ ] Analytics : scatter plot utilise le ROI pondéré comme axe X (pas le ROI unique)
- [ ] Compatibilité descendante : projets sans scénarios affichent simplement le ROI estimé legacy

---

### US-028 : Investment Thesis — Thèse d'investissement par projet

**Description :** En tant que membre soumettant un projet, je veux formaliser une thèse d'investissement avec des hypothèses vérifiables afin que la décision soit liée à des critères objectifs de succès.

**Acceptance Criteria :**
- [ ] Dans l'Étape 4 du formulaire (Risques & Hypothèses), ajouter une section "Thèse d'investissement" :
  - Énoncé de la thèse (textarea, requis, max 200 caractères) : "Ce projet crée de la valeur parce que..."
  - 3 hypothèses vérifiables (3 lignes dynamiques) : hypothèse + indicateur de validation + horizon de vérification (date)
- [ ] Colonne `investment_thesis JSONB` dans table `projects` : `{ statement, hypotheses: [{text, indicator, deadline}] }`
- [ ] Page détail projet : section "Thèse d'investissement" affichée en bonne place avant l'évaluation
- [ ] Page décision (US-011) : thèse affichée en référence au moment de la décision
- [ ] Suivi des hypothèses : dans la page projet post-décision, chaque hypothèse affiche un statut (En attente / Validée / Invalidée) modifiable par l'admin
- [ ] Notifications automatiques à l'approche des deadlines d'hypothèses (7j avant → email admin)

---

### US-029 : Red Team — Contre-argumentation structurée dans l'évaluation

**Description :** En tant qu'évaluateur, je veux formaliser les arguments contre le projet afin de contrebalancer l'optimisme naturel des porteurs de projet.

**Acceptance Criteria :**
- [ ] Dans le formulaire d'évaluation (US-008), ajouter un onglet/section "Red Team" après les critères :
  - Champ "Pourquoi ce projet pourrait échouer" (textarea, requis, min 30 caractères)
  - Champ "Hypothèse la plus fragile" (textarea, optionnel)
  - Champ "Ce que le porteur n'a probablement pas vu" (textarea, optionnel)
- [ ] Colonne `red_team JSONB` dans table `evaluations` : `{ failure_reasons, fragile_hypothesis, blind_spots }`
- [ ] Vue résultats (US-009) : onglet "Red Team" distinct des scores — arguments agrégés anonymisés
- [ ] Admin : voir les red teams individuelles (non anonymisées) dans le tableau détaillé
- [ ] Ces champs sont exclus du calcul du score pondéré — ils sont qualitatifs uniquement

---

### US-030 : Reference Class Forecasting — Benchmark automatique depuis l'historique

**Description :** En tant que membre évaluant un projet, je veux voir des statistiques historiques sur les projets similaires afin de calibrer mon évaluation sur des données réelles.

**Acceptance Criteria :**
- [ ] Dans la page détail projet (tab "Intelligence"), section "Référence historique" :
  - Requête automatique : projets décidés dans le même secteur ET même horizon
  - Afficher : nb de projets similaires, score médian, taux d'approbation (%), ROI pondéré médian
  - Si < 3 projets similaires → "Données insuffisantes (N projets dans ce secteur)"
- [ ] Dans le formulaire d'évaluation (US-008), encart informatif discret : "Projets similaires décidés : score médian X,X/10 — ROI médian Y%"
- [ ] Calcul depuis la vue `project_evaluation_stats` jointure `decisions` (status='decided') + `projects`
- [ ] Pas de noms de projets révélés — uniquement les statistiques agrégées
- [ ] Mise à jour automatique à chaque nouvelle décision (pas de cache statique)

---

### US-031 : IPR / MOIC — Métriques financières enrichies

**Description :** En tant que membre du comité, je veux voir des métriques financières standardisées (multiple, payback ratio) afin de comparer les projets avec un langage commun aux investisseurs.

**Acceptance Criteria :**
- [ ] Dans la page détail projet, section Financier, afficher automatiquement :
  - **MOIC cible** : Multiple of Invested Capital = (investissement × (1 + ROI pondéré/100)) / investissement — exprimé en "Xn" (ex: 3,5x)
  - **Payback estimé** : Investissement / (ROI pondéré annualisé × investissement) — exprimé en mois
  - **Classe de rendement** : catégorisation automatique (< 1,5x = Faible / 1,5–3x = Moyen / 3–5x = Fort / > 5x = Exceptionnel) avec badge coloré
- [ ] Analytics (US-015) : axe Y du scatter configurable sur MOIC en plus du ROI %
- [ ] Tableau ranking analytics : colonne MOIC ajoutée
- [ ] Ces métriques calculées côté serveur dans la vue `project_evaluation_stats` — pas de duplication frontend

---

### US-032 : GE-McKinsey 9-Box — Matrice attractivité × force

**Description :** En tant qu'admin, je veux visualiser le portefeuille dans une matrice 9 cases afin d'identifier les projets à investir, sélectionner ou abandonner.

**Acceptance Criteria :**
- [ ] Dans `/app/analytics`, nouvelle section "9-Box Matrix"
- [ ] Axe Y (Attractivité du marché) : calculé automatiquement depuis les critères "Pertinence stratégique" + "Innovation différenciante" (scores normalisés 0–10)
- [ ] Axe X (Force compétitive du projet) : calculé depuis "Viabilité financière" + "Faisabilité opérationnelle"
- [ ] Grille 3×3 avec zones colorées :
  - Vert (Fort × Fort) : "Investir"
  - Orange (médian) : "Sélectionner"
  - Rouge (Faible × Faible) : "Désinvestir"
- [ ] Chaque projet = point cliquable dans sa case — tooltip : titre, score, horizon
- [ ] Filtres : secteur, horizon H1/H2/H3 — la matrice se recalcule en temps réel
- [ ] Export PNG de la matrice (html-to-image)

---

### US-033 : ELECTRE/PROMETHEE — Moteur de ranking avancé

**Description :** En tant qu'admin, je veux un classement des projets basé sur une méthode de surclassement afin d'obtenir une priorisation rigoureuse indépendante des biais de moyenne.

**Acceptance Criteria :**
- [ ] Dans `/app/analytics`, section "Ranking avancé" avec toggle PROMETHEE / Simple (par défaut : PROMETHEE)
- [ ] **PROMETHEE II** implémenté dans `lib/analytics/promethee.ts` :
  - Fonction de préférence : linéaire (type 3) pour tous les critères
  - Calcul des flux sortants Φ⁺ et entrants Φ⁻ pour chaque projet vs tous les autres
  - Score net Φ = Φ⁺ − Φ⁻ → ranking complet
  - Poids des critères = poids de la grille d'évaluation du comité
- [ ] Tableau ranking : position, titre projet, Φ⁺, Φ⁻, Φ net, delta vs ranking simple (flèche montante/descendante)
- [ ] Explication pédagogique au survol du score Φ : "Ce projet surclasse N autres et est surclassé par M"
- [ ] Recalcul automatique à chaque nouvelle évaluation soumise
- [ ] Export CSV du ranking (admin)

---

### US-034 : J-Curve — Courbe de valeur post-approbation

**Description :** En tant qu'admin, je veux visualiser la trajectoire de valeur d'un projet approuvé dans le temps afin de gérer les attentes du comité pendant la phase d'investissement initial.

**Acceptance Criteria :**
- [ ] Nouvelle table `project_milestones` (id, project_id FK, label, target_date, actual_date, value_delta FLOAT, notes)
- [ ] Dans la page d'un projet décidé = Approuvé, onglet "Trajectoire" (admin + contributeurs)
- [ ] Formulaire admin : saisir des jalons avec date cible, date réelle, delta de valeur estimé (positif ou négatif)
- [ ] Graphique LineChart (recharts) : axe X = temps, axe Y = valeur cumulée — courbe J-Curve si investissement initial négatif
- [ ] Affichage : J+30 / J+60 / J+100 issus du 100-Day Plan (US-035) + jalons personnalisés
- [ ] Calcul automatique : time-to-breakeven (date à laquelle la valeur cumulée repasse en positif)
- [ ] Si pas de jalons saisis → message "Aucune donnée de suivi — saisissez les jalons dans le 100-Day Plan"

---

### US-035 : 100-Day Plan — Template de lancement post-approbation

**Description :** En tant qu'admin, je veux créer un plan des 100 premiers jours pour chaque projet approuvé afin de transformer la décision en actions immédiates avec des critères de go/no-go.

**Acceptance Criteria :**
- [ ] Déclenchement : après enregistrement d'une décision = Approuvé, modal "Créer le 100-Day Plan ?" avec bouton CTA
- [ ] Formulaire plan (accessible aussi dans page projet, onglet "Trajectoire") :
  - Objectif J+30 : texte + critères go/no-go (textarea)
  - Objectif J+60 : texte + critères go/no-go (textarea)
  - Objectif J+100 : texte + critères go/no-go (textarea)
  - Responsable principal (select membre)
- [ ] Stocké dans table `project_milestones` avec `label` = 'J+30'/'J+60'/'J+100', `target_date` calculée depuis `decided_at`
- [ ] Rappels automatiques : J-3 avant chaque jalon → email + WhatsApp au responsable principal + admin
- [ ] Statut par jalon : En attente / Atteint / Manqué — modifiable par admin
- [ ] Jalons alimentent automatiquement la J-Curve (US-034)

---

### US-036 : AAR — After Action Review post-décision

**Description :** En tant que membre du comité, je veux un debriefing structuré 90 jours après chaque décision afin d'améliorer la qualité décisionnelle du groupe dans le temps.

**Acceptance Criteria :**
- [ ] CRON `0 9 * * *` : vérifie les projets avec `decided_at` entre J-91 et J-89 → si AAR non encore fait → déclenche
- [ ] Notification email + WhatsApp au proposant + admin avec lien vers formulaire AAR
- [ ] Page `/app/projects/[id]/aar` avec 4 questions (Delphi 4-question AAR) :
  1. "Qu'était-il prévu ?" (pré-rempli depuis la thèse d'investissement US-028)
  2. "Que s'est-il réellement passé ?" (textarea, requis)
  3. "Pourquoi cet écart ?" (textarea, requis)
  4. "Qu'apprend-on pour les prochaines décisions ?" (textarea, requis)
- [ ] Nouvelle table `aar_responses` (id, project_id FK, filled_by FK profiles, responses JSONB, created_at)
- [ ] AAR rempli → visible dans journal des décisions (US-012) avec icon "AAR disponible"
- [ ] Si AAR non rempli après 30j → second rappel, puis flag "AAR manquant" dans analytics
- [ ] Analytics (US-015) : taux de complétion AAR affiché (% projets décidés avec AAR rempli)

---

### US-037 : Outcome Harvesting — Collecte d'impact structurée

**Description :** En tant qu'admin, je veux collecter les impacts réels des projets approuvés à 180 jours afin de mesurer objectivement la valeur créée indépendamment des objectifs initiaux.

**Acceptance Criteria :**
- [ ] CRON : 180 jours après `decided_at` pour projets Approuvés → notification admin + proposant
- [ ] Formulaire `/app/projects/[id]/outcomes` :
  - "Quels changements ce projet a-t-il produits ?" (textarea, libre — sans référence aux objectifs initiaux)
  - "Qui en a bénéficié et comment ?" (textarea)
  - "Quelle est votre preuve de ce changement ?" (textarea + upload optionnel)
  - "Y a-t-il eu des impacts non anticipés ?" (textarea)
  - Score d'impact auto-évalué (slider 1–10)
- [ ] Nouvelle colonne `outcomes JSONB` dans table `projects`
- [ ] Page détail projet : onglet "Impact" visible après 180j — affiche les outcomes collectés
- [ ] Analytics : dashboard "Impact Portfolio" avec score moyen d'impact + comparaison vs ROI prévu

---

### US-038 : Batting Average / Slugging — Métriques qualité décisionnelle du comité

**Description :** En tant qu'admin, je veux mesurer la performance décisionnelle du comité dans le temps afin d'identifier les biais systémiques et améliorer notre processus.

**Acceptance Criteria :**
- [ ] Section "Performance du Comité" dans `/app/analytics` (admin uniquement)
- [ ] **Batting Average** : % projets approuvés dont les hypothèses de la thèse (US-028) ont été validées à J+90 (AAR)
- [ ] **Slugging %** : moyenne pondérée du score d'impact Outcome Harvesting × MOIC réalisé (si disponible)
- [ ] **Taux de faux positifs** : % projets Approuvés dont l'AAR révèle un échec significatif
- [ ] **Taux de faux négatifs** : % projets Rejetés dont le proposant a signalé un succès via un autre canal (champ optionnel dans le formulaire d'archivage)
- [ ] Graphique temporel : évolution du Batting Average sur les 12 derniers mois (LineChart recharts)
- [ ] Breakdown par évaluateur : admin voit quel évaluateur a le meilleur track record de scores corrélés aux outcomes
- [ ] Ces métriques s'enrichissent automatiquement au fur et à mesure que AAR et Outcomes sont remplis

---

### US-039 : IC Charter — Charte du Comité d'Investissement

**Description :** En tant qu'admin, je veux publier la charte officielle du comité afin que tous les membres connaissent les règles du jeu avant d'évaluer.

**Acceptance Criteria :**
- [ ] Page publique (visible à tous les membres connectés) `/app/committee-charter`
- [ ] Sections éditables par l'admin (rich text Markdown rendu en HTML) :
  - Mandat du comité (mission, périmètre)
  - Composition et rôles (mis à jour automatiquement depuis la liste membres)
  - Critères d'éligibilité d'un projet (conditions minimales pour être soumis)
  - Hurdle rate minimum (score minimum pour approbation — configurable dans settings)
  - Règles de conflits d'intérêts (texte libre)
  - Procédure de délibération (texte libre)
  - Fréquence des revues (texte libre)
- [ ] Contenu stocké dans table `settings` key='ic_charter' value=JSONB
- [ ] Lien "Charte du Comité" dans la sidebar (tous les rôles)
- [ ] Version + date de dernière modification affichées en bas de page
- [ ] Nouveau membre invité → email d'invitation inclut lien vers la charte

---

### US-040 : Thesis-Driven Portfolio — Thèses macro du groupe

**Description :** En tant qu'admin, je veux définir les thèses macro-stratégiques du groupe afin que chaque projet soit rattaché à une conviction collective et que le portefeuille soit cohérent.

**Acceptance Criteria :**
- [ ] Nouvelle table `portfolio_theses` (id, title, description, horizon enum['H1','H2','H3'], status enum['active','archived'], created_by FK, created_at)
- [ ] Page admin `/app/admin/theses` : CRUD des thèses macro (ex: "Digitalisation des PME MENA 2025–2030")
- [ ] Dans le formulaire projet Étape 1, nouveau champ multi-select "Thèses macro" (requis, au moins 1)
- [ ] Colonne `thesis_ids UUID[]` dans table `projects`
- [ ] Dashboard admin : donut chart "Répartition du portefeuille par thèse"
- [ ] Analytics : filtre "Par thèse" sur toutes les visualisations
- [ ] Thèse archivée → les projets rattachés restent liés (historique) mais la thèse n'est plus sélectionnable pour les nouveaux projets
- [ ] Lien vers la page thèse depuis chaque projet → liste tous les projets partageant cette thèse

---

### US-042 : AHP — Calibration des poids par comparaison par paires

**Description :** En tant qu'admin, je veux calibrer les poids des critères d'évaluation via des comparaisons par paires afin que les pondérations reflètent des préférences relatives cohérentes plutôt que des chiffres arbitraires.

**Acceptance Criteria :**
- [ ] Dans la page critères d'un projet (US-010), bouton "Calibrer avec AHP" (en remplacement de la saisie manuelle des poids)
- [ ] Workflow AHP : pour N critères, présenter les N×(N-1)/2 paires une à une — slider de 1 à 9 avec labels ("Égale importance" → "Absolument plus important")
- [ ] Calcul côté serveur dans `lib/analytics/ahp.ts` :
  - Construction de la matrice de comparaison n×n
  - Calcul du vecteur propre principal (power method — max 100 itérations)
  - Calcul du Consistency Ratio (CR = CI / RI avec table RI standard Saaty)
- [ ] Si CR ≤ 0,10 → poids mis à jour automatiquement dans `evaluation_criteria.weight` + toast "Calibration cohérente (CR = X,XX)"
- [ ] Si CR > 0,10 → alerte rouge "Incohérence détectée (CR = X,XX > 0,10) — révisez vos comparaisons" + highlight des paires les plus incohérentes
- [ ] Les poids issus d'AHP s'affichent avec un badge "AHP" pour les distinguer des poids manuels
- [ ] Mode manuel toujours accessible comme alternative — aucune obligation d'utiliser AHP

---

### US-043 : McKinsey IPMS — Revue périodique de portefeuille

**Description :** En tant qu'admin, je veux recevoir un rapport synthétique automatique à intervalles réguliers afin de piloter le rebalancing du portefeuille avec une cadence structurée.

**Acceptance Criteria :**
- [ ] Settings admin : configuration de la fréquence de revue (Mensuelle / Trimestrielle / Désactivée) et du jour d'envoi
- [ ] CRON correspondant : génère et envoie un rapport de revue de portefeuille à l'admin
- [ ] Contenu du rapport (email HTML React Email + résumé WhatsApp) :
  - Nb projets par statut (Ouverts / En évaluation / Décidés ce cycle / Archivés)
  - Projets ouverts depuis > 60 jours sans décision (liste avec lien)
  - Projets approuvés sans 100-Day Plan saisi
  - Projets avec AAR en attente (J+90 dépassé)
  - Score moyen du portefeuille actif vs cycle précédent (delta)
  - Répartition H1/H2/H3 actuelle vs cible configurée dans settings
- [ ] Settings : cible H1/H2/H3 configurable (ex: 50% / 30% / 20%) — le rapport signale les dérives
- [ ] Le rapport est également accessible dans `/app/analytics` → "Rapports de revue" (liste des rapports passés)
- [ ] Chaque rapport est archivé en DB dans table `settings` key=`review_report_YYYY-MM` value=JSONB

---

### US-044 : Portfolio Kanban — Vue tableau avec WIP limits

**Description :** En tant que membre, je veux visualiser les projets sous forme de tableau Kanban afin d'identifier d'un coup d'œil les goulots d'étranglement dans le pipeline de décision.

**Acceptance Criteria :**
- [ ] Dans `/app/projects`, toggle "Vue Grille / Vue Kanban" persisté en localStorage
- [ ] Vue Kanban : 5 colonnes fixes (Brouillon / Soumis / En évaluation / Clôturé / Décidé)
  - Colonne Brouillon : visible admin uniquement
  - Chaque colonne : header avec compteur de projets + indicateur WIP
- [ ] WIP limit configurable par l'admin dans settings pour la colonne "En évaluation" (default: 5)
- [ ] Si WIP dépassé → header colonne rouge + bannière "Limite atteinte — décidez avant d'ouvrir de nouveaux projets"
- [ ] Cards Kanban : titre, secteur badge, horizon badge H1/H2/H3, proposant avatar, progression quorum, deadline
- [ ] Drag & drop désactivé (statuts changés uniquement via les actions dédiées — pas de glisser-déposer libre)
- [ ] Filtres (secteur, horizon, thèse) appliqués simultanément en vue Grille et Kanban

---

### US-045 : Real Options — Formalisation de la valeur d'attente

**Description :** En tant qu'admin, je veux documenter la valeur de l'option d'attente lors d'une décision "Différé" afin que le contexte décisionnel soit préservé et le suivi automatisé.

**Acceptance Criteria :**
- [ ] Dans le Dialog de décision (US-011), si décision = Différé → apparition de 3 champs supplémentaires obligatoires :
  - "Trigger de réactivation" (textarea) : "Ce projet sera rouvert quand..."
  - "Date de révision" (date picker, requis) : quand réévaluer la décision
  - "Valeur de l'information attendue" (textarea) : quelle information manque aujourd'hui
- [ ] Ces champs stockés dans `decisions` → colonne `real_option_data JSONB`
- [ ] CRON : J-7 avant la date de révision → notification email + WhatsApp à l'admin avec contexte complet (thèse originale, scores, justification du Différé, trigger défini)
- [ ] Dans la liste `/app/decisions` : badge "En attente de révision" sur les décisions Différé avec date de révision
- [ ] À la date de révision : le projet repasse automatiquement en status='open' si l'admin a coché "Réouverture automatique" dans le dialog, sinon notification d'alerte seulement
- [ ] Page détail projet Différé : bannière "Révision prévue le [date]" + trigger affiché

---

### US-046 : Pre-Mortem collectif — Exercice avant ouverture à l'évaluation

**Description :** En tant qu'admin, je veux organiser un Pre-Mortem collectif avant d'ouvrir un projet à l'évaluation formelle afin de détecter les risques non vus par le porteur et contrebalancer l'optimisme de groupe.

**Acceptance Criteria :**
- [ ] Nouveau statut intermédiaire dans le flow : draft → **pre-mortem** → open
- [ ] Admin peut déclencher la phase Pre-Mortem depuis la page d'un projet soumis (status='draft' soumis)
- [ ] Déclenchement → notification email + WhatsApp à tous les évaluateurs : "Pre-Mortem ouvert — imaginez que ce projet a échoué dans 2 ans. Listez les raisons avant d'évaluer."
- [ ] Formulaire Pre-Mortem (par évaluateur, anonyme) :
  - "Raisons d'échec identifiées" (textarea, min 50 caractères)
  - "Hypothèse la plus fragile dans le dossier" (textarea)
  - "Ce qui n'a pas été dit dans la soumission" (textarea optionnel)
- [ ] Délai configurable par l'admin (default: 3 jours) — après ce délai, le système clôture automatiquement la phase Pre-Mortem
- [ ] Agrégation des réponses : thèmes récurrents regroupés (simple fréquence de mots-clés) + liste complète anonymisée
- [ ] Résultats Pre-Mortem stockés dans table `project_premortems` (id, project_id FK, responses JSONB, aggregation JSONB, closed_at)
- [ ] Tab "Intelligence" du projet : section "Pre-Mortem" — résultats agrégés visibles de tous les membres
- [ ] Admin peut passer en status='open' uniquement après clôture du Pre-Mortem (ou skip avec confirmation explicite "Je passe le Pre-Mortem")
- [ ] Dans le formulaire d'évaluation (US-008) : les résultats Pre-Mortem affichés en encart discret pour informer l'évaluateur

---

### US-041 : Two-Speed Governance — Seuils d'approbation différenciés

**Description :** En tant qu'admin, je veux configurer des seuils d'approbation différents selon le montant et l'horizon afin d'adapter la rigueur du processus au niveau d'enjeu.

**Acceptance Criteria :**
- [ ] Page admin `/app/admin/settings`, section "Gouvernance" :
  - **Vitesse 1 — Décision déléguée** : critères (ex: investissement < X€ ET horizon H1) → quorum réduit configurable (ex: 3 évaluateurs) + délai raccourci (ex: 5 jours)
  - **Vitesse 2 — Décision collégiale** : tous les autres projets → quorum standard configuré dans settings
- [ ] Règles stockées dans `settings` key='governance_rules' value=JSONB
- [ ] À la soumission d'un projet, le système détermine automatiquement la vitesse applicable et affiche : "Ce projet sera traité en Vitesse 1 — Décision déléguée (quorum 3, délai 5j)"
- [ ] Badge "V1" ou "V2" affiché sur les cards et la page détail
- [ ] Quorum et deadline pré-remplis automatiquement dans l'admin selon la vitesse — modifiables manuellement
- [ ] Analytics : breakdown des décisions par vitesse (V1/V2) dans les métriques du comité

---

### MODULE 11 — ROBUSTESSE & ADOPTION

---

### US-047 : Onboarding guidé — Projet de démo interactif

**Description :** En tant que nouveau membre, je veux traverser un projet fictif de démo guidé afin de maîtriser le process complet avant d'évaluer un vrai projet.

**Acceptance Criteria :**
- [ ] À la première connexion après acceptation de l'invitation, modal "Bienvenue — 10 min pour maîtriser la plateforme"
- [ ] Projet de démo pré-chargé en DB (seed) : "Projet Démo — Marketplace B2B" avec toutes les sections remplies, horizon H2, scénarios Monte Carlo, thèse d'investissement
- [ ] Flow guidé pas-à-pas avec tooltip overlay (bibliothèque `driver.js` ou équivalent) :
  1. Tour de l'interface (sidebar, dashboard, KPIs)
  2. Lecture du projet démo (toutes les sections)
  3. Remplissage d'une évaluation démo (critères + Red Team + commentaire)
  4. Visualisation des résultats agrégés simulés
  5. Lecture d'une décision fictive avec 100-Day Plan
- [ ] Progression sauvegardée dans `profiles.onboarding_step INT` — peut être interrompue et reprise
- [ ] Badge "Onboarding complété" une fois les 5 étapes franchies — débloque l'accès aux vrais projets
- [ ] Bouton "Passer l'onboarding" avec confirmation (admin peut forcer le skip pour les membres expérimentés)
- [ ] Projet démo invisible dans toutes les vues normales — filtré par `projects.is_demo BOOLEAN`

---

### US-048 : Montée en compétence progressive — Champs expert optionnels

**Description :** En tant que membre débutant sur la plateforme, je veux que les champs avancés soient optionnels au départ afin de ne pas être bloqué par la complexité avant de maîtriser les bases.

**Acceptance Criteria :**
- [ ] Champs marqués "Expert" dans le formulaire de soumission (optionnels les 90 premiers jours de la plateforme) :
  - Investment Thesis (US-028)
  - Scénarios Monte Carlo (US-027) — remplacé par ROI unique si non rempli
  - Rattachement aux thèses macro (US-040)
- [ ] Champs marqués "Expert" dans l'évaluation (optionnels les 90 premiers jours) :
  - Red Team (US-029)
- [ ] Affichage : badge "⭐ Expert" + tooltip "Ce champ enrichit l'évaluation mais n'est pas obligatoire pendant la phase d'apprentissage"
- [ ] Settings admin : date de fin de la "période d'apprentissage" configurable (default: J+90 après premier projet soumis)
- [ ] Après la période : les champs deviennent obligatoires automatiquement — notification email 7j avant avec message pédagogique
- [ ] Indicateur de complétion sur chaque soumission : "Soumission basique (5/9 champs) / Soumission complète (9/9 champs)" — badge visible dans la liste projets

---

### US-049 : Backup automatique Supabase vers stockage local

**Description :** En tant qu'admin, je veux un backup quotidien automatique de la base de données afin de garantir la récupération des données en cas de panne du serveur Coolify.

**Acceptance Criteria :**
- [ ] Script `scripts/backup.sh` : `pg_dump` de la DB Supabase → fichier compressé `.sql.gz` horodaté
- [ ] Destination : bucket Minio local `veille-elite-backups` (ou répertoire local `/backups` si Minio absent)
- [ ] Rétention : 30 derniers backups conservés — suppression automatique des anciens
- [ ] CRON Coolify : `0 3 * * *` (3h00 chaque nuit)
- [ ] Variable d'env `DATABASE_BACKUP_URL` (connection string pg_dump) dans `.env.example`
- [ ] Notification email admin après chaque backup : succès (taille fichier) ou échec (message d'erreur)
- [ ] Script de restauration documenté dans `README.md` section "Disaster Recovery"
- [ ] Test de restauration documenté : procédure manuelle à exécuter trimestriellement + checklist dans `/app/admin/settings` section "Maintenance"
- [ ] Backup chiffré avec `gpg --symmetric` si variable `BACKUP_GPG_PASSPHRASE` présente dans l'env

---

## Functional Requirements

- **FR-01 :** Toute route `/app/*` requiert une session Supabase valide — redirection automatique vers `/login`
- **FR-02 :** Le rôle 'contributeur' ne peut accéder qu'à `/app/dashboard`, `/app/projects` (status != 'draft'), `/app/decisions`
- **FR-03 :** Un évaluateur ne peut soumettre qu'une seule évaluation par projet — contrainte UNIQUE en DB + RLS
- **FR-04 :** Les scores individuels des autres évaluateurs ne sont jamais exposés via l'API aux non-admins (vue agrégats uniquement)
- **FR-05 :** La table `decisions` est INSERT ONLY — aucun UPDATE ni DELETE autorisé via RLS, pour personne
- **FR-06 :** Les clés API sont hachées SHA-256 avant stockage — la valeur en clair n'est jamais persistée ni retournée
- **FR-07 :** Les notifications WhatsApp et email sont asynchrones — elles ne bloquent pas la réponse HTTP (fire and forget avec log)
- **FR-08 :** Le quorum est recalculé dynamiquement si le nombre de membres évaluateurs actifs change
- **FR-09 :** Les fichiers uploadés sont dans un bucket Supabase Storage privé — accès uniquement via signed URLs (expiration 1h)
- **FR-10 :** Toute action admin (changement rôle, suspension, paramètres) est loggée dans `notifications_log`
- **FR-11 :** Le formulaire de soumission sauvegarde automatiquement en brouillon toutes les 30s
- **FR-12 :** L'interface est responsive et fonctionnelle à partir de 375px de largeur
- **FR-13 :** Les contributeurs reçoivent uniquement la notification "Décision prise" (avec lien repo si fourni) — pas les rappels d'évaluation ni les notifications de quorum
- **FR-14 :** Les projets archivés sont exclus par défaut de toutes les vues et du dashboard — accessibles uniquement via filtre explicite "Archivés"
- **FR-15 :** Le flux de statut projet est unidirectionnel : draft → pre-mortem → open → closed → decided → archived — aucun retour en arrière sans action admin explicite
- **FR-16 :** Le CRON de revue de portefeuille (US-043) et le CRON AAR (US-036) partagent le même mécanisme d'authentification `CRON_SECRET` que le CRON rappels (US-019)
- **FR-17 :** Les réponses Pre-Mortem et Red Team sont définitivement anonymisées en DB — aucun mapping evaluateur_id n'est stocké dans ces tables
- **FR-18 :** Le moteur PROMETHEE (US-033) n'est calculé que sur les projets ayant atteint le quorum — les projets en cours d'évaluation sont exclus du ranking
- **FR-19 :** La phase Pre-Mortem est optionnelle par projet (skip possible avec confirmation admin) mais son activation est la valeur par défaut configurable dans les settings
- **FR-20 :** Les données de révision Real Options (trigger, date, valeur de l'information) sont stockées dans `decisions` et jamais modifiables après enregistrement — elles font partie de l'audit trail immuable

---

## Non-Goals (Out of Scope)

- Paiement en ligne ou gestion des montants engagés
- Intégration comptable ou ERP
- Vidéoconférence ou réunion intégrée
- SSO entreprise (SAML, LDAP)
- Versioning des modifications de formulaire projet
- Mode offline / PWA
- Multi-tenant (une instance = un groupe)
- Marketplace de templates de critères
- API publique documentée pour tiers
- Deux-facteurs (2FA) — Google OAuth suffit
- Lorie-Savage (optimisation sous contrainte budgétaire) — nécessite un module de gestion de budget absent
- Capital Reallocation — idem, requiert un suivi des montants engagés
- COSO ERM / Bow-Tie — cadres d'entreprise macro, hors périmètre d'un comité de projet
- RDM RAND / Info-Gap IGDT — deep uncertainty modelling, trop académique sans cas d'usage immédiat
- Prediction Markets — requiert une liquidité de participants incompatible avec un groupe fermé

---

## Technical Considerations

- **App Router exclusivement** — pas de `pages/` directory
- **Server Actions** pour toutes les mutations (`'use server'`) — routes API uniquement pour streaming (IA) et cron
- **Supabase Realtime** pour le dashboard (channel `portfolio-updates`) — pas de polling
- **`use client`** minimal — uniquement pour les composants nécessitant interactivité browser
- **recharts** pour tous les graphiques (ScatterChart, RadarChart, BarChart, RadialBarChart, LineChart, PieChart)
- **@dnd-kit** pour drag & drop des critères et des jalons 100-Day Plan
- **PROMETHEE II** implémenté en TypeScript pur dans `lib/analytics/promethee.ts` — aucune lib externe
- **Monte Carlo** : calcul côté serveur (Server Action) — 10 000 itérations en < 100ms avec distributions pondérées
- Evolution API instance déjà configurée et connectée — utiliser tel quel, tester avec `/api/health` de l'instance
- Supabase Storage : bucket `project-files` (private), bucket `avatars` (public)
- Toutes les Server Actions retournent `{ success: boolean, error?: string, data?: T }`
- Le CRON secret doit être distinct de la service role key Supabase

---

## Success Metrics

- Zéro erreur TypeScript et lint au `npm run build`
- RLS vérifié : auto-évaluation → erreur 403 en base
- Vote aveugle vérifié : appel API direct sans session admin → scores individuels absents de la réponse
- Notification WhatsApp reçue dans les 10 secondes après un événement déclencheur
- Page dashboard chargée en < 2s sur réseau local Coolify
- Formulaire soumission : sauvegarde brouillon vérifiée en coupant la connexion à mi-saisie
