import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Database } from '@/types/database'

type ProjectHorizon = Database['public']['Enums']['project_horizon']
type BarbellCat = Database['public']['Enums']['barbell_cat']
type DecisionType = Database['public']['Enums']['decision_type']

export default async function PortfolioReviewPage(): Promise<React.JSX.Element> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user!.id)
    .single()

  if (profile?.role !== 'admin') notFound()

  // Tous les projets non-draft
  const { data: projects } = await supabase
    .from('projects')
    .select('id, title, status, horizon, barbell_category, moic_target, sector, created_at, decided_at')
    .not('status', 'eq', 'draft')
    .order('created_at', { ascending: false })

  // Décisions
  const { data: decisions } = await supabase
    .from('decisions')
    .select('id, decision, project_id, created_at')
    .order('created_at', { ascending: false })

  // Évaluations stats
  const { data: stats } = await supabase
    .from('project_evaluation_stats')
    .select('project_id, avg_score, evaluation_count, quorum_reached')

  const allProjects = projects ?? []
  const allDecisions = decisions ?? []
  const statsMap = Object.fromEntries((stats ?? []).map((s) => [s.project_id, s]))

  // ─── Métriques globales
  const totalProjects = allProjects.length
  const decided = allProjects.filter((p) => p.status === 'decided' || p.status === 'archived')
  const approved = allDecisions.filter((d) => d.decision === 'approved').length
  const battingAverage = allDecisions.length > 0
    ? Math.round((approved / allDecisions.length) * 100)
    : null

  // ─── MOIC moyen des projets approuvés
  const approvedProjects = allProjects.filter((p) =>
    allDecisions.find((d) => d.project_id === p.id && d.decision === 'approved'),
  )
  const moicValues = approvedProjects.map((p) => p.moic_target).filter((m): m is number => m !== null)
  const avgMoicTarget = moicValues.length > 0
    ? moicValues.reduce((a, b) => a + b, 0) / moicValues.length
    : null

  // ─── Distribution horizons
  const horizonCounts: Record<string, number> = {}
  for (const p of allProjects) {
    if (p.horizon) horizonCounts[p.horizon] = (horizonCounts[p.horizon] ?? 0) + 1
  }

  // ─── Distribution barbell
  const barbellCounts: Record<string, number> = {}
  for (const p of allProjects) {
    if (p.barbell_category) barbellCounts[p.barbell_category] = (barbellCounts[p.barbell_category] ?? 0) + 1
  }

  // ─── Score moyen global
  const scoreValues = (stats ?? []).map((s) => Number(s.avg_score)).filter((s) => !isNaN(s) && s > 0)
  const avgScore = scoreValues.length > 0
    ? scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length
    : null

  // ─── Vitesse de décision (jours moyen entre soumission et décision)
  const decisionTimes = decided
    .filter((p) => p.created_at && p.decided_at)
    .map((p) => {
      const start = new Date(p.created_at)
      const end = new Date(p.decided_at!)
      return (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    })
  const avgDecisionTime = decisionTimes.length > 0
    ? Math.round(decisionTimes.reduce((a, b) => a + b, 0) / decisionTimes.length)
    : null

  // ─── Taux de complétion des évaluations
  const projectsWithEvals = (stats ?? []).filter((s) => (s.evaluation_count ?? 0) > 0).length
  const evalCompletionRate = totalProjects > 0
    ? Math.round((projectsWithEvals / totalProjects) * 100)
    : null

  const BARBELL_LABELS: Record<BarbellCat, string> = {
    core: 'Core conservateur',
    growth: 'Croissance',
    moonshot: 'Paris asymétriques',
  }

  const DECISION_LABELS: Record<DecisionType, string> = {
    approved: 'Approuvés',
    rejected: 'Rejetés',
    deferred: 'Différés',
  }

  const now = new Date()
  const last30days = allDecisions.filter((d) => {
    const date = new Date(d.created_at)
    return (now.getTime() - date.getTime()) < 30 * 24 * 60 * 60 * 1000
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Revue de portefeuille</h1>
          <p className="text-gray-400 text-sm mt-1">
            McKinsey IPMS · {totalProjects} projet{totalProjects !== 1 ? 's' : ''} actifs · Mise à jour en temps réel
          </p>
        </div>
        <Link
          href="/analytics"
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          ← PROMETHEE II
        </Link>
      </div>

      {/* KPIs principaux */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          label="Batting Average"
          value={battingAverage !== null ? `${battingAverage}%` : '—'}
          sub={`${allDecisions.length} décisions`}
          color={battingAverage !== null ? (battingAverage >= 60 ? 'text-green-400' : battingAverage >= 40 ? 'text-yellow-400' : 'text-red-400') : 'text-gray-400'}
          tooltip="% de projets approuvés sur le total décidé"
        />
        <KPICard
          label="MOIC cible moyen"
          value={avgMoicTarget !== null ? `${avgMoicTarget.toFixed(1)}×` : '—'}
          sub={`${approvedProjects.length} projets approuvés`}
          color="text-blue-400"
        />
        <KPICard
          label="Score moyen"
          value={avgScore !== null ? `${avgScore.toFixed(1)} / 10` : '—'}
          sub={`${scoreValues.length} évaluations`}
          color={avgScore !== null ? (avgScore >= 7 ? 'text-green-400' : avgScore >= 5 ? 'text-yellow-400' : 'text-red-400') : 'text-gray-400'}
        />
        <KPICard
          label="Délai moyen décision"
          value={avgDecisionTime !== null ? `${avgDecisionTime}j` : '—'}
          sub={`${decided.length} projets décidés`}
          color="text-gray-300"
        />
      </div>

      {/* Activité 30j + Taux complétion */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard label="Décisions (30j)" value={String(last30days.length)} sub="dernier mois" color="text-white" />
        <KPICard
          label="Taux évaluation"
          value={evalCompletionRate !== null ? `${evalCompletionRate}%` : '—'}
          sub="projets avec ≥1 éval."
          color={evalCompletionRate !== null && evalCompletionRate >= 80 ? 'text-green-400' : 'text-yellow-400'}
        />
        <KPICard label="En évaluation" value={String(allProjects.filter((p) => p.status === 'open').length)} sub="projets ouverts" color="text-blue-400" />
        <KPICard label="En attente décision" value={String(allProjects.filter((p) => p.status === 'closed').length)} sub="quorum atteint" color="text-orange-400" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Répartition décisions */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-semibold text-gray-200">Décisions historiques</h2>
          {allDecisions.length === 0 ? (
            <p className="text-xs text-gray-500">Aucune décision</p>
          ) : (
            <div className="space-y-2">
              {(['approved', 'rejected', 'deferred'] as DecisionType[]).map((type) => {
                const count = allDecisions.filter((d) => d.decision === type).length
                const pct = Math.round((count / allDecisions.length) * 100)
                return (
                  <div key={type} className="flex items-center gap-3">
                    <span className={cn('text-xs w-20', type === 'approved' ? 'text-green-400' : type === 'rejected' ? 'text-red-400' : 'text-yellow-400')}>
                      {DECISION_LABELS[type]}
                    </span>
                    <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full', type === 'approved' ? 'bg-green-500' : type === 'rejected' ? 'bg-red-500' : 'bg-yellow-500')}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-10 text-right">{count} ({pct}%)</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Distribution horizons */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-semibold text-gray-200">Three Horizons</h2>
          {Object.keys(horizonCounts).length === 0 ? (
            <p className="text-xs text-gray-500">Aucun horizon renseigné</p>
          ) : (
            <div className="space-y-2">
              {(['H1', 'H2', 'H3'] as ProjectHorizon[]).map((h) => {
                const count = horizonCounts[h] ?? 0
                const pct = totalProjects > 0 ? Math.round((count / totalProjects) * 100) : 0
                const colors = { H1: 'text-green-400 bg-green-500', H2: 'text-blue-400 bg-blue-500', H3: 'text-purple-400 bg-purple-500' }
                return (
                  <div key={h} className="flex items-center gap-3">
                    <span className={cn('text-xs w-4 font-bold', colors[h].split(' ')[0])}>{h}</span>
                    <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div className={cn('h-full rounded-full', colors[h].split(' ')[1])} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 w-16 text-right">{count} ({pct}%)</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Distribution barbell */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-semibold text-gray-200">Stratégie Barbell</h2>
          {Object.keys(barbellCounts).length === 0 ? (
            <p className="text-xs text-gray-500">Aucune catégorie renseignée</p>
          ) : (
            <div className="space-y-2">
              {(['core', 'growth', 'moonshot'] as BarbellCat[]).map((b) => {
                const count = barbellCounts[b] ?? 0
                const pct = totalProjects > 0 ? Math.round((count / totalProjects) * 100) : 0
                const colors = { core: 'text-green-400 bg-green-500', growth: 'text-yellow-400 bg-yellow-500', moonshot: 'text-purple-400 bg-purple-500' }
                return (
                  <div key={b} className="flex items-center gap-3">
                    <span className={cn('text-xs w-14', colors[b].split(' ')[0])}>{BARBELL_LABELS[b].split(' ')[0]}</span>
                    <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div className={cn('h-full rounded-full', colors[b].split(' ')[1])} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 w-16 text-right">{count} ({pct}%)</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Tableau projets */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-200">Pipeline actuel ({allProjects.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-xs text-gray-500 px-4 py-3">Projet</th>
                <th className="text-left text-xs text-gray-500 px-4 py-3">Statut</th>
                <th className="text-right text-xs text-gray-500 px-4 py-3">Score moy.</th>
                <th className="text-right text-xs text-gray-500 px-4 py-3">Évals.</th>
                <th className="text-left text-xs text-gray-500 px-4 py-3">Horizon</th>
              </tr>
            </thead>
            <tbody>
              {allProjects.slice(0, 20).map((p) => {
                const stat = statsMap[p.id]
                return (
                  <tr key={p.id} className="border-b border-gray-800/50 hover:bg-gray-800/20">
                    <td className="px-4 py-3">
                      <Link href={`/projects/${p.id}`} className="text-sm text-white hover:text-blue-300 transition-colors">
                        {p.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-gray-400">
                      {stat?.avg_score != null ? `${Number(stat.avg_score).toFixed(1)} / 10` : '—'}
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-gray-400">
                      {stat?.evaluation_count ?? 0}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {p.horizon ?? '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-gray-600">
        McKinsey IPMS — Investment Portfolio Management System · Batting Average cible : &gt; 60% · Score moyen cible : &gt; 6.5 / 10 · Délai décision cible : &lt; 30 jours
      </p>
    </div>
  )
}

function KPICard({ label, value, sub, color, tooltip }: {
  label: string
  value: string
  sub?: string
  color?: string
  tooltip?: string
}): React.JSX.Element {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4" title={tooltip}>
      <p className="text-xs text-gray-500">{label}</p>
      <p className={cn('text-xl font-bold mt-1', color ?? 'text-white')}>{value}</p>
      {sub && <p className="text-xs text-gray-600 mt-0.5">{sub}</p>}
    </div>
  )
}

function StatusBadge({ status }: { status: string }): React.JSX.Element {
  const colors: Record<string, string> = {
    open: 'text-blue-400 bg-blue-950/30',
    closed: 'text-orange-400 bg-orange-950/30',
    decided: 'text-green-400 bg-green-950/30',
    archived: 'text-gray-400 bg-gray-800',
    'pre-mortem': 'text-purple-400 bg-purple-950/30',
  }
  return (
    <span className={cn('text-xs px-2 py-0.5 rounded font-medium', colors[status] ?? 'text-gray-400')}>
      {status}
    </span>
  )
}
