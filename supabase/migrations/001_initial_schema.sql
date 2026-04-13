-- ============================================================
-- Portfolio Decision Platform — Veille Élite
-- Migration 001 : Schéma initial complet
-- ============================================================

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('admin', 'evaluateur', 'contributeur');
CREATE TYPE user_status AS ENUM ('active', 'suspended');
CREATE TYPE project_status AS ENUM ('draft', 'pre-mortem', 'open', 'closed', 'decided', 'archived');
CREATE TYPE project_horizon AS ENUM ('H1', 'H2', 'H3');
CREATE TYPE barbell_cat AS ENUM ('core', 'growth', 'moonshot');
CREATE TYPE governance_speed AS ENUM ('V1', 'V2');
CREATE TYPE quorum_type AS ENUM ('absolute', 'percentage');
CREATE TYPE decision_type AS ENUM ('approved', 'rejected', 'deferred');
CREATE TYPE notif_channel AS ENUM ('email', 'whatsapp');
CREATE TYPE notif_status AS ENUM ('sent', 'failed', 'pending');
CREATE TYPE api_provider AS ENUM ('openai', 'anthropic', 'perplexity', 'other');
CREATE TYPE milestone_status AS ENUM ('pending', 'achieved', 'missed');
CREATE TYPE thesis_status AS ENUM ('active', 'archived');
CREATE TYPE weight_method AS ENUM ('manual', 'ahp');

-- ============================================================
-- TABLE : profiles
-- ============================================================

CREATE TABLE public.profiles (
  id             UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email          TEXT NOT NULL UNIQUE,
  full_name      TEXT,
  avatar_url     TEXT,
  role           user_role NOT NULL DEFAULT 'evaluateur',
  status         user_status NOT NULL DEFAULT 'active',
  whatsapp_number TEXT,
  notification_prefs JSONB NOT NULL DEFAULT '{
    "email": {
      "project_submitted": true,
      "evaluation_reminder": true,
      "quorum_reached": true,
      "decision_made": true
    },
    "whatsapp": {
      "project_submitted": true,
      "evaluation_reminder": true,
      "quorum_reached": true,
      "decision_made": true
    }
  }'::jsonb,
  onboarding_step INT NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE : portfolio_theses
-- ============================================================

CREATE TABLE public.portfolio_theses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  description TEXT,
  horizon     project_horizon,
  status      thesis_status NOT NULL DEFAULT 'active',
  created_by  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE : projects
-- ============================================================

CREATE TABLE public.projects (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title               TEXT NOT NULL,
  description         TEXT,
  sector              TEXT,
  tags                TEXT[] DEFAULT '{}',
  proposant_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  status              project_status NOT NULL DEFAULT 'draft',
  quorum_required     INT NOT NULL DEFAULT 3,
  quorum_type         quorum_type NOT NULL DEFAULT 'absolute',
  evaluation_deadline TIMESTAMPTZ,
  decided_at          TIMESTAMPTZ,
  decision_notes      TEXT,
  repo_url            TEXT,
  market_research     JSONB,
  -- Three Horizons + Barbell
  horizon             project_horizon,
  barbell_category    barbell_cat,
  -- Two-Speed Governance
  governance_speed    governance_speed DEFAULT 'V2',
  -- Investment Thesis (US-028)
  investment_thesis   JSONB,
  -- Monte Carlo scenarios (US-027)
  scenarios           JSONB,
  moic_target         FLOAT,
  -- Thesis-Driven Portfolio (US-040)
  thesis_ids          UUID[] DEFAULT '{}',
  -- Outcome Harvesting (US-037)
  outcomes            JSONB,
  -- Onboarding demo flag
  is_demo             BOOLEAN NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE : project_files
-- ============================================================

CREATE TABLE public.project_files (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  file_url    TEXT NOT NULL,
  file_name   TEXT NOT NULL,
  file_type   TEXT NOT NULL,
  file_size   INT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE : evaluation_criteria
-- (project_id NULL = critères globaux par défaut)
-- ============================================================

CREATE TABLE public.evaluation_criteria (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  label         TEXT NOT NULL,
  weight        FLOAT NOT NULL CHECK (weight > 0 AND weight <= 100),
  description   TEXT,
  order_index   INT NOT NULL DEFAULT 0,
  weight_method weight_method NOT NULL DEFAULT 'manual',
  ahp_matrix    JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Critères par défaut (project_id = NULL)
INSERT INTO public.evaluation_criteria (project_id, label, weight, description, order_index) VALUES
  (NULL, 'Pertinence stratégique',      25, 'Alignement avec la vision et les thèses du groupe', 1),
  (NULL, 'Viabilité financière',         25, 'Solidité du modèle économique, ROI et scénarios', 2),
  (NULL, 'Faisabilité opérationnelle',   20, 'Capacité réelle à exécuter le projet dans les délais', 3),
  (NULL, 'Impact risque',                15, 'Évaluation de l''exposition aux risques identifiés', 4),
  (NULL, 'Innovation différenciante',    15, 'Degré de différenciation et barrières à l''entrée', 5);

-- ============================================================
-- TABLE : evaluations
-- ============================================================

CREATE TABLE public.evaluations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  evaluateur_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  scores        JSONB NOT NULL DEFAULT '{}',
  commentary    TEXT NOT NULL,
  red_team      JSONB,
  submitted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (project_id, evaluateur_id)
);

-- ============================================================
-- TABLE : decisions (INSERT ONLY — immuable)
-- ============================================================

CREATE TABLE public.decisions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id       UUID NOT NULL REFERENCES public.projects(id) ON DELETE RESTRICT,
  made_by          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  decision         decision_type NOT NULL,
  rationale        TEXT NOT NULL,
  real_option_data JSONB,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE : project_milestones (100-Day Plan + J-Curve)
-- ============================================================

CREATE TABLE public.project_milestones (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  label       TEXT NOT NULL,
  target_date TIMESTAMPTZ NOT NULL,
  actual_date TIMESTAMPTZ,
  value_delta FLOAT,
  notes       TEXT,
  status      milestone_status NOT NULL DEFAULT 'pending',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE : aar_responses (After Action Review)
-- ============================================================

CREATE TABLE public.aar_responses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  filled_by   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  responses   JSONB NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE : project_premortems
-- ============================================================

CREATE TABLE public.project_premortems (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  responses   JSONB NOT NULL DEFAULT '[]',
  aggregation JSONB,
  closed_at   TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE : notifications_log
-- ============================================================

CREATE TABLE public.notifications_log (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  channel      notif_channel NOT NULL,
  type         TEXT NOT NULL,
  payload      JSONB,
  sent_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status       notif_status NOT NULL DEFAULT 'pending'
);

-- ============================================================
-- TABLE : api_keys
-- ============================================================

CREATE TABLE public.api_keys (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  label        TEXT NOT NULL,
  key_hash     TEXT NOT NULL,
  key_preview  VARCHAR(8) NOT NULL,
  provider     api_provider NOT NULL,
  is_global    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);

-- ============================================================
-- TABLE : invitations
-- ============================================================

CREATE TABLE public.invitations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL,
  token       UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  role        user_role NOT NULL DEFAULT 'evaluateur',
  invited_by  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE : settings
-- ============================================================

CREATE TABLE public.settings (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Valeurs par défaut
INSERT INTO public.settings (key, value) VALUES
  ('platform_name',        '"Veille Élite"'),
  ('quorum_default',       '{"type": "percentage", "value": 60}'),
  ('auto_archive_days',    '0'),
  ('reminder_hours_before','48'),
  ('portfolio_review_frequency', '"quarterly"'),
  ('governance_rules',     '{"v1_max_amount": 50000, "v1_horizon": "H1", "v1_quorum": 3, "v1_deadline_days": 5}'),
  ('pre_mortem_enabled',   'true'),
  ('pre_mortem_days',      '3'),
  ('max_members',          '50'),
  ('learning_period_days', '90'),
  ('ic_charter',           '{}'),
  ('notifications_enabled','{"email": true, "whatsapp": false}');

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_projects_proposant   ON public.projects(proposant_id);
CREATE INDEX idx_projects_status      ON public.projects(status);
CREATE INDEX idx_projects_created_at  ON public.projects(created_at DESC);
CREATE INDEX idx_projects_deadline    ON public.projects(evaluation_deadline) WHERE status = 'open';
CREATE INDEX idx_projects_horizon     ON public.projects(horizon);
CREATE INDEX idx_evaluations_project  ON public.evaluations(project_id);
CREATE INDEX idx_evaluations_evaluateur ON public.evaluations(evaluateur_id);
CREATE INDEX idx_decisions_project    ON public.decisions(project_id);
CREATE INDEX idx_notif_log_recipient  ON public.notifications_log(recipient_id);
CREATE INDEX idx_notif_log_sent_at    ON public.notifications_log(sent_at DESC);
CREATE INDEX idx_invitations_email    ON public.invitations(email);
CREATE INDEX idx_invitations_token    ON public.invitations(token);
CREATE INDEX idx_api_keys_owner       ON public.api_keys(owner_id);

-- ============================================================
-- VUE : project_evaluation_stats
-- ============================================================

CREATE OR REPLACE VIEW public.project_evaluation_stats AS
SELECT
  p.id                                          AS project_id,
  p.title,
  p.status,
  p.quorum_required,
  p.quorum_type,
  COUNT(e.id)                                   AS evaluation_count,
  ROUND(AVG(
    (SELECT SUM((score.value::float) * (ec.weight / 100))
     FROM jsonb_each_text(e.scores) AS score(crit_id, value)
     JOIN public.evaluation_criteria ec ON ec.id::text = score.crit_id)
  )::numeric, 2)                                AS avg_score,
  CASE
    WHEN p.quorum_type = 'absolute' THEN
      COUNT(e.id) >= p.quorum_required
    ELSE
      COUNT(e.id) >= CEIL(
        (SELECT COUNT(*) FROM public.profiles
         WHERE role IN ('admin','evaluateur') AND status = 'active')
        * p.quorum_required / 100.0
      )
  END                                           AS quorum_reached
FROM public.projects p
LEFT JOIN public.evaluations e ON e.project_id = p.id
GROUP BY p.id;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_files       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluation_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decisions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_milestones  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aar_responses       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_premortems  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications_log   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_theses    ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------
-- HELPER FUNCTION : récupérer le rôle du user courant
-- ----------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS user_role
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.current_user_status()
RETURNS user_status
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT status FROM public.profiles WHERE id = auth.uid();
$$;

-- ----------------------------------------------------------------
-- profiles
-- ----------------------------------------------------------------

-- Chaque user voit son propre profil
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (id = auth.uid());

-- Admin voit tous les profils
CREATE POLICY "profiles_select_admin" ON public.profiles
  FOR SELECT USING (public.current_user_role() = 'admin');

-- Mise à jour de son propre profil seulement
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

-- Admin peut modifier tous les profils (rôle, statut)
CREATE POLICY "profiles_update_admin" ON public.profiles
  FOR UPDATE USING (public.current_user_role() = 'admin');

-- INSERT déclenché par trigger auth (géré côté app via service_role)
CREATE POLICY "profiles_insert_service" ON public.profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- ----------------------------------------------------------------
-- portfolio_theses
-- ----------------------------------------------------------------

CREATE POLICY "theses_select_authenticated" ON public.portfolio_theses
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "theses_insert_admin" ON public.portfolio_theses
  FOR INSERT WITH CHECK (public.current_user_role() = 'admin');

CREATE POLICY "theses_update_admin" ON public.portfolio_theses
  FOR UPDATE USING (public.current_user_role() = 'admin');

CREATE POLICY "theses_delete_admin" ON public.portfolio_theses
  FOR DELETE USING (public.current_user_role() = 'admin');

-- ----------------------------------------------------------------
-- projects
-- ----------------------------------------------------------------

-- Contributeurs voient uniquement les projets non-draft
CREATE POLICY "projects_select_contributor" ON public.projects
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND
    public.current_user_role() = 'contributeur' AND
    status != 'draft'
  );

-- Évaluateurs et admins voient tout (y compris leurs propres drafts)
CREATE POLICY "projects_select_member" ON public.projects
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND
    public.current_user_role() IN ('admin', 'evaluateur') AND
    (status != 'draft' OR proposant_id = auth.uid())
  );

-- Tout membre authentifié peut créer un projet
CREATE POLICY "projects_insert_authenticated" ON public.projects
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    proposant_id = auth.uid()
  );

-- Modification uniquement par le proposant (si draft) ou par admin
CREATE POLICY "projects_update_proposant" ON public.projects
  FOR UPDATE USING (
    proposant_id = auth.uid() AND status = 'draft'
  );

CREATE POLICY "projects_update_admin" ON public.projects
  FOR UPDATE USING (public.current_user_role() = 'admin');

-- Pas de DELETE sur les projets

-- ----------------------------------------------------------------
-- project_files
-- ----------------------------------------------------------------

CREATE POLICY "files_select_authenticated" ON public.project_files
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "files_insert_proposant" ON public.project_files
  FOR INSERT WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "files_delete_proposant_or_admin" ON public.project_files
  FOR DELETE USING (
    uploaded_by = auth.uid() OR public.current_user_role() = 'admin'
  );

-- ----------------------------------------------------------------
-- evaluation_criteria
-- ----------------------------------------------------------------

-- Lecture pour tous les membres
CREATE POLICY "criteria_select_authenticated" ON public.evaluation_criteria
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- CRUD admin uniquement
CREATE POLICY "criteria_write_admin" ON public.evaluation_criteria
  FOR ALL USING (public.current_user_role() = 'admin');

-- ----------------------------------------------------------------
-- evaluations
-- ----------------------------------------------------------------

-- Un évaluateur voit UNIQUEMENT sa propre évaluation
CREATE POLICY "evaluations_select_own" ON public.evaluations
  FOR SELECT USING (evaluateur_id = auth.uid());

-- Admin voit toutes les évaluations
CREATE POLICY "evaluations_select_admin" ON public.evaluations
  FOR SELECT USING (public.current_user_role() = 'admin');

-- INSERT : évaluateur ne peut pas évaluer son propre projet
CREATE POLICY "evaluations_insert" ON public.evaluations
  FOR INSERT WITH CHECK (
    evaluateur_id = auth.uid() AND
    public.current_user_role() IN ('admin', 'evaluateur') AND
    (SELECT proposant_id FROM public.projects WHERE id = project_id) != auth.uid()
  );

-- Pas de UPDATE ni DELETE sur les évaluations

-- ----------------------------------------------------------------
-- decisions (INSERT ONLY — immuable)
-- ----------------------------------------------------------------

-- Lecture : évaluateurs et admins
CREATE POLICY "decisions_select_member" ON public.decisions
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND
    public.current_user_role() IN ('admin', 'evaluateur')
  );

-- Lecture : contributeurs (lecture seule)
CREATE POLICY "decisions_select_contributor" ON public.decisions
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND
    public.current_user_role() = 'contributeur'
  );

-- INSERT : admin uniquement
CREATE POLICY "decisions_insert_admin" ON public.decisions
  FOR INSERT WITH CHECK (
    public.current_user_role() = 'admin' AND
    made_by = auth.uid()
  );

-- UPDATE et DELETE : PERSONNE (pas de policy = interdit)

-- ----------------------------------------------------------------
-- project_milestones
-- ----------------------------------------------------------------

CREATE POLICY "milestones_select_authenticated" ON public.project_milestones
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "milestones_write_admin" ON public.project_milestones
  FOR ALL USING (public.current_user_role() = 'admin');

-- ----------------------------------------------------------------
-- aar_responses
-- ----------------------------------------------------------------

-- Lecture : admin voit tout, user voit la sienne
CREATE POLICY "aar_select_own" ON public.aar_responses
  FOR SELECT USING (filled_by = auth.uid());

CREATE POLICY "aar_select_admin" ON public.aar_responses
  FOR SELECT USING (public.current_user_role() = 'admin');

-- INSERT : proposant ou admin
CREATE POLICY "aar_insert" ON public.aar_responses
  FOR INSERT WITH CHECK (filled_by = auth.uid());

-- ----------------------------------------------------------------
-- project_premortems
-- ----------------------------------------------------------------

-- Lecture : tous les membres (résultats agrégés anonymisés)
CREATE POLICY "premortems_select_authenticated" ON public.project_premortems
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Admin gère les pre-mortems
CREATE POLICY "premortems_write_admin" ON public.project_premortems
  FOR ALL USING (public.current_user_role() = 'admin');

-- ----------------------------------------------------------------
-- notifications_log
-- ----------------------------------------------------------------

-- User voit ses propres notifications
CREATE POLICY "notif_select_own" ON public.notifications_log
  FOR SELECT USING (recipient_id = auth.uid());

-- Admin voit tout
CREATE POLICY "notif_select_admin" ON public.notifications_log
  FOR SELECT USING (public.current_user_role() = 'admin');

-- INSERT via service_role uniquement (server-side)
CREATE POLICY "notif_insert_service" ON public.notifications_log
  FOR INSERT WITH CHECK (TRUE); -- service_role bypass RLS

-- ----------------------------------------------------------------
-- api_keys
-- ----------------------------------------------------------------

-- User voit ses propres clés + les clés globales
CREATE POLICY "apikeys_select_own" ON public.api_keys
  FOR SELECT USING (owner_id = auth.uid() OR is_global = TRUE);

-- Admin voit tout
CREATE POLICY "apikeys_select_admin" ON public.api_keys
  FOR SELECT USING (public.current_user_role() = 'admin');

-- INSERT : owner uniquement
CREATE POLICY "apikeys_insert_own" ON public.api_keys
  FOR INSERT WITH CHECK (owner_id = auth.uid());

-- DELETE : owner ou admin
CREATE POLICY "apikeys_delete" ON public.api_keys
  FOR DELETE USING (
    owner_id = auth.uid() OR public.current_user_role() = 'admin'
  );

-- ----------------------------------------------------------------
-- invitations
-- ----------------------------------------------------------------

-- Admin voit toutes les invitations
CREATE POLICY "invitations_select_admin" ON public.invitations
  FOR SELECT USING (public.current_user_role() = 'admin');

-- Lecture publique par token (pour la page /invite/[token])
CREATE POLICY "invitations_select_token" ON public.invitations
  FOR SELECT USING (TRUE); -- filtré par token dans l'app, accès service_role

-- Admin gère les invitations
CREATE POLICY "invitations_write_admin" ON public.invitations
  FOR ALL USING (public.current_user_role() = 'admin');

-- ----------------------------------------------------------------
-- settings
-- ----------------------------------------------------------------

-- Lecture pour tous les membres authentifiés
CREATE POLICY "settings_select_authenticated" ON public.settings
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Modification admin uniquement
CREATE POLICY "settings_write_admin" ON public.settings
  FOR ALL USING (public.current_user_role() = 'admin');

-- ============================================================
-- TRIGGER : créer automatiquement un profil à l'inscription
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
