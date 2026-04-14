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
          <h1 className="text-2xl font-bold text-on-surface">Revue de portefeuille</h1>
          <p className="text-on-surface-variant text-sm mt-1">
            McKinsey IPMS · {totalProjects} projet{totalProjects !== 1 ? 's' : ''} actifs · Mise à jour en temps réel
          </p>
        </div>
        <Link
          href="/analytics"
          className="text-xs text-primary hover:text-primary/80 transition-colors"
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
          color={battingAverage !== null ? (battingAverage >= 60 ? 'text-na-tertiary-dim' : battingAverage >= 40 ? 'text-yellow-400' : 'text-destructive') : 'text-on-surface-variant'}
          tooltip="% de projets approuvés sur le total décidé"
        />
        <KPICard
          label="MOIC cible moyen"
          value={avgMoicTarget !== null ? `${avgMoicTarget.toFixed(1)}×` : '—'}
          sub={`${approvedProjects.length} projets approuvés`}
          color="text-primary"
        />
        <KPICard
          label="Score moyen"
          value={avgScore !== null ? `${avgScore.toFixed(1)} / 10` : '—'}
          sub={`${scoreValues.length} évaluations`}
          color={avgScore !== null ? (avgScore >= 7 ? 'text-na-tertiary-dim' : avgScore >= 5 ? 'text-yellow-400' : 'text-destructive') : 'text-on-surface-variant'}
        />
        <KPICard
          label="Délai moyen décision"
          value={avgDecisionTime !== null ? `${avgDecisionTime}j` : '—'}
          sub={`${decided.length} projets décidés`}
          color="text-on-surface"
        />
      </div>

      {/* Activité 30j + Taux complétion */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard label="Décisions (30j)" value={String(last30days.length)} sub="dernier mois" color="text-on-surface" />
        <KPICard
          label="Taux évaluation"
          value={evalCompletionRate !== null ? `${evalCompletionRate}%` : '—'}
          sub="projets avec ≥1 éval."
          color={evalCompletionRate !== null && evalCompletionRate >= 80 ? 'text-na-tertiary-dim' : 'text-yellow-400'}
        />
        <KPICard label="En évaluation" value={String(allProjects.filter((p) => p.status === 'open').length)} sub="projets ouverts" color="text-primary" />
        <KPICard label="En attente décision" value={String(allProjects.filter((p) => p.status === 'closed').length)} sub="quorum atteint" color="text-orange-400" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Répartition décisions */}
        <div className="bg-surface-container border border-border/10 rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-semibold text-on-surface">Décisions historiques</h2>
          {allDecisions.length === 0 ? (
            <p className="text-xs text-muted-foreground">Aucune décision</p>
          ) : (
            <div className="space-y-2">
              {(['approved', 'rejected', 'deferred'] as DecisionType[]).map((type) => {
                const count = allDecisions.filter((d) => d.decision === type).length
                const pct = Math.round((count / allDecisions.length) * 100)
                return (
                  <div key={type} className="flex items-center gap-3">
                    <span className={cn('text-xs w-20', type === 'approved' ? 'text-na-tertiary-dim' : type === 'rejected' ? 'text-destructive' : 'text-yellow-400')}>
                      {DECISION_LABELS[type]}
                    </span>
                    <div className="flex-1 h-1.5 bg-surface-container-low rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full', type === 'approved' ? 'bg-na-tertiary-dim' : type === 'rejected' ? 'bg-destructive' : 'bg-yellow-500')}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-on-surface-variant w-10 text-right">{count} ({pct}%)</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Distribution horizons */}
        <div className="bg-surface-container border border-border/10 rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-semibold text-on-surface">Three Horizons</h2>
          {Object.keys(horizonCounts).length === 0 ? (
            <p className="text-xs text-muted-foreground">Aucun horizon renseigné</p>
          ) : (
            <div className="space-y-2">
              {(['H1', 'H2', 'H3'] as ProjectHorizon[]).map((h) => {
                const count = horizonCounts[h] ?? 0
                const pct = totalProjects > 0 ? Math.round((count / totalProjects) * 100) : 0
                const colors = { H1: 'text-na-tertiary-dim bg-na-tertiary-dim', H2: 'text-primary bg-primary', H3: 'text-purple-400 bg-purple-500' }
                return (
                  <div key={h} className="flex items-center gap-3">
                    <span className={cn('text-xs w-4 font-bold', colors[h].split(' ')[0])}>{h}</span>
                    <div className="flex-1 h-1.5 bg-surface-container-low rounded-full overflow-hidden">
                      <div className={cn('h-full rounded-full', colors[h].split(' ')[1])} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-on-surface-variant w-16 text-right">{count} ({pct}%)</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Distribution barbell */}
        <div className="bg-surface-container border border-border/10 rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-semibold text-on-surface">Stratégie Barbell</h2>
          {Object.keys(barbellCounts).length === 0 ? (
            <p className="text-xs text-muted-foreground">Aucune catégorie renseignée</p>
          ) : (
            <div className="space-y-2">
              {(['core', 'growth', 'moonshot'] as BarbellCat[]).map((b) => {
                const count = barbellCounts[b] ?? 0
                const pct = totalProjects > 0 ? Math.round((count / totalProjects) * 100) : 0
                const colors = { core: 'text-na-tertiary-dim bg-na-tertiary-dim', growth: 'text-yellow-400 bg-yellow-500', moonshot: 'text-purple-400 bg-purple-500' }
                return (
                  <div key={b} className="flex items-center gap-3">
                    <span className={cn('text-xs w-14', colors[b].split(' ')[0])}>{BARBELL_LABELS[b].split(' ')[0]}</span>
                    <div className="flex-1 h-1.5 bg-surface-container-low rounded-full overflow-hidden">
                      <div className={cn('h-full rounded-full', colors[b].split(' ')[1])} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-on-surface-variant w-16 text-right">{count} ({pct}%)</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Tableau projets */}
      <div className="bg-surface-container border border-border/10 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border/10 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-on-surface">Pipeline actuel ({allProjects.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/10">
                <th className="text-left text-xs text-on-surface-variant font-bold uppercase tracking-widest px-4 py-3">Projet</th>
                <th className="text-left text-xs text-on-surface-variant font-bold uppercase tracking-widest px-4 py-3">Statut</th>
                <th className="text-right text-xs text-on-surface-variant font-bold uppercase tracking-widest px-4 py-3">Score moy.</th>
                <th className="text-right text-xs text-on-surface-variant font-bold uppercase tracking-widest px-4 py-3">Évals.</th>
                <th className="text-left text-xs text-on-surface-variant font-bold uppercase tracking-widest px-4 py-3">Horizon</th>
              </tr>
            </thead>
            <tbody>
              {allProjects.slice(0, 20).map((p) => {
                const stat = statsMap[p.id]
                return (
                  <tr key={p.id} className="border-b border-border/10 hover:bg-surface-container-high/20 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/projects/${p.id}`} className="text-sm text-on-surface hover:text-primary transition-colors">
                        {p.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-on-surface-variant">
                      {stat?.avg_score != null ? `${Number(stat.avg_score).toFixed(1)} / 10` : '—'}
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-on-surface-variant">
                      {stat?.evaluation_count ?? 0}
                    </td>
                    <td className="px-4 py-3 text-xs text-on-surface-variant">
                      {p.horizon ?? '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-on-surface-variant/50">
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
    <div className="bg-surface-container border border-border/10 rounded-xl p-4 hover:bg-surface-container-high transition-colors" title={tooltip}>
      <p className="text-xs text-on-surface-variant">{label}</p>
      <p className={cn('text-xl font-bold mt-1', color ?? 'text-on-surface')}>{value}</p>
      {sub && <p className="text-xs text-on-surface-variant/50 mt-0.5">{sub}</p>}
    </div>
  )
}

function StatusBadge({ status }: { status: string }): React.JSX.Element {
  const colors: Record<string, string> = {
    open: 'text-primary bg-primary/10',
    closed: 'text-orange-400 bg-orange-950/30',
    decided: 'text-na-tertiary-dim bg-na-tertiary-container/20',
    archived: 'text-on-surface-variant bg-surface-container-high',
    'pre-mortem': 'text-purple-400 bg-purple-950/30',
  }
  return (
    <span className={cn('text-xs px-2 py-0.5 rounded font-medium', colors[status] ?? 'text-on-surface-variant')}>
      {status}
    </span>
  )
}
