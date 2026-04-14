-- ============================================================
-- Veille Élite — Seed de démonstration
-- Exécuter dans Supabase SQL Editor (service_role → bypass RLS)
-- ============================================================

DO $$
DECLARE
  v_admin_id     UUID;
  v_thesis_1     UUID;
  v_thesis_2     UUID;
  v_thesis_3     UUID;
  v_thesis_4     UUID;
  v_proj_draft   UUID;
  v_proj_open    UUID;
  v_proj_closed  UUID;
  v_proj_appr    UUID;
  v_proj_rej     UUID;
  v_crit_1       UUID;
  v_crit_2       UUID;
  v_crit_3       UUID;
  v_crit_4       UUID;
  v_crit_5       UUID;
BEGIN

  -- ── 0. Récupérer l'admin ────────────────────────────────────
  SELECT id INTO v_admin_id
  FROM public.profiles
  WHERE role = 'admin'
  LIMIT 1;

  IF v_admin_id IS NULL THEN
    RAISE EXCEPTION 'Aucun profil admin trouvé. Changez votre rôle en admin via Supabase Table Editor.';
  END IF;

  -- ── 0b. Récupérer les critères par défaut ──────────────────
  SELECT id INTO v_crit_1 FROM public.evaluation_criteria
    WHERE label = 'Pertinence stratégique' AND project_id IS NULL LIMIT 1;
  SELECT id INTO v_crit_2 FROM public.evaluation_criteria
    WHERE label = 'Viabilité financière' AND project_id IS NULL LIMIT 1;
  SELECT id INTO v_crit_3 FROM public.evaluation_criteria
    WHERE label = 'Faisabilité opérationnelle' AND project_id IS NULL LIMIT 1;
  SELECT id INTO v_crit_4 FROM public.evaluation_criteria
    WHERE label = 'Impact risque' AND project_id IS NULL LIMIT 1;
  SELECT id INTO v_crit_5 FROM public.evaluation_criteria
    WHERE label = 'Innovation différenciante' AND project_id IS NULL LIMIT 1;

  -- ── 1. Thèses de portefeuille (une par une) ─────────────────

  INSERT INTO public.portfolio_theses (id, title, description, horizon, status, created_by)
  VALUES (gen_random_uuid(),
    'Transition énergétique Afrique',
    'Investir dans les infrastructures d''énergie renouvelable en Afrique subsaharienne. Opportunité structurelle portée par l''électrification rurale, le déficit chronique en électricité et la baisse des coûts du solaire PV.',
    'H2', 'active', v_admin_id)
  RETURNING id INTO v_thesis_1;

  INSERT INTO public.portfolio_theses (id, title, description, horizon, status, created_by)
  VALUES (gen_random_uuid(),
    'FinTech & Inclusion financière',
    'Capitaliser sur le gap de bancarisation en Afrique francophone (70 % de la population non bancarisée). Focus sur les solutions mobile money, crédit alternatif et infrastructure de paiement.',
    'H1', 'active', v_admin_id)
  RETURNING id INTO v_thesis_2;

  INSERT INTO public.portfolio_theses (id, title, description, horizon, status, created_by)
  VALUES (gen_random_uuid(),
    'AgriTech & Chaînes de valeur agricoles',
    'Moderniser les filières agricoles (cacao, café, anacarde) par la data, la traçabilité blockchain et les intrants de précision. MOIC cible 4–7× sur 5 ans.',
    'H2', 'active', v_admin_id)
  RETURNING id INTO v_thesis_3;

  INSERT INTO public.portfolio_theses (id, title, description, horizon, status, created_by)
  VALUES (gen_random_uuid(),
    'Santé digitale & Télémédecine',
    'Thèse optionnelle à horizon 7–10 ans. Infrastructure de santé sous-financée + pénétration smartphone croissante = fenêtre de création de valeur pour les early movers.',
    'H3', 'active', v_admin_id)
  RETURNING id INTO v_thesis_4;

  -- ── 2. Projets (un par un avec RETURNING) ───────────────────

  -- PROJET 1 : Brouillon (draft)
  INSERT INTO public.projects (
    id, title, description, sector, tags,
    proposant_id, status, quorum_required, quorum_type,
    horizon, barbell_category, governance_speed,
    moic_target, thesis_ids, is_demo
  ) VALUES (
    gen_random_uuid(),
    'SolarGrid CI — Mini-réseaux solaires Côte d''Ivoire',
    'Déploiement de 12 mini-réseaux solaires hybrides (solaire + batteries) dans des communes rurales de Côte d''Ivoire non connectées au réseau national. Modèle PAYG (Pay-As-You-Go) via mobile money. Partenariat avec ANARE-CI pour les concessions.',
    'Énergie renouvelable',
    ARRAY['solaire', 'PAYG', 'Côte d''Ivoire', 'off-grid', 'impact'],
    v_admin_id, 'draft', 3, 'absolute',
    'H2', 'growth', 'V2',
    4.5, ARRAY[v_thesis_1], TRUE
  ) RETURNING id INTO v_proj_draft;

  -- PROJET 2 : Ouvert à l'évaluation (open)
  INSERT INTO public.projects (
    id, title, description, sector, tags,
    proposant_id, status, quorum_required, quorum_type,
    evaluation_deadline, horizon, barbell_category, governance_speed,
    moic_target, thesis_ids, investment_thesis, is_demo
  ) VALUES (
    gen_random_uuid(),
    'PaieRapide — Super-app de paie pour PME francophones',
    'Solution SaaS de gestion de paie et de RH pour les PME (10–200 salariés) en Afrique francophone. Automatisation du bulletin de paie, déclarations CNSS, virements salaires via intégration mobile money (Orange, Wave, MTN). Prix cible : 15 000 FCFA/mois pour 50 salariés.',
    'FinTech / RH',
    ARRAY['SaaS', 'paie', 'RH', 'Afrique francophone', 'B2B'],
    v_admin_id, 'open', 1, 'absolute',
    NOW() + INTERVAL '5 days',
    'H1', 'core', 'V1',
    3.2, ARRAY[v_thesis_2],
    jsonb_build_object(
      'statement', 'Les PME africaines perdent en moyenne 3 jours/mois en gestion manuelle de paie. PaieRapide capture ce marché adressable de 2,4M d''entreprises avec un SaaS simple, mobile-first et conforme aux réglementations locales.',
      'problem', 'Absence de solution de paie adaptée aux contraintes réglementaires et monétaires africaines. Les outils existants (Sage, SAP) sont surdimensionnés et ne supportent pas le mobile money.',
      'solution', 'SaaS léger, API-first, intégrant nativement Orange Money, Wave et MTN MoMo. Conformité OHADA intégrée. Déploiement en 48h. Prix 10× inférieur aux alternatives.',
      'value_proposition', '3 jours de gestion manuelle → 30 minutes. 0 erreur de déclaration CNSS. Intégration bancaire sans compte bancaire traditionnel.',
      'key_risks', E'• Risque réglementaire : changements des règles CNSS/SYSCOHADA par pays\n• Risque adoption : résistance des DRH à la digitalisation\n• Risque compétitif : entrée de Wave Pay ou Orange sur le segment paie\n• Risque technique : fragmentation des intégrations mobile money',
      'key_hypotheses', E'• H1 : Les PME acceptent de payer 15 000 FCFA/mois pour automatiser la paie (à tester : landing page + 20 entretiens)\n• H2 : Le cycle de vente B2B moyen est < 2 semaines pour les PME < 50 salariés\n• H3 : L''intégration Wave API est stable et documentée suffisamment pour go-live'
    ),
    TRUE
  ) RETURNING id INTO v_proj_open;

  -- PROJET 3 : Fermé (quorum atteint, en attente de décision)
  INSERT INTO public.projects (
    id, title, description, sector, tags,
    proposant_id, status, quorum_required, quorum_type,
    horizon, barbell_category, governance_speed,
    moic_target, thesis_ids, is_demo
  ) VALUES (
    gen_random_uuid(),
    'TraçaCacao — Traçabilité blockchain filière cacao',
    'Plateforme de traçabilité blockchain pour la filière cacao en Côte d''Ivoire. Permet aux exportateurs de certifier l''origine, les conditions de production (travail des enfants) et la durabilité pour accéder aux primes ESG des acheteurs européens (Nestlé, Barry Callebaut). Modèle : SaaS B2B + commission sur primes capturées.',
    'AgriTech / Blockchain',
    ARRAY['blockchain', 'cacao', 'traçabilité', 'ESG', 'Côte d''Ivoire', 'export'],
    v_admin_id, 'closed', 1, 'absolute',
    'H2', 'growth', 'V2',
    5.8, ARRAY[v_thesis_3], TRUE
  ) RETURNING id INTO v_proj_closed;

  -- PROJET 4 : Décidé — Approuvé
  INSERT INTO public.projects (
    id, title, description, sector, tags,
    proposant_id, status, quorum_required, quorum_type,
    decided_at, repo_url,
    horizon, barbell_category, governance_speed,
    moic_target, thesis_ids, is_demo
  ) VALUES (
    gen_random_uuid(),
    'MediConnect — Téléconsultation médicale Sénégal',
    'Plateforme de télémédecine au Sénégal permettant aux patients en zones périurbaines et rurales de consulter des médecins agréés via WhatsApp et une app mobile légère. Partenariat signé avec 3 cliniques de Dakar. Modèle : abonnement mensuel 5 000 FCFA + consultation unitaire 2 500 FCFA.',
    'Santé digitale',
    ARRAY['télémédecine', 'Sénégal', 'WhatsApp', 'santé', 'B2C'],
    v_admin_id, 'decided', 1, 'absolute',
    NOW() - INTERVAL '45 days',
    'https://github.com/veille-elite/mediconnect-portfolio',
    'H3', 'moonshot', 'V2',
    6.2, ARRAY[v_thesis_4], TRUE
  ) RETURNING id INTO v_proj_appr;

  -- PROJET 5 : Décidé — Rejeté
  INSERT INTO public.projects (
    id, title, description, sector, tags,
    proposant_id, status, quorum_required, quorum_type,
    decided_at,
    horizon, barbell_category, governance_speed,
    moic_target, thesis_ids, is_demo
  ) VALUES (
    gen_random_uuid(),
    'CryptoRemit — Transferts d''argent via stablecoin',
    'Service de transfert d''argent diaspora vers Afrique de l''Ouest en utilisant l''USDC sur Stellar. Frais cible : 0,8 % vs 8–12 % pour Western Union. Intégration mobile money en sortie (Orange Money, Wave). Régulation en cours d''obtention au Sénégal.',
    'FinTech / Crypto',
    ARRAY['stablecoin', 'remittance', 'diaspora', 'Stellar', 'USDC'],
    v_admin_id, 'decided', 1, 'absolute',
    NOW() - INTERVAL '90 days',
    'H1', 'moonshot', 'V2',
    7.5, ARRAY[v_thesis_2], TRUE
  ) RETURNING id INTO v_proj_rej;

  -- ── 3. Évaluations ──────────────────────────────────────────

  -- Évaluation — TraçaCacao (closed, en attente de décision)
  INSERT INTO public.evaluations (project_id, evaluateur_id, scores, commentary, red_team)
  VALUES (
    v_proj_closed, v_admin_id,
    jsonb_build_object(
      v_crit_1::text, 9,
      v_crit_2::text, 7,
      v_crit_3::text, 6,
      v_crit_4::text, 5,
      v_crit_5::text, 8
    ),
    'TraçaCacao répond à une demande réelle et documentée des acheteurs européens post-règlement déforestation UE (EUDR 2023). Le modèle SaaS + commission est élégant et aligné avec les intérêts des exportateurs. Le principal risque est la complexité d''onboarding des coopératives rurales peu digitalisées. L''équipe a cependant une expérience terrain solide sur la filière. Score global solide, recommande de valider le go-to-market avec 3 coopératives pilotes avant la levée Série A.',
    jsonb_build_object(
      'failure_scenario', 'L''EUDR est retardée ou assouplie sous pression des pays producteurs → la demande de traçabilité des acheteurs s''effondre.',
      'hidden_assumption', 'On suppose que les coopératives ont un smartphone et une connexion suffisante. Or 60 % des chefs de coopérative en zones rurales CI utilisent encore des téléphones basiques.',
      'strongest_objection', 'Nestlé et Barry Callebaut ont déjà leurs propres programmes de traçabilité (CocoaAction). Pourquoi paieraient-ils pour une couche tierce ?'
    )
  );

  -- Évaluation — MediConnect (approuvé)
  INSERT INTO public.evaluations (project_id, evaluateur_id, scores, commentary, red_team)
  VALUES (
    v_proj_appr, v_admin_id,
    jsonb_build_object(
      v_crit_1::text, 7,
      v_crit_2::text, 8,
      v_crit_3::text, 7,
      v_crit_4::text, 6,
      v_crit_5::text, 7
    ),
    'MediConnect adresse un gap réel : 1 médecin pour 14 000 habitants au Sénégal. Le partenariat signé avec 3 cliniques de Dakar est un signal fort de validation terrain. Le modèle freemium via WhatsApp évite la barrière de l''app. La vraie question est la rétention : l''abonnement mensuel est le bon levier mais nécessite un plan d''activation solide. Recommande investissement avec milestone validation du taux de renouvellement à 3 mois.',
    jsonb_build_object(
      'failure_scenario', 'L''Ordre des médecins s''oppose à la téléconsultation sans consultation physique préalable. Blocage réglementaire de 18–24 mois.',
      'hidden_assumption', 'La qualité de la connexion en zones périurbaines est suffisante pour une vidéoconsultation WhatsApp (requiert 3G stable).',
      'strongest_objection', 'Le vrai concurrent n''est pas une autre app — c''est WhatsApp utilisé directement par les médecins pour leurs patients (pratique déjà répandue, gratuite, non régulée).'
    )
  );

  -- Évaluation — CryptoRemit (rejeté)
  INSERT INTO public.evaluations (project_id, evaluateur_id, scores, commentary, red_team)
  VALUES (
    v_proj_rej, v_admin_id,
    jsonb_build_object(
      v_crit_1::text, 6,
      v_crit_2::text, 4,
      v_crit_3::text, 3,
      v_crit_4::text, 3,
      v_crit_5::text, 7
    ),
    'Le problème est réel et la proposition de valeur en coût est convaincante. Cependant le risque réglementaire est structurellement bloquant : aucune licence PSAN n''est obtenue en Afrique de l''Ouest, et l''UEMOA a émis des mises en garde contre les stablecoins en 2024. L''intégration mobile money nécessite des partenariats API que l''équipe n''a pas encore signés.',
    jsonb_build_object(
      'failure_scenario', 'Gel des comptes par la BCEAO lors d''une transaction de test → fermeture forcée, perte de réputation pour Veille Élite.',
      'hidden_assumption', 'Wave autorisera une intégration API tierce pour un cas d''usage remittance. Or Wave a historiquement fermé ses API aux concurrents directs.',
      'strongest_objection', 'Wave propose des transferts France → Sénégal à 0 % de frais depuis 2023. Le marché cible est déjà capturé par un acteur 100× plus financé.'
    )
  );

  -- ── 4. Décisions ────────────────────────────────────────────

  INSERT INTO public.decisions (project_id, made_by, decision, rationale)
  VALUES (
    v_proj_appr, v_admin_id, 'approved',
    'MediConnect est approuvé pour un investissement initial de 150 000 € (tranche 1 sur 2). La validation terrain (3 cliniques partenaires, 847 consultations en phase pilote, NPS = 72) est suffisante pour engager les fonds. Condition de la tranche 2 (300 000 €) : franchissement du seuil de 500 abonnés actifs mensuels avec un taux de renouvellement > 60 %. Revue dans 90 jours.'
  );

  INSERT INTO public.decisions (project_id, made_by, decision, rationale)
  VALUES (
    v_proj_rej, v_admin_id, 'rejected',
    'CryptoRemit est rejeté à ce stade. Deux conditions bloquantes : (1) absence de cadre réglementaire BCEAO sur les stablecoins — risque de fermeture forcée non acceptable, (2) absence de letter of intent signée avec Orange Money ou Wave. Le projet pourra être resoumis si : licence PSAN obtenue dans au moins 2 pays UEMOA ET partenariat mobile money signé avec a minima 1 opérateur majeur.'
  );

  -- ── 5. Jalons 100-Day Plan — MediConnect ────────────────────

  INSERT INTO public.project_milestones (project_id, label, target_date, actual_date, value_delta, notes, status)
  VALUES
    (v_proj_appr, 'Signature contrats partenariat 3 cliniques Dakar',
     NOW() - INTERVAL '40 days', NOW() - INTERVAL '42 days', 0,
     'Signé 2 jours avant la date cible. Clinique Sainte-Marie, Clinique du Cap, CHU Fann (convention cadre).', 'achieved'),
    (v_proj_appr, 'Lancement beta privée — 100 premiers utilisateurs',
     NOW() - INTERVAL '20 days', NOW() - INTERVAL '18 days', 0,
     '127 inscrits en 2 semaines. NPS initial = 68. 3 bugs critiques corrigés en J+3.', 'achieved'),
    (v_proj_appr, 'Intégration paiement Orange Money live',
     NOW() + INTERVAL '10 days', NULL, 0,
     'API Orange Money validée en dev. En attente homologation production (délai estimé : 5 jours ouvrés).', 'pending'),
    (v_proj_appr, '500 abonnés actifs mensuels (trigger tranche 2)',
     NOW() + INTERVAL '45 days', NULL, 300000,
     'Condition de déblocage tranche 2 (300 000 €). Rythme actuel : +35 abonnés/semaine → objectif atteignable.', 'pending'),
    (v_proj_appr, 'Seuil de rentabilité unitaire (CAC = LTV)',
     NOW() + INTERVAL '8 months', NULL, 0,
     'Hypothèse : CAC = 8 500 FCFA, LTV sur 18 mois = 90 000 FCFA à taux de rétention 65 %.', 'pending'),
    (v_proj_appr, 'Extension Côte d''Ivoire — 2 cliniques Abidjan',
     NOW() + INTERVAL '12 months', NULL, 0,
     'Jalons J-Curve : expansion géographique M+12 si taux de rétention Sénégal > 60 %.', 'pending');

  -- ── 6. AAR — CryptoRemit (rejeté) ───────────────────────────

  INSERT INTO public.aar_responses (project_id, filled_by, responses)
  VALUES (
    v_proj_rej, v_admin_id,
    jsonb_build_object(
      'what_was_planned', 'Lancer un service de transfert d''argent diaspora → Afrique de l''Ouest via USDC/Stellar avec des frais inférieurs à 1 %. Obtenir la licence PSAN et les partenariats mobile money en 6 mois.',
      'what_actually_happened', 'Le projet a été rejeté après évaluation. La BCEAO a publié en parallèle une circulaire interdisant les transactions en stablecoins sans agrément spécifique. Wave a fermé ses API à tout partenaire concurrent.',
      'what_went_well', '• L''analyse de marché était juste : le problème des frais de transfert est documenté et massif\n• L''équipe a présenté une démo technique fonctionnelle sur Stellar Testnet\n• Le deck financier montrait une bonne maîtrise du unit economics',
      'what_could_be_improved', '• Meilleure due diligence réglementaire avant soumission (BCEAO, UEMOA)\n• Valider les partenariats API (Orange, Wave) avant de passer en évaluation\n• Le MOIC cible de 7,5× suggérait un risque élevé mal pondéré dans le scoring',
      'key_learnings', '• Dans les marchés réglementés, le risque réglementaire doit être évalué en première priorité\n• La concurrence "zéro frais" de Wave rend le modèle de prix difficile à défendre\n• Un projet rejeté pour raisons réglementaires reste resoumissible : créer un système de suivi des jalons',
      'action_items', '• Créer une checklist réglementaire obligatoire pour tous les projets fintech/crypto\n• Suivre l''évolution du cadre BCEAO sur les stablecoins (revue trimestrielle)\n• Recontacter l''équipe dans 12 mois si licence obtenue'
    )
  );

  -- ── 7. Invitations démo ─────────────────────────────────────

  INSERT INTO public.invitations (email, role, invited_by, expires_at, accepted_at)
  VALUES
    ('evaluateur.demo@veille-elite.com', 'evaluateur', v_admin_id, NOW() + INTERVAL '7 days', NOW() - INTERVAL '3 days'),
    ('contributeur.demo@veille-elite.com', 'contributeur', v_admin_id, NOW() + INTERVAL '7 days', NOW() - INTERVAL '2 days'),
    ('marie.diallo@example.com', 'evaluateur', v_admin_id, NOW() - INTERVAL '2 days', NULL),
    ('omar.coulibaly@example.com', 'evaluateur', v_admin_id, NOW() - INTERVAL '5 days', NULL),
    ('fatou.traore@example.com', 'contributeur', v_admin_id, NOW() + INTERVAL '3 days', NULL)
  ON CONFLICT DO NOTHING;

  -- ── 8. Notifications log ─────────────────────────────────────

  INSERT INTO public.notifications_log (recipient_id, channel, type, payload, status)
  VALUES
    (v_admin_id, 'email', 'quorum_reached',
     jsonb_build_object('project_id', v_proj_closed, 'project_title', 'TraçaCacao — Traçabilité blockchain filière cacao'),
     'sent'),
    (v_admin_id, 'email', 'decision_made',
     jsonb_build_object('project_id', v_proj_appr, 'decision', 'approved'),
     'sent'),
    (v_admin_id, 'email', 'decision_made',
     jsonb_build_object('project_id', v_proj_rej, 'decision', 'rejected'),
     'sent'),
    (v_admin_id, 'email', 'evaluation_reminder',
     jsonb_build_object('project_id', v_proj_open, 'project_title', 'PaieRapide — Super-app de paie pour PME francophones'),
     'sent');

  RAISE NOTICE '✅ Seed démo terminé avec succès !';
  RAISE NOTICE '   Admin ID : %', v_admin_id;
  RAISE NOTICE '   4 thèses de portefeuille créées';
  RAISE NOTICE '   5 projets : 1 draft, 1 open, 1 closed, 1 approuvé, 1 rejeté';
  RAISE NOTICE '   3 évaluations, 2 décisions, 6 jalons 100-Day Plan, 1 AAR';
  RAISE NOTICE '   5 invitations';

END;
$$;
