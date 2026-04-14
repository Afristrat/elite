import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'
import { DecisionModal } from '@/components/decisions/decision-modal'
import type { Database } from '@/types/database'

type ProjectStatus = Database['public']['Enums']['project_status']
type UserRole = Database['public']['Enums']['user_role']

type ResultsPageProps = {
  params: Promise<{ id: string }>
}

type ScoresRecord = Record<string, number>
type RedTeamData = {
  strongest_argument_against?: string
  blind_spots?: string
  conditions_for_success?: string
}

export default async function ResultsPage({ params }: ResultsPageProps): Promise<React.JSX.Element> {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user!.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  const { data: project } = await supabase
    .from('projects')
    .select('id, title, status, proposant_id, quorum_required, quorum_type')
    .eq('id', id)
    .single()

  if (!project) notFound()

  // Contributeurs ne voient pas les résultats avant décision
  const canSeeResults: Record<ProjectStatus, boolean> = {
    draft: false,
    'pre-mortem': false,
    open: isAdmin,
    closed: true,
    decided: true,
    archived: true,
  }

  if (!canSeeResults[project.status]) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center space-y-2">
        <p className="text-gray-300 font-medium">Résultats non disponibles</p>
        <p className="text-gray-500 text-sm">
          {project.status === 'open'
            ? 'Les résultats seront visibles une fois le quorum atteint'
            : 'Ce projet n\'est pas encore en phase de résultats'}
        </p>
      </div>
    )
  }

  // Récupérer les évaluations — deux requêtes distinctes selon le rôle (Supabase parse statiquement le select)
  const { data: evaluations } = await supabase
    .from('evaluations')
    .select('id, scores, commentary, red_team, submitted_at, evaluateur_id')
    .eq('project_id', id)
    .order('submitted_at')

  // Pour admin : noms des évaluateurs via profiles
  type EvaluatorProfile = { id: string; full_name: string | null; email: string }
  let evaluatorProfiles: EvaluatorProfile[] = []
  if (isAdmin && evaluations?.length) {
    const ids = evaluations.map((e) => e.evaluateur_id).filter(Boolean) as string[]
    if (ids.length) {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', ids)
      evaluatorProfiles = profilesData ?? []
    }
  }

  // Récupérer les critères
  const { data: projectCriteria } = await supabase
    .from('evaluation_criteria')
    .select('id, label, weight, order_index')
    .eq('project_id', id)
    .order('order_index')

  const { data: defaultCriteria } = await supabase
    .from('evaluation_criteria')
    .select('id, label, weight, order_index')
    .is('project_id', null)
    .order('order_index')

  const criteria = (projectCriteria?.length ? projectCriteria : defaultCriteria) ?? []

  // Récupérer les stats de la vue
  const { data: stats } = await supabase
    .from('project_evaluation_stats')
    .select('*')
    .eq('project_id', id)
    .single()

  if (!evaluations?.length) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
        <p className="text-gray-500 text-sm">Aucune évaluation soumise pour l&apos;instant</p>
      </div>
    )
  }

  // Calcul des scores agrégés par critère
  const criteriaAverages = criteria.map((criterion) => {
    const criterionScores = evaluations
      .map((e) => {
        const scores = e.scores as ScoresRecord
        return scores[criterion.id]
      })
      .filter((s): s is number => s !== undefined && s !== null)

    const avg = criterionScores.length > 0
      ? criterionScores.reduce((a, b) => a + b, 0) / criterionScores.length
      : null

    return { ...criterion, avg, count: criterionScores.length }
  })

  // Score global pondéré
  const globalScore = criteriaAverages.every((c) => c.avg !== null)
    ? criteriaAverages.reduce((acc, c) => acc + (c.avg ?? 0) * (c.weight / 100), 0)
    : stats?.avg_score ?? null

  // Agrégat Red Team
  const redTeamResponses = evaluations
    .map((e) => e.red_team as RedTeamData | null)
    .filter((r): r is RedTeamData => r !== null && Object.keys(r).length > 0)

  const quorumReached = stats?.quorum_reached ?? false

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href={`/projects/${id}`} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
            ← Retour au projet
          </Link>
          <h1 className="text-xl font-bold text-white mt-2">Résultats — {project.title}</h1>
        </div>

        {isAdmin && project.status === 'closed' && (
          <DecisionModal
            projectId={id}
            projectTitle={project.title}
            globalScore={globalScore}
          />
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Score global"
          value={globalScore !== null ? `${globalScore.toFixed(2)} / 10` : '—'}
          highlight
        />
        <StatCard
          label="Évaluations"
          value={`${evaluations.length} / ${project.quorum_required}`}
        />
        <StatCard
          label="Quorum"
          value={quorumReached ? 'Atteint ✓' : 'En cours…'}
          highlight={quorumReached}
        />
      </div>

      {/* Scores par critère */}
      {criteria.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-200">Scores par critère</h2>

          <div className="space-y-3">
            {criteriaAverages.map((criterion) => (
              <div key={criterion.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-300 font-medium">{criterion.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500">Poids : {criterion.weight}%</span>
                    <span className={cn('font-bold', getScoreColor(criterion.avg))}>
                      {criterion.avg !== null ? criterion.avg.toFixed(1) : '—'} / 10
                    </span>
                  </div>
                </div>
                {criterion.avg !== null && (
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all', getScoreBarColor(criterion.avg))}
                      style={{ width: `${(criterion.avg / 10) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Red Team agrégé */}
      {redTeamResponses.length > 0 && (
        <div className="bg-red-950/20 border border-red-900/50 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-red-300">
            🔴 Red Team — {redTeamResponses.length} contribution{redTeamResponses.length > 1 ? 's' : ''}
          </h2>

          <div className="space-y-4">
            {redTeamResponses.map((rt, i) => (
              <div key={i} className="border-t border-red-900/30 pt-4 space-y-2 first:border-0 first:pt-0">
                {rt.strongest_argument_against && (
                  <div>
                    <p className="text-xs text-red-400 font-medium mb-1">Argument contre</p>
                    <p className="text-sm text-gray-300">{rt.strongest_argument_against}</p>
                  </div>
                )}
                {rt.blind_spots && (
                  <div>
                    <p className="text-xs text-orange-400 font-medium mb-1">Angles morts</p>
                    <p className="text-sm text-gray-300">{rt.blind_spots}</p>
                  </div>
                )}
                {rt.conditions_for_success && (
                  <div>
                    <p className="text-xs text-yellow-400 font-medium mb-1">Conditions de succès</p>
                    <p className="text-sm text-gray-300">{rt.conditions_for_success}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Commentaires (anonymisés ou avec noms si admin) */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-200">
          Commentaires ({evaluations.length})
        </h2>

        <div className="space-y-4">
          {evaluations.map((evaluation, i) => {
            const scoreRecord = evaluation.scores as ScoresRecord
            const evalGlobalScore = criteria.length > 0
              ? criteria.reduce((acc, c) => {
                  const s = scoreRecord[c.id]
                  return acc + (s !== undefined ? s * (c.weight / 100) : 0)
                }, 0)
              : null

            const evaluatorProfile = isAdmin
              ? evaluatorProfiles.find((p) => p.id === evaluation.evaluateur_id)
              : null
            const evaluatorName = evaluatorProfile
              ? (evaluatorProfile.full_name ?? evaluatorProfile.email)
              : `Évaluateur ${i + 1}`

            return (
              <div key={evaluation.id} className="border-t border-gray-800 pt-4 first:border-0 first:pt-0 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-gray-300">{evaluatorName}</span>
                  <div className="flex items-center gap-2">
                    {evalGlobalScore !== null && (
                      <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', getScoreBadge(evalGlobalScore))}>
                        {evalGlobalScore.toFixed(1)} / 10
                      </span>
                    )}
                    <span className="text-xs text-gray-600">
                      {new Date(evaluation.submitted_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">{evaluation.commentary}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getScoreColor(score: number | null): string {
  if (score === null) return 'text-gray-500'
  if (score >= 8) return 'text-green-400'
  if (score >= 6) return 'text-blue-400'
  if (score >= 4) return 'text-yellow-400'
  return 'text-red-400'
}

function getScoreBarColor(score: number): string {
  if (score >= 8) return 'bg-green-500'
  if (score >= 6) return 'bg-blue-500'
  if (score >= 4) return 'bg-yellow-500'
  return 'bg-red-500'
}

function getScoreBadge(score: number): string {
  if (score >= 8) return 'bg-green-600/20 text-green-300'
  if (score >= 6) return 'bg-blue-600/20 text-blue-300'
  if (score >= 4) return 'bg-yellow-600/20 text-yellow-300'
  return 'bg-red-600/20 text-red-300'
}

function StatCard({
  label,
  value,
  highlight = false,
}: {
  label: string
  value: string
  highlight?: boolean
}): React.JSX.Element {
  return (
    <div className={cn('bg-gray-900 border rounded-xl p-4', highlight ? 'border-blue-800' : 'border-gray-800')}>
      <p className="text-xs text-gray-500">{label}</p>
      <p className={cn('text-lg font-bold mt-1', highlight ? 'text-blue-400' : 'text-white')}>{value}</p>
    </div>
  )
}

// Type pour le rôle — non utilisé directement mais nécessaire pour la type-safety
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _UserRole = UserRole
