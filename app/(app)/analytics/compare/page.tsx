import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Database } from '@/types/database'

type ProjectHorizon = Database['public']['Enums']['project_horizon']
type BarbellCat = Database['public']['Enums']['barbell_cat']

type ComparePageProps = {
  searchParams: Promise<{ ids?: string }>
}

export default async function ComparePage({ searchParams }: ComparePageProps): Promise<React.JSX.Element> {
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

  const { ids } = await searchParams
  const selectedIds = ids ? ids.split(',').filter(Boolean).slice(0, 4) : []

  // Tous les projets avec quorum (pour la liste de sélection)
  const { data: allProjects } = await supabase
    .from('projects')
    .select('id, title, status')
    .in('status', ['closed', 'decided', 'archived'])
    .order('created_at', { ascending: false })

  // Projets sélectionnés pour comparaison
  const { data: projects } = selectedIds.length > 0
    ? await supabase
        .from('projects')
        .select('id, title, sector, horizon, barbell_category, moic_target, status, created_at, decided_at')
        .in('id', selectedIds)
    : { data: null }

  // Critères par défaut
  const { data: defaultCriteria } = await supabase
    .from('evaluation_criteria')
    .select('id, label, weight, order_index')
    .is('project_id', null)
    .order('order_index')

  // Stats pour chaque projet
  const { data: stats } = selectedIds.length > 0
    ? await supabase
        .from('project_evaluation_stats')
        .select('project_id, avg_score, evaluation_count, quorum_reached')
        .in('project_id', selectedIds)
    : { data: null }

  // Évaluations pour les scores par critère
  const { data: evaluations } = selectedIds.length > 0
    ? await supabase
        .from('evaluations')
        .select('project_id, scores')
        .in('project_id', selectedIds)
    : { data: null }

  const statsMap = Object.fromEntries((stats ?? []).map((s) => [s.project_id, s]))
  const criteria = defaultCriteria ?? []

  // Calculer les scores moyens par critère par projet
  type ScoresRecord = Record<string, number>
  const projectScores: Record<string, Record<string, number>> = {}

  for (const pid of selectedIds) {
    const projectEvals = (evaluations ?? []).filter((e) => e.project_id === pid)
    const scores: Record<string, number> = {}
    for (const crit of criteria) {
      const vals = projectEvals
        .map((e) => (e.scores as ScoresRecord)[crit.id])
        .filter((v): v is number => v !== undefined && v !== null)
      scores[crit.id] = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0
    }
    projectScores[pid] = scores
  }

  const HORIZON_LABELS: Record<ProjectHorizon, string> = {
    H1: 'H1 — Core',
    H2: 'H2 — Émergent',
    H3: 'H3 — Transformationnel',
  }

  const BARBELL_LABELS: Record<BarbellCat, string> = {
    core: 'Core',
    growth: 'Growth',
    moonshot: 'Moonshot',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Analyse comparative</h1>
          <p className="text-on-surface-variant text-sm mt-1">Comparez jusqu&apos;à 4 projets avec quorum côte à côte</p>
        </div>
        <Link href="/analytics" className="text-xs text-primary hover:text-primary/80 transition-colors">
          ← PROMETHEE II
        </Link>
      </div>

      {/* Sélection des projets */}
      <div className="bg-surface-container-low border border-border/10 rounded-xl p-5 space-y-3">
        <h2 className="text-sm font-semibold text-on-surface">Sélectionner les projets à comparer</h2>
        <div className="flex flex-wrap gap-2">
          {(allProjects ?? []).map((p) => {
            const isSelected = selectedIds.includes(p.id)
            const newIds = isSelected
              ? selectedIds.filter((id) => id !== p.id)
              : [...selectedIds, p.id].slice(0, 4)
            return (
              <Link
                key={p.id}
                href={`/analytics/compare?ids=${newIds.join(',')}`}
                className={cn(
                  'text-xs px-3 py-1.5 rounded-lg border transition-colors',
                  isSelected
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border/10 bg-surface-container text-on-surface-variant hover:border-border hover:text-on-surface',
                )}
              >
                {isSelected ? '✓ ' : ''}{p.title}
              </Link>
            )
          })}
        </div>
        {selectedIds.length === 4 && (
          <p className="text-xs text-yellow-400">Maximum 4 projets atteint</p>
        )}
      </div>

      {selectedIds.length === 0 ? (
        <div className="bg-surface-container border border-border/10 rounded-xl p-8 text-center">
          <p className="text-muted-foreground text-sm">Sélectionnez 2 à 4 projets pour lancer la comparaison</p>
        </div>
      ) : projects && projects.length >= 1 ? (
        <div className="space-y-4">
          {/* Métriques générales */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/10">
                  <th className="text-left text-xs text-on-surface-variant font-bold uppercase tracking-widest px-4 py-3 bg-surface-container-low/50">Métrique</th>
                  {projects.map((p) => (
                    <th key={p.id} className="text-left text-xs font-medium px-4 py-3 bg-surface-container-low/50">
                      <Link href={`/projects/${p.id}`} className="text-on-surface hover:text-primary transition-colors">
                        {p.title}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    label: 'Score global',
                    render: (pid: string) => {
                      const s = statsMap[pid]
                      const score = s?.avg_score != null ? Number(s.avg_score) : null
                      return score !== null ? (
                        <span className={cn('font-semibold', score >= 7 ? 'text-na-tertiary-dim' : score >= 5 ? 'text-yellow-400' : 'text-destructive')}>
                          {score.toFixed(2)} / 10
                        </span>
                      ) : '—'
                    },
                  },
                  {
                    label: 'Nb évaluations',
                    render: (pid: string) => <span>{statsMap[pid]?.evaluation_count ?? 0}</span>,
                  },
                  {
                    label: 'MOIC cible',
                    render: (pid: string) => {
                      const p = projects.find((x) => x.id === pid)
                      return p?.moic_target ? <span className="text-primary font-semibold">{p.moic_target}×</span> : '—'
                    },
                  },
                  {
                    label: 'Horizon',
                    render: (pid: string) => {
                      const p = projects.find((x) => x.id === pid)
                      return p?.horizon ? <span className="text-xs text-on-surface-variant">{HORIZON_LABELS[p.horizon]}</span> : '—'
                    },
                  },
                  {
                    label: 'Barbell',
                    render: (pid: string) => {
                      const p = projects.find((x) => x.id === pid)
                      return p?.barbell_category ? <span className="text-xs text-on-surface-variant">{BARBELL_LABELS[p.barbell_category]}</span> : '—'
                    },
                  },
                  {
                    label: 'Secteur',
                    render: (pid: string) => {
                      const p = projects.find((x) => x.id === pid)
                      return <span className="text-xs text-on-surface-variant">{p?.sector ?? '—'}</span>
                    },
                  },
                ].map(({ label, render }) => (
                  <tr key={label} className="border-b border-border/10 hover:bg-surface-container-high/20">
                    <td className="px-4 py-3 text-xs text-on-surface-variant bg-surface-container-low/30">{label}</td>
                    {projects.map((p) => (
                      <td key={p.id} className="px-4 py-3 text-sm text-on-surface">
                        {render(p.id)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Scores par critère */}
          {criteria.length > 0 && (
            <div className="bg-surface-container border border-border/10 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-border/10">
                <h2 className="text-sm font-semibold text-on-surface">Scores par critère</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/10">
                      <th className="text-left text-xs text-on-surface-variant font-bold uppercase tracking-widest px-4 py-3">Critère</th>
                      {projects.map((p) => (
                        <th key={p.id} className="text-right text-xs text-on-surface-variant font-bold uppercase tracking-widest px-4 py-3">{p.title.substring(0, 20)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {criteria.map((c) => {
                      const scores = projects.map((p) => projectScores[p.id]?.[c.id] ?? 0)
                      const maxScore = Math.max(...scores)
                      return (
                        <tr key={c.id} className="border-b border-border/10 hover:bg-surface-container-high/20">
                          <td className="px-4 py-3 text-xs text-on-surface-variant">{c.label} <span className="text-on-surface-variant/40">({c.weight}%)</span></td>
                          {projects.map((p) => {
                            const score = projectScores[p.id]?.[c.id] ?? 0
                            const isMax = score === maxScore && score > 0
                            return (
                              <td key={p.id} className="px-4 py-3 text-right">
                                <span className={cn(
                                  'text-sm font-semibold',
                                  isMax ? 'text-na-tertiary-dim' : score >= 7 ? 'text-on-surface' : score >= 5 ? 'text-yellow-400/80' : 'text-destructive/80',
                                  score === 0 ? 'text-on-surface-variant/40' : '',
                                )}>
                                  {score > 0 ? score.toFixed(1) : '—'}
                                </span>
                              </td>
                            )
                          })}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-surface-container border border-border/10 rounded-xl p-8 text-center">
          <p className="text-muted-foreground text-sm">Projets introuvables</p>
        </div>
      )}
    </div>
  )
}
