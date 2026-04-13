import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { runPrometheeII } from '@/lib/analytics/promethee'
import type { Project as PrometheePrjoject, Criterion } from '@/lib/analytics/promethee'

export default async function AnalyticsPage(): Promise<React.JSX.Element> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user!.id)
    .single()

  // Analytics admin uniquement
  if (profile?.role !== 'admin') notFound()

  // Projets avec quorum atteint (closed ou decided)
  const { data: projects } = await supabase
    .from('projects')
    .select('id, title, sector, horizon, barbell_category, moic_target, status')
    .in('status', ['closed', 'decided'])
    .order('created_at', { ascending: false })

  if (!projects?.length) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics — PROMETHEE II</h1>
          <p className="text-gray-400 text-sm mt-1">Ranking multi-critères des projets</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <p className="text-gray-500 text-sm">Aucun projet avec quorum atteint</p>
          <p className="text-gray-600 text-xs mt-1">
            Le ranking sera disponible dès que 2 projets auront atteint le quorum
          </p>
        </div>
      </div>
    )
  }

  // Critères par défaut
  const { data: defaultCriteria } = await supabase
    .from('evaluation_criteria')
    .select('id, label, weight, order_index')
    .is('project_id', null)
    .order('order_index')

  const criteria: Criterion[] = (defaultCriteria ?? []).map((c) => ({
    id: c.id,
    label: c.label,
    weight: c.weight,
    preferenceFunction: 'linear' as const,
    threshold: 3,
  }))

  // Scores moyens par projet (depuis la vue)
  const { data: statsRows } = await supabase
    .from('project_evaluation_stats')
    .select('project_id, avg_score, evaluation_count')
    .in('project_id', projects.map((p) => p.id))

  const statsMap = Object.fromEntries((statsRows ?? []).map((s) => [s.project_id, s]))

  // Évaluations pour les scores par critère
  const { data: evaluations } = await supabase
    .from('evaluations')
    .select('project_id, scores')
    .in('project_id', projects.map((p) => p.id))

  // Calculer scores moyens par critère par projet
  type ScoresRecord = Record<string, number>
  const projectScores: Record<string, Record<string, number>> = {}

  for (const project of projects) {
    const projectEvals = (evaluations ?? []).filter((e) => e.project_id === project.id)
    const scores: Record<string, number> = {}

    for (const crit of criteria) {
      const critScores = projectEvals
        .map((e) => {
          const s = e.scores as ScoresRecord
          return s[crit.id]
        })
        .filter((s): s is number => s !== undefined && s !== null)

      scores[crit.id] = critScores.length > 0
        ? critScores.reduce((a, b) => a + b, 0) / critScores.length
        : 0
    }

    projectScores[project.id] = scores
  }

  // Construire les données pour PROMETHEE
  const prometheProjects: PrometheePrjoject[] = projects.map((p) => ({
    id: p.id,
    title: p.title,
    scores: projectScores[p.id] ?? {},
  }))

  const ranking = criteria.length >= 2
    ? runPrometheeII(prometheProjects, criteria)
    : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics — PROMETHEE II</h1>
        <p className="text-gray-400 text-sm mt-1">
          Ranking multi-critères de {projects.length} projet{projects.length > 1 ? 's' : ''} avec quorum
        </p>
      </div>

      {!ranking || ranking.length < 2 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
          <p className="text-gray-500 text-sm">
            {criteria.length < 2
              ? 'Critères insuffisants pour le calcul PROMETHEE (minimum 2 critères)'
              : 'Données insuffisantes — minimum 2 projets avec évaluations'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Podium top 3 */}
          {ranking.length >= 3 && (
            <div className="grid grid-cols-3 gap-4">
              {ranking.slice(0, 3).map((r, i) => (
                <div
                  key={r.projectId}
                  className={cn(
                    'rounded-xl border p-4 text-center space-y-2',
                    i === 0 ? 'border-yellow-700 bg-yellow-950/20' :
                    i === 1 ? 'border-gray-600 bg-gray-900' :
                    'border-orange-900 bg-orange-950/10'
                  )}
                >
                  <p className="text-2xl">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</p>
                  <Link
                    href={`/projects/${r.projectId}`}
                    className="text-sm font-semibold text-white hover:text-blue-300 transition-colors line-clamp-2 block"
                  >
                    {r.title}
                  </Link>
                  <p className={cn(
                    'text-xl font-bold',
                    r.phi > 0 ? 'text-green-400' : r.phi < 0 ? 'text-red-400' : 'text-gray-400'
                  )}>
                    Φ = {r.phi.toFixed(3)}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Tableau complet */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">Rang</th>
                  <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">Projet</th>
                  <th className="text-right text-xs text-gray-500 font-medium px-4 py-3">Φ net</th>
                  <th className="text-right text-xs text-gray-500 font-medium px-4 py-3">Φ+</th>
                  <th className="text-right text-xs text-gray-500 font-medium px-4 py-3">Φ−</th>
                  <th className="text-right text-xs text-gray-500 font-medium px-4 py-3">Score moy.</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((r) => {
                  const stats = statsMap[r.projectId]
                  return (
                    <tr key={r.projectId} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <span className={cn(
                          'text-sm font-bold',
                          r.rank === 1 ? 'text-yellow-400' :
                          r.rank === 2 ? 'text-gray-400' :
                          r.rank === 3 ? 'text-orange-400' : 'text-gray-600'
                        )}>
                          #{r.rank}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/projects/${r.projectId}`}
                          className="text-sm text-white hover:text-blue-300 transition-colors"
                        >
                          {r.title}
                        </Link>
                        {stats && (
                          <p className="text-xs text-gray-600 mt-0.5">{stats.evaluation_count ?? 0} évaluations</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={cn(
                          'text-sm font-semibold',
                          r.phi > 0 ? 'text-green-400' : r.phi < 0 ? 'text-red-400' : 'text-gray-400'
                        )}>
                          {r.phi > 0 ? '+' : ''}{r.phi.toFixed(3)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-green-400">{r.phiPlus.toFixed(3)}</td>
                      <td className="px-4 py-3 text-right text-xs text-red-400">{r.phiMinus.toFixed(3)}</td>
                      <td className="px-4 py-3 text-right text-xs text-gray-400">
                        {stats?.avg_score !== null && stats?.avg_score !== undefined
                          ? `${Number(stats.avg_score).toFixed(1)} / 10`
                          : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-gray-600">
            PROMETHEE II — Φ net = Φ+ (force) − Φ− (faiblesse) · Critères : {criteria.map((c) => `${c.label} (${c.weight}%)`).join(', ')}
          </p>
        </div>
      )}
    </div>
  )
}
