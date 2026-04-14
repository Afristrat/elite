import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

type PlanPageProps = {
  params: Promise<{ id: string }>
}

type InvestmentThesis = {
  statement?: string
  hypotheses?: [string, string, string]
}

// Template standard 100 jours — 3 phases de 33 jours
const PHASES = [
  {
    phase: 1,
    days: '1–30',
    label: 'Diagnostic & Alignement',
    color: 'border-blue-900/50 bg-blue-950/10',
    headerColor: 'text-blue-400',
    tasks: [
      'Audit complet des ressources disponibles et contraintes',
      'Rencontre individuelle avec toutes les parties prenantes clés',
      'Revue du modèle financier et validation des hypothèses critiques',
      'Définition des OKRs pour les 100 jours',
      'Mise en place des outils de suivi et reporting',
    ],
  },
  {
    phase: 2,
    days: '31–70',
    label: 'Exécution & Apprentissage',
    color: 'border-yellow-900/50 bg-yellow-950/10',
    headerColor: 'text-yellow-400',
    tasks: [
      'Lancement des 3 premières initiatives prioritaires',
      'Recrutement ou mobilisation des compétences manquantes',
      'Premier point de traction : validation d\'une hypothèse clé',
      'Ajustement du modèle si les données contredisent les hypothèses',
      'Communication intermédiaire aux parties prenantes',
    ],
  },
  {
    phase: 3,
    days: '71–100',
    label: 'Consolidation & Reporting',
    color: 'border-green-900/50 bg-green-950/10',
    headerColor: 'text-green-400',
    tasks: [
      'Bilan quantitatif des OKRs vs objectifs',
      'Revue des hypothèses : confirmées, infirmées, en cours',
      'Présentation des résultats au Comité d\'Investissement',
      'Plan pour la prochaine période (J+101 à J+180)',
      'Documentation des apprentissages pour l\'After Action Review',
    ],
  },
]

export default async function Plan100DaysPage({ params }: PlanPageProps): Promise<React.JSX.Element> {
  const { id } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from('projects')
    .select('id, title, status, investment_thesis, sector')
    .eq('id', id)
    .single()

  if (!project) notFound()

  const { data: decision } = await supabase
    .from('decisions')
    .select('decision, created_at, rationale')
    .eq('project_id', id)
    .eq('decision', 'approved')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!decision) {
    return (
      <div className="space-y-4">
        <Link href={`/projects/${id}`} className="text-xs text-on-surface-variant hover:text-on-surface transition-colors">
          ← Retour au projet
        </Link>
        <div className="bg-surface-container border border-border/10 rounded-xl p-8 text-center">
          <p className="text-muted-foreground text-sm">Le 100-Day Plan est disponible après approbation du projet</p>
        </div>
      </div>
    )
  }

  const approvalDate = new Date(decision.created_at)
  const day100 = new Date(approvalDate.getTime() + 100 * 24 * 60 * 60 * 1000)
  const now = new Date()
  const currentDay = Math.floor((now.getTime() - approvalDate.getTime()) / (1000 * 60 * 60 * 24))
  const daysLeft = Math.max(0, 100 - currentDay)

  const thesis = project.investment_thesis as InvestmentThesis | null

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link href={`/projects/${id}`} className="text-xs text-on-surface-variant hover:text-on-surface transition-colors">
          ← Retour au projet
        </Link>
        <h1 className="text-xl font-bold text-on-surface mt-2">100-Day Plan — {project.title}</h1>
        <p className="text-on-surface-variant text-sm mt-1">
          Approuvé le{' '}
          {approvalDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
          {' · '}
          J+100 le{' '}
          {day100.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Compteur */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-surface-container border border-border/10 rounded-xl p-4">
          <p className="text-xs text-on-surface-variant">Jour actuel</p>
          <p className="text-2xl font-bold text-on-surface mt-1">
            {`J+${currentDay}`}
          </p>
        </div>
        <div className={`border rounded-xl p-4 ${daysLeft > 30 ? 'bg-surface-container border-border/10' : daysLeft > 0 ? 'bg-na-secondary-container/20 border-na-secondary/30' : 'bg-na-tertiary-container/10 border-na-tertiary-dim/30'}`}>
          <p className="text-xs text-on-surface-variant">Jours restants</p>
          <p className={`text-2xl font-bold mt-1 ${daysLeft > 30 ? 'text-on-surface' : daysLeft > 0 ? 'text-na-secondary' : 'text-na-tertiary-dim'}`}>
            {daysLeft > 0 ? daysLeft : '✓ Terminé'}
          </p>
        </div>
        <div className="bg-surface-container border border-border/10 rounded-xl p-4">
          <p className="text-xs text-on-surface-variant">Progression</p>
          <div className="mt-2 h-2 bg-surface-container-high rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${Math.min(100, (currentDay / 100) * 100)}%` }}
            />
          </div>
          <p className="text-xs text-on-surface-variant mt-1">{Math.min(100, currentDay)}%</p>
        </div>
      </div>

      {/* Hypothèses de la thèse */}
      {thesis?.hypotheses && (
        <div className="bg-surface-container border border-border/10 rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-semibold text-on-surface">Hypothèses à valider pendant les 100 jours</h2>
          <div className="space-y-2">
            {thesis.hypotheses.map((h, i) => (
              <div key={i} className="flex gap-3 items-start">
                <span className="w-5 h-5 rounded-full border border-border flex items-center justify-center text-xs text-on-surface-variant shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-on-surface-variant">{h}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Phases */}
      <div className="space-y-4">
        {PHASES.map((phase) => {
          const phaseStart = (phase.phase - 1) * 33
          const phaseEnd = phase.phase === 3 ? 100 : phase.phase * 33
          const inPhase = currentDay >= phaseStart && currentDay <= phaseEnd
          const phaseComplete = currentDay > phaseEnd

          return (
            <div key={phase.phase} className={`rounded-xl border p-5 space-y-3 ${phase.color} ${phaseComplete ? 'opacity-70' : ''}`}>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${phase.headerColor} border ${phase.color.split(' ')[0]}`}>
                  Phase {phase.phase}
                </span>
                <span className={`text-sm font-semibold ${phase.headerColor}`}>{phase.label}</span>
                <span className="text-xs text-on-surface-variant/50 ml-auto">Jours {phase.days}</span>
                {inPhase && <span className="text-xs text-on-surface bg-primary px-2 py-0.5 rounded-full">En cours</span>}
                {phaseComplete && <span className="text-xs text-na-tertiary-dim">✓</span>}
              </div>

              <ul className="space-y-2">
                {phase.tasks.map((task, i) => (
                  <li key={i} className="flex gap-2 text-sm text-on-surface-variant">
                    <span className="text-on-surface-variant/40 shrink-0">—</span>
                    {task}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}
