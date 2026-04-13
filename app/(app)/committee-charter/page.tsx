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

  const platformName = typeof s.platform_name === 'string' ? s.platform_name : 'Veille Élite'
  const quorumDefault = typeof s.quorum_default === 'number' ? s.quorum_default : 3
  const deadlineDays = typeof s.evaluation_deadline_days === 'number' ? s.evaluation_deadline_days : 7
  const maxMembers = typeof s.max_members === 'number' ? s.max_members : 50
  const premortemEnabled = typeof s.premortem_enabled === 'boolean' ? s.premortem_enabled : false

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Charte du Comité d&apos;Investissement</h1>
        <p className="text-gray-400 text-sm mt-1">
          {platformName} — Règles de gouvernance et processus décisionnel
        </p>
      </div>

      {/* Mandat */}
      <CharterSection title="1. Mandat du Comité">
        <p>
          Le Comité d&apos;Investissement de {platformName} est responsable de l&apos;évaluation
          collective, rigoureuse et transparente des projets soumis par les membres. Chaque décision
          est prise sur la base d&apos;un processus structuré, aveugle et auditable.
        </p>
        <p>
          Aucune décision d&apos;investissement ne peut être prise en dehors de ce processus. Les
          décisions enregistrées sur la plateforme constituent l&apos;historique immuable du comité.
        </p>
      </CharterSection>

      {/* Membres */}
      <CharterSection title="2. Composition et rôles">
        <CharterList items={[
          `Capacité maximale : ${maxMembers} membres actifs`,
          'Rôle Admin : gestion de la plateforme, prise de décision finale, accès aux scores individuels',
          'Rôle Évaluateur : soumission de projets, évaluation des projets des autres membres (vote aveugle)',
          'Rôle Contributeur : lecture des projets et décisions, pas d\'évaluation',
          'Chaque membre est invité nominativement — accès fermé sur invitation uniquement',
        ]} />
      </CharterSection>

      {/* Processus */}
      <CharterSection title="3. Processus d'évaluation">
        <div className="space-y-4">
          {premortemEnabled && (
            <CharterStep
              num={1}
              title="Phase pré-mortem"
              description="Avant l'ouverture à l'évaluation, les membres identifient collectivement les risques potentiels pour anticiper les angles morts."
            />
          )}
          <CharterStep
            num={premortemEnabled ? 2 : 1}
            title="Ouverture à l'évaluation"
            description={`Le projet est ouvert au vote aveugle. Chaque évaluateur dispose de ${deadlineDays} jours (par défaut) pour soumettre son évaluation.`}
          />
          <CharterStep
            num={premortemEnabled ? 3 : 2}
            title="Quorum"
            description={`Le quorum est atteint quand ${quorumDefault} évaluateurs (par défaut) ont soumis leur vote. Le proposant ne peut pas évaluer son propre projet.`}
          />
          <CharterStep
            num={premortemEnabled ? 4 : 3}
            title="Décision"
            description="L'admin prend la décision finale (Approuvé / Rejeté / Différé) avec une justification d'au moins 100 caractères. La décision est immuable une fois enregistrée."
          />
          <CharterStep
            num={premortemEnabled ? 5 : 4}
            title="Notification"
            description="Tous les évaluateurs et contributeurs sont notifiés de la décision avec la justification complète."
          />
        </div>
      </CharterSection>

      {/* Critères d'évaluation */}
      <CharterSection title="4. Critères d'évaluation">
        <p>
          Chaque projet est évalué sur les critères définis par le comité (ou des critères spécifiques
          au projet). Chaque critère est noté de 0 à 10, avec un poids pondéré. Le score global
          pondéré est calculé automatiquement.
        </p>
        <p>
          Les évaluateurs sont encouragés à remplir la section Red Team : argument contre le projet,
          angles morts et conditions de succès.
        </p>
      </CharterSection>

      {/* Types de décision */}
      <CharterSection title="5. Types de décision">
        <CharterList items={[
          'Approuvé ✓ : le projet reçoit le feu vert du comité',
          'Rejeté ✗ : le projet ne répond pas aux critères du comité à ce stade',
          'Différé ⏸ : la décision est reportée — une Real Option est configurée (déclencheur, date, valeur)',
        ]} />
        <p>
          Toute décision nécessite une justification écrite d&apos;au moins 100 caractères.
          Les décisions sont immuables (INSERT ONLY) et constituent l&apos;audit trail du comité.
        </p>
      </CharterSection>

      {/* Gouvernance */}
      <CharterSection title="6. Principes de gouvernance">
        <CharterList items={[
          'Vote aveugle : les scores individuels ne sont visibles que de l\'admin avant le quorum',
          'Indépendance : le proposant ne peut jamais évaluer son propre projet',
          'Traçabilité : toutes les décisions et justifications sont conservées indéfiniment',
          'Conformité RGPD : droit à l\'effacement disponible (anonymisation des votes — données agrégées préservées)',
          'Confidentialité : la plateforme est accessible sur invitation uniquement',
        ]} />
      </CharterSection>

      {/* Révision */}
      <CharterSection title="7. Révision de la charte">
        <p>
          Cette charte est révisable par l&apos;admin depuis les paramètres globaux de la plateforme.
          Toute modification est tracée avec horodatage et identifiant de l&apos;auteur.
        </p>
      </CharterSection>
    </div>
  )
}

// ─── Composants utilitaires ───────────────────────────────────────────────────

function CharterSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold text-white border-b border-gray-800 pb-2">{title}</h2>
      <div className="text-sm text-gray-400 leading-relaxed space-y-2">{children}</div>
    </section>
  )
}

function CharterList({ items }: { items: string[] }): React.JSX.Element {
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2">
          <span className="text-gray-600 shrink-0">—</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function CharterStep({
  num,
  title,
  description,
}: {
  num: number
  title: string
  description: string
}): React.JSX.Element {
  return (
    <div className="flex gap-4">
      <div className="w-7 h-7 rounded-full bg-blue-600/20 border border-blue-800 flex items-center justify-center shrink-0">
        <span className="text-xs font-bold text-blue-400">{num}</span>
      </div>
      <div className="space-y-0.5 pt-0.5">
        <p className="text-sm font-medium text-gray-200">{title}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  )
}
