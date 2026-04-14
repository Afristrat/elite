import { createClient } from '@/lib/supabase/server'

export default async function CommitteeCharterPage(): Promise<React.JSX.Element> {
  const supabase = await createClient()

  const { data: settings } = await supabase
    .from('settings')
    .select('key, value')
    .in('key', [
      'platform_name',
      'quorum_default',
      'quorum_type_default',
      'max_members',
      'evaluation_deadline_days',
      'premortem_enabled',
    ])

  const s = Object.fromEntries((settings ?? []).map((r) => [r.key, r.value]))

  const platformName = typeof s.platform_name === 'string' ? s.platform_name : 'Projets Elite'
  const quorumDefault = typeof s.quorum_default === 'number' ? s.quorum_default : 3
  const deadlineDays = typeof s.evaluation_deadline_days === 'number' ? s.evaluation_deadline_days : 7
  const maxMembers = typeof s.max_members === 'number' ? s.max_members : 50
  const premortemEnabled = typeof s.premortem_enabled === 'boolean' ? s.premortem_enabled : false

  return (
    <div className="max-w-[800px] mx-auto">
      {/* En-tête */}
      <header className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <span className="bg-surface-container-highest text-on-surface-variant px-3 py-1 rounded-full text-[0.625rem] font-bold uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-[14px]">lock</span>
            Lecture seule
          </span>
        </div>
        <h1 className="text-4xl font-bold text-on-surface mb-2 tracking-tight">
          Charte du Comité d&apos;Investissement
        </h1>
        <p className="text-on-surface-variant font-medium">
          {platformName} — Document de gouvernance — Version 1.0
        </p>
      </header>

      {/* Sommaire */}
      <section className="bg-surface-container-low p-8 rounded-xl mb-16">
        <h2 className="text-xs text-primary uppercase tracking-[0.2em] mb-6 font-bold">Sommaire</h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: '1. Mandat', href: '#mandat' },
            { label: '2. Composition', href: '#composition' },
            { label: '3. Processus', href: '#processus' },
            { label: '4. Critères', href: '#criteres' },
            { label: '5. Types de décision', href: '#types' },
            { label: '6. Gouvernance', href: '#gouvernance' },
            { label: '7. Révision', href: '#revision' },
          ].map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="text-primary hover:underline flex items-center gap-2 text-sm"
              >
                {item.label}
                <span className="material-symbols-outlined text-[16px]">arrow_right_alt</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* Section 1 — Mandat */}
      <section className="mb-20" id="mandat">
        <CharterSectionHeader num={1} title="Mandat" />
        <div className="bg-surface-container p-8 rounded-xl">
          <p className="text-on-surface-variant leading-relaxed text-sm">
            Le Comité d&apos;Investissement de {platformName} est responsable de l&apos;évaluation
            collective, rigoureuse et transparente des projets soumis par les membres. Chaque décision
            est prise sur la base d&apos;un processus structuré, aveugle et auditable.
          </p>
          <p className="text-on-surface-variant leading-relaxed text-sm mt-4">
            Aucune décision d&apos;investissement ne peut être prise en dehors de ce processus. Les
            décisions enregistrées sur la plateforme constituent l&apos;historique immuable du comité.
          </p>
        </div>
      </section>

      {/* Section 2 — Composition */}
      <section className="mb-20" id="composition">
        <CharterSectionHeader num={2} title="Composition du Comité" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Admin */}
          <div className="bg-surface-container-high border border-primary/20 p-6 rounded-xl hover:-translate-y-1 transition-transform duration-300">
            <div className="flex justify-between items-start mb-4">
              <span className="material-symbols-outlined text-primary text-3xl">admin_panel_settings</span>
              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[0.625rem] font-bold uppercase">
                CORE
              </span>
            </div>
            <h3 className="font-bold text-on-surface mb-2">Administrateur</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Gestion de la plateforme, prise de décision finale, accès aux scores individuels.
            </p>
          </div>

          {/* Évaluateur */}
          <div className="bg-surface-container-low p-6 rounded-xl hover:bg-surface-container transition-colors duration-300">
            <div className="flex justify-between items-start mb-4">
              <span className="material-symbols-outlined text-secondary text-3xl">analytics</span>
            </div>
            <h3 className="font-bold text-on-surface mb-2">Évaluateur</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Soumission de projets, évaluation des projets des autres membres (vote aveugle).
            </p>
          </div>

          {/* Contributeur */}
          <div className="bg-surface-container-low p-6 rounded-xl hover:bg-surface-container transition-colors duration-300">
            <div className="flex justify-between items-start mb-4">
              <span className="material-symbols-outlined text-secondary text-3xl">group_add</span>
            </div>
            <h3 className="font-bold text-on-surface mb-2">Contributeur</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Lecture des projets et décisions. Capacité maximale : {maxMembers} membres actifs.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3 — Processus */}
      <section className="mb-20" id="processus">
        <CharterSectionHeader num={3} title="Processus Décisionnel" />
        <div className="relative pl-8">
          {/* Ligne verticale */}
          <div className="absolute left-[19px] top-2 bottom-2 w-[2px] bg-primary-container/40" />

          {premortemEnabled && (
            <CharterStep
              label="Phase pré-mortem"
              description="Avant l'ouverture à l'évaluation, les membres identifient collectivement les risques potentiels pour anticiper les angles morts."
            />
          )}

          <CharterStep
            label="Ouverture à l'évaluation"
            description={`Le projet est ouvert au vote aveugle. Chaque évaluateur dispose de ${deadlineDays} jours (par défaut) pour soumettre son évaluation.`}
          />

          <CharterStep
            label="Quorum"
            description={`Le quorum est atteint quand ${quorumDefault} évaluateurs (par défaut) ont soumis leur vote. Le proposant ne peut pas évaluer son propre projet.`}
          />

          <CharterStep
            label="Décision"
            description="L'admin prend la décision finale (Approuvé / Rejeté / Différé) avec une justification d'au moins 100 caractères. La décision est immuable une fois enregistrée."
          />

          <CharterStep
            label="Notification"
            description="Tous les évaluateurs et contributeurs sont notifiés de la décision avec la justification complète."
            last
          />
        </div>
      </section>

      {/* Section 4 — Critères */}
      <section className="mb-20" id="criteres">
        <CharterSectionHeader num={4} title="Critères d'Évaluation" />
        <div className="bg-surface-container-low p-10 rounded-xl space-y-6">
          <p className="text-on-surface-variant text-sm leading-relaxed">
            Chaque projet est évalué sur les critères définis par le comité. Chaque critère est noté
            de 0 à 10, avec un poids pondéré. Le score global pondéré est calculé automatiquement.
          </p>
          <p className="text-on-surface-variant text-sm leading-relaxed">
            Les évaluateurs sont encouragés à remplir la section Red Team : argument contre le projet,
            angles morts et conditions de succès.
          </p>
        </div>
      </section>

      {/* Section 5 — Types de décision */}
      <section className="mb-20" id="types">
        <CharterSectionHeader num={5} title="Types de décision" />
        <div className="bg-surface-container p-8 rounded-xl space-y-4">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-na-tertiary-dim shrink-0">check_circle</span>
            <div>
              <p className="text-sm font-semibold text-on-surface">Approuvé</p>
              <p className="text-sm text-on-surface-variant mt-0.5">
                Le projet reçoit le feu vert du comité.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-destructive shrink-0">cancel</span>
            <div>
              <p className="text-sm font-semibold text-on-surface">Rejeté</p>
              <p className="text-sm text-on-surface-variant mt-0.5">
                Le projet ne répond pas aux critères du comité à ce stade.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-on-surface-variant shrink-0">pause_circle</span>
            <div>
              <p className="text-sm font-semibold text-on-surface">Différé</p>
              <p className="text-sm text-on-surface-variant mt-0.5">
                La décision est reportée — une Real Option est configurée (déclencheur, date, valeur).
              </p>
            </div>
          </div>
          <p className="text-sm text-on-surface-variant pt-4 border-t border-outline-variant/10">
            Toute décision nécessite une justification écrite d&apos;au moins 100 caractères. Les
            décisions sont immuables (INSERT ONLY) et constituent l&apos;audit trail du comité.
          </p>
        </div>
      </section>

      {/* Section 6 — Gouvernance */}
      <section className="mb-20" id="gouvernance">
        <CharterSectionHeader num={6} title="Principes de gouvernance" />
        <div className="bg-surface-container p-8 rounded-xl">
          <ul className="space-y-4">
            {[
              {
                icon: 'visibility_off',
                label: 'Vote aveugle',
                desc: "Les scores individuels ne sont visibles que de l'admin avant le quorum.",
              },
              {
                icon: 'policy',
                label: 'Indépendance',
                desc: 'Le proposant ne peut jamais évaluer son propre projet.',
              },
              {
                icon: 'history',
                label: 'Traçabilité',
                desc: 'Toutes les décisions et justifications sont conservées indéfiniment.',
              },
              {
                icon: 'verified_user',
                label: 'Conformité RGPD',
                desc: "Droit à l'effacement disponible (anonymisation des votes — données agrégées préservées).",
              },
              {
                icon: 'lock',
                label: 'Confidentialité',
                desc: "La plateforme est accessible sur invitation uniquement.",
              },
            ].map((item) => (
              <li key={item.label} className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">
                  {item.icon}
                </span>
                <div>
                  <p className="text-sm font-semibold text-on-surface">{item.label}</p>
                  <p className="text-sm text-on-surface-variant mt-0.5">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Section 7 — Révision */}
      <section className="mb-20" id="revision">
        <CharterSectionHeader num={7} title="Révision de la charte" />
        <div className="bg-surface-container p-8 rounded-xl">
          <p className="text-on-surface-variant leading-relaxed text-sm">
            Cette charte est révisable par l&apos;admin depuis les paramètres globaux de la plateforme.
            Toute modification est tracée avec horodatage et identifiant de l&apos;auteur.
          </p>
        </div>
      </section>

      {/* Pied de page */}
      <footer className="mt-32 pt-12 border-t border-outline-variant/20 flex flex-col items-center">
        <p className="text-xs text-on-surface-variant mb-6 uppercase tracking-[0.3em]">
          Document officiel — {platformName}
        </p>
      </footer>
    </div>
  )
}

// ─── Composants utilitaires ───────────────────────────────────────────────────

function CharterSectionHeader({
  num,
  title,
}: {
  num: number
  title: string
}): React.JSX.Element {
  return (
    <div className="flex items-center gap-4 mb-8">
      <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center shrink-0">
        <span className="text-on-primary-container font-bold">{num}</span>
      </div>
      <h2 className="text-2xl font-semibold text-on-surface">{title}</h2>
    </div>
  )
}

function CharterStep({
  label,
  description,
  last = false,
}: {
  label: string
  description: string
  last?: boolean
}): React.JSX.Element {
  return (
    <div className={`relative flex items-start gap-6 group ${last ? '' : 'mb-12'}`}>
      <div className="absolute left-[-26px] w-[14px] h-[14px] rounded-full bg-primary border-4 border-[#080e1a] group-hover:scale-125 transition-transform" />
      <div>
        <h4 className="font-bold text-primary mb-1 uppercase tracking-wider text-xs">{label}</h4>
        <p className="text-on-surface-variant text-sm max-w-lg">{description}</p>
      </div>
    </div>
  )
}
