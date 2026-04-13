import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

type JCurvePageProps = {
  params: Promise<{ id: string }>
}

type Scenario = {
  probability?: number
  moic?: number
  description?: string
}

type Scenarios = {
  pessimistic?: Scenario
  realistic?: Scenario
  optimistic?: Scenario
}

// Jalons J-Curve standardisés pour un projet d'investissement
const JCURVE_MILESTONES = [
  { month: 0, label: 'Approbation', phase: 'Lancement', value: 0 },
  { month: 3, label: 'J+90 : Setup', phase: 'Déploiement', value: -15 },
  { month: 6, label: 'J+180 : Opérations', phase: 'Déploiement', value: -10 },
  { month: 12, label: 'J+1an : Traction', phase: 'Croissance', value: 20 },
  { month: 24, label: 'J+2ans : Scale', phase: 'Croissance', value: 60 },
  { month: 36, label: 'J+3ans : Maturité', phase: 'Maturité', value: 100 },
]

export default async function JCurvePage({ params }: JCurvePageProps): Promise<React.JSX.Element> {
  const { id } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from('projects')
    .select('id, title, status, scenarios, moic_target, investment_thesis')
    .eq('id', id)
    .single()

  if (!project) notFound()

  if (project.status !== 'decided' && project.status !== 'archived') {
    return (
      <div className="space-y-4">
        <Link href={`/projects/${id}`} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
          ← Retour au projet
        </Link>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
          <p className="text-gray-500 text-sm">La J-Curve est disponible après la décision finale</p>
        </div>
      </div>
    )
  }

  const { data: decision } = await supabase
    .from('decisions')
    .select('decision, created_at')
    .eq('project_id', id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (decision?.decision !== 'approved') {
    return (
      <div className="space-y-4">
        <Link href={`/projects/${id}`} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
          ← Retour au projet
        </Link>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
          <p className="text-gray-500 text-sm">La J-Curve s&apos;applique uniquement aux projets approuvés</p>
        </div>
      </div>
    )
  }

  const approvalDate = new Date(decision.created_at)
  const now = new Date()
  const monthsSinceApproval = Math.floor(
    (now.getTime() - approvalDate.getTime()) / (1000 * 60 * 60 * 24 * 30),
  )

  const scenarios = project.scenarios as Scenarios | null
  const moicTarget = project.moic_target

  // Calculer le MOIC projeté selon les scénarios
  const realisticMoic = scenarios?.realistic?.moic ?? moicTarget ?? 2

  // Jalons avec MOIC projeté
  const milestones = JCURVE_MILESTONES.map((m) => ({
    ...m,
    projectedMoic: 1 + (m.value / 100) * (realisticMoic - 1),
    reached: m.month <= monthsSinceApproval,
  }))

  const currentMilestone = milestones.filter((m) => m.reached).pop()
  const nextMilestone = milestones.find((m) => !m.reached)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link href={`/projects/${id}`} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
          ← Retour au projet
        </Link>
        <h1 className="text-xl font-bold text-white mt-2">
          J-Curve — {project.title}
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Courbe de valeur post-approbation · Approuvé le{' '}
          {approvalDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Statut actuel */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500">Mois depuis approbation</p>
          <p className="text-2xl font-bold text-white mt-1">{monthsSinceApproval}</p>
        </div>
        <div className="bg-gray-900 border border-green-800 rounded-xl p-4">
          <p className="text-xs text-gray-500">Phase actuelle</p>
          <p className="text-lg font-bold text-green-400 mt-1">{currentMilestone?.phase ?? 'Lancement'}</p>
        </div>
        <div className="bg-gray-900 border border-blue-800 rounded-xl p-4">
          <p className="text-xs text-gray-500">MOIC cible</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">{moicTarget ?? '—'}×</p>
        </div>
      </div>

      {/* Visualisation J-Curve */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-200">Jalons de valeur</h2>

        <div className="relative">
          {/* Axe horizontal */}
          <div className="flex items-stretch gap-0">
            {milestones.map((m, i) => (
              <div
                key={m.month}
                className="flex-1 flex flex-col items-center"
              >
                {/* Barre valeur */}
                <div className="w-full flex justify-center mb-2">
                  <div
                    className={`w-8 rounded-t-sm transition-all ${
                      m.reached
                        ? m.value >= 0 ? 'bg-green-600' : 'bg-red-600/70'
                        : 'bg-gray-800'
                    }`}
                    style={{
                      height: `${Math.abs(m.value) * 0.8 + 8}px`,
                      marginTop: m.value >= 0 ? 'auto' : '0',
                    }}
                  />
                </div>

                {/* Indicateur atteint */}
                <div className={`w-2.5 h-2.5 rounded-full border-2 ${
                  m.reached
                    ? 'bg-green-500 border-green-400'
                    : i === milestones.findIndex((x) => !x.reached)
                      ? 'bg-blue-900 border-blue-500 animate-pulse'
                      : 'bg-gray-800 border-gray-700'
                }`} />

                {/* Label */}
                <p className="text-xs text-gray-600 mt-2 text-center leading-tight hidden sm:block">
                  J+{m.month > 0 ? m.month * 30 : 0}
                </p>
                <p className="text-xs text-gray-500 text-center leading-tight mt-0.5 hidden md:block">
                  {m.label.split(' : ')[1] ?? m.label}
                </p>
                <p className={`text-xs font-semibold text-center mt-0.5 ${
                  m.value >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {m.projectedMoic.toFixed(2)}×
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Prochain jalon */}
      {nextMilestone && (
        <div className="bg-blue-950/20 border border-blue-900/40 rounded-xl p-4 space-y-1">
          <p className="text-xs font-semibold text-blue-400 uppercase tracking-wide">Prochain jalon</p>
          <p className="text-sm font-medium text-white">{nextMilestone.label}</p>
          <p className="text-xs text-gray-500">
            Dans ~{nextMilestone.month - monthsSinceApproval} mois — MOIC projeté : {nextMilestone.projectedMoic.toFixed(2)}×
          </p>
        </div>
      )}

      {/* Scénarios Monte Carlo */}
      {scenarios && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-semibold text-gray-200">Scénarios à terme</h2>
          <div className="grid grid-cols-3 gap-4">
            {(
              [
                { key: 'pessimistic', label: 'Pessimiste', color: 'text-red-400' },
                { key: 'realistic', label: 'Réaliste', color: 'text-blue-400' },
                { key: 'optimistic', label: 'Optimiste', color: 'text-green-400' },
              ] as const
            ).map(({ key, label, color }) => {
              const s = scenarios[key]
              if (!s) return null
              return (
                <div key={key} className="text-center space-y-1">
                  <p className="text-xs text-gray-500">{label}</p>
                  {s.moic && <p className={`text-xl font-bold ${color}`}>{s.moic}×</p>}
                  {s.probability && <p className="text-xs text-gray-600">{s.probability}%</p>}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
