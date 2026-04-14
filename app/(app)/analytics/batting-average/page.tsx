import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Database } from '@/types/database'

type DecisionType = Database['public']['Enums']['decision_type']

export default async function BattingAveragePage(): Promise<React.JSX.Element> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user!.id).single()
  if (profile?.role !== 'admin') notFound()

  // Décisions avec projets
  const { data: decisions } = await supabase
    .from('decisions')
    .select(`
      id, decision, created_at, project_id,
      projects!decisions_project_id_fkey(title, moic_target, sector, horizon)
    `)
    .order('created_at', { ascending: false })

  const all = decisions ?? []
  const approved = all.filter((d) => d.decision === 'approved')
  const rejected = all.filter((d) => d.decision === 'rejected')
  const deferred = all.filter((d) => d.decision === 'deferred')

  // Batting Average = approbations / total
  const battingAverage = all.length > 0 ? (approved.length / all.length) * 100 : null

  // Slugging Percentage = MOIC moyen pondéré des approuvés (analogie baseball : extra-base hits)
  const moicValues = approved
    .map((d) => {
      const p = d.projects as { moic_target?: number | null } | null
      return p?.moic_target
    })
    .filter((m): m is number => m !== null && m !== undefined)

  const avgMoic = moicValues.length > 0
    ? moicValues.reduce((a, b) => a + b, 0) / moicValues.length
    : null

  // "On-Base Plus Slugging" (OPS) score composite — adapté: (batting avg / 100) + (avg moic / 10)
  const opsScore = battingAverage !== null && avgMoic !== null
    ? ((battingAverage / 100) + (avgMoic / 10)).toFixed(3)
    : null

  // Distribution MOIC des approuvés
  const moicBuckets = [
    { label: '< 2×', filter: (m: number) => m < 2 },
    { label: '2–3×', filter: (m: number) => m >= 2 && m < 3 },
    { label: '3–5×', filter: (m: number) => m >= 3 && m < 5 },
    { label: '5–10×', filter: (m: number) => m >= 5 && m < 10 },
    { label: '> 10×', filter: (m: number) => m >= 10 },
  ]

  // Score d'évaluation moyen par décision (proxy de la qualité du comité)
  const { data: stats } = await supabase
    .from('project_evaluation_stats')
    .select('project_id, avg_score')
    .in('project_id', approved.map((d) => d.project_id))

  const statsMap = Object.fromEntries((stats ?? []).map((s) => [s.project_id, s]))
  const approvedScores = approved
    .map((d) => {
      const s = statsMap[d.project_id]
      return s?.avg_score != null ? Number(s.avg_score) : null
    })
    .filter((s): s is number => s !== null)

  const avgApprovedScore = approvedScores.length > 0
    ? approvedScores.reduce((a, b) => a + b, 0) / approvedScores.length
    : null

  const now = new Date()
  const last90days = all.filter((d) => {
    const date = new Date(d.created_at)
    return (now.getTime() - date.getTime()) < 90 * 24 * 60 * 60 * 1000
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Batting Average &amp; Slugging</h1>
          <p className="text-on-surface-variant text-sm mt-1">
            Métriques de qualité décisionnelle — analogie baseball appliquée au comité d&apos;investissement
          </p>
        </div>
        <Link href="/analytics" className="text-xs text-primary hover:text-primary/80 transition-colors">← Analytics</Link>
      </div>

      {all.length === 0 ? (
        <div className="bg-surface-container border border-border/10 rounded-xl p-8 text-center">
          <p className="text-muted-foreground text-sm">Aucune décision disponible</p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* KPIs principaux */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-surface-container border border-border/10 rounded-xl p-6 hover:bg-surface-container-high transition-colors">
              <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Batting Average</p>
              <p className={cn('text-4xl font-bold tracking-tighter mt-4', battingAverage !== null ? (battingAverage >= 60 ? 'text-na-tertiary-dim' : battingAverage >= 40 ? 'text-yellow-400' : 'text-destructive') : 'text-on-surface-variant')}>
                {battingAverage !== null ? `${battingAverage.toFixed(0)}%` : '—'}
              </p>
              {battingAverage !== null && (
                <div className="mt-4 h-1 w-full bg-surface-container-low rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${battingAverage}%` }} />
                </div>
              )}
              <p className="text-[10px] text-on-surface-variant mt-2">Approbations / Total</p>
            </div>
            <div className="bg-surface-container border border-border/10 rounded-xl p-6 hover:bg-surface-container-high transition-colors">
              <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Slugging (MOIC moyen)</p>
              <p className={cn('text-4xl font-bold tracking-tighter mt-4', avgMoic !== null ? (avgMoic >= 3 ? 'text-na-tertiary-dim' : 'text-yellow-400') : 'text-on-surface-variant')}>
                {avgMoic !== null ? `${avgMoic.toFixed(1)}×` : '—'}
              </p>
              <p className="text-[10px] text-on-surface-variant italic mt-2">Multiplicateur moyen pondéré</p>
            </div>
            <div className="bg-surface-container border border-border/10 rounded-xl p-6 hover:bg-surface-container-high transition-colors">
              <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Score comité</p>
              <p className={cn('text-4xl font-bold tracking-tighter mt-4', avgApprovedScore !== null ? (avgApprovedScore >= 7 ? 'text-primary' : 'text-yellow-400') : 'text-on-surface-variant')}>
                {avgApprovedScore !== null ? `${avgApprovedScore.toFixed(1)}/10` : '—'}
              </p>
              <p className="text-[10px] text-on-surface-variant italic mt-2">Indice de confiance interne</p>
            </div>
            <div className="bg-surface-container border border-border/10 rounded-xl p-6 hover:bg-surface-container-high transition-colors">
              <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">OPS Score</p>
              <p className={cn('text-4xl font-bold tracking-tighter mt-4', opsScore !== null ? 'text-on-surface' : 'text-on-surface-variant')}>
                {opsScore ?? '—'}
              </p>
              <p className="text-[10px] text-on-surface-variant mt-2">Performances agrégées</p>
            </div>
          </div>

          {/* Activité récente */}
          <div className="flex flex-wrap items-center gap-6 py-3 border-y border-border/10">
            <div className="flex items-center gap-2 px-2">
              <span className="text-lg font-bold text-on-surface">{last90days.length}</span>
              <span className="text-on-surface-variant text-xs font-medium uppercase tracking-wide">décisions 90j</span>
            </div>
            <div className="h-4 w-px bg-border/20 hidden md:block" />
            <div className="flex items-center gap-2 bg-na-tertiary-container/10 px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-na-tertiary-dim" />
              <span className="text-na-tertiary-dim text-xs font-bold">{approved.length} Approuvés</span>
            </div>
            <div className="flex items-center gap-2 bg-destructive/10 px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
              <span className="text-destructive text-xs font-bold">{rejected.length} Rejetés</span>
            </div>
            <div className="flex items-center gap-2 bg-surface-container-high px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant" />
              <span className="text-on-surface-variant text-xs font-bold">{deferred.length} Différés</span>
            </div>
          </div>

          {/* Distribution MOIC */}
          {moicValues.length > 0 && (
            <div className="bg-surface-container-low border border-border/10 rounded-xl p-6 space-y-4">
              <h2 className="text-on-surface text-lg font-semibold">Distribution des Multiples (MOIC)</h2>
              <div className="grid grid-cols-5 items-end gap-4 h-40 px-4">
                {moicBuckets.map(({ label, filter }, idx) => {
                  const count = moicValues.filter(filter).length
                  const pct = moicValues.length > 0 ? Math.round((count / moicValues.length) * 100) : 0
                  const barColors = [
                    'bg-destructive/40 hover:bg-destructive/60',
                    'bg-on-surface-variant/40 hover:bg-on-surface-variant/60',
                    'bg-primary/40 hover:bg-primary/60',
                    'bg-na-tertiary-dim/40 hover:bg-na-tertiary-dim/60',
                    'border-2 border-dashed border-border/30',
                  ]
                  return (
                    <div key={label} className="flex flex-col items-center gap-3 h-full justify-end group">
                      <div
                        className={cn('w-full rounded-t-lg transition-colors', barColors[idx])}
                        style={{ height: `${Math.max(pct, 0)}%` }}
                      />
                      <span className={cn('text-[10px] font-bold', idx === 2 ? 'text-primary tracking-widest' : 'text-on-surface-variant')}>{label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Historique des décisions */}
          <div className="bg-surface-container border border-border/10 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border/10 bg-surface-container-high/30 flex items-center justify-between">
              <h2 className="text-on-surface font-semibold text-sm">Décisions récentes ({all.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest">
                    <th className="px-6 py-4">Projet</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Verdict</th>
                    <th className="px-6 py-4 text-right">MOIC cible</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/10">
                  {all.slice(0, 20).map((d) => {
                    const p = d.projects as { title?: string; moic_target?: number | null } | null
                    const dColors: Record<DecisionType, string> = {
                      approved: 'bg-na-tertiary-container/10 text-na-tertiary-dim',
                      rejected: 'bg-destructive/10 text-destructive',
                      deferred: 'bg-surface-container-highest text-on-surface-variant',
                    }
                    return (
                      <tr key={d.id} className="hover:bg-surface-container-high/20 transition-colors">
                        <td className="px-6 py-5">
                          <Link href={`/projects/${d.project_id}`} className="text-sm font-medium text-on-surface hover:text-primary transition-colors">
                            {p?.title ?? d.project_id}
                          </Link>
                        </td>
                        <td className="px-6 py-5 text-on-surface-variant text-sm">
                          {new Date(d.created_at).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-5">
                          <span className={cn('text-[10px] font-bold px-2 py-1 rounded uppercase tracking-tighter', dColors[d.decision])}>
                            {d.decision === 'approved' ? 'Approuvé' : d.decision === 'rejected' ? 'Rejeté' : 'Différé'}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right text-sm font-bold text-na-tertiary-dim">
                          {p?.moic_target ? `${p.moic_target}×` : <span className="text-on-surface-variant opacity-40">—</span>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-xs text-on-surface-variant/50">
            <span className="text-on-surface-variant font-medium">Batting Average</span> — % d&apos;approbations sur total décisions (cible : &gt; 60%).{' '}
            <span className="text-on-surface-variant font-medium">Slugging</span> — MOIC moyen des projets approuvés (cible : &gt; 3×).{' '}
            <span className="text-on-surface-variant font-medium">OPS</span> — Score composite : BA + Slugging/10.
          </p>
        </div>
      )}
    </div>
  )
}

