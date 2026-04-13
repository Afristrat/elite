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
          <h1 className="text-2xl font-bold text-white">Batting Average & Slugging</h1>
          <p className="text-gray-400 text-sm mt-1">
            Métriques de qualité décisionnelle — analogie baseball appliquée au comité d&apos;investissement
          </p>
        </div>
        <Link href="/analytics" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">← Analytics</Link>
      </div>

      {all.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
          <p className="text-gray-500 text-sm">Aucune décision disponible</p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* KPIs principaux */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500">Batting Average</p>
              <p className={cn('text-2xl font-bold mt-1', battingAverage !== null ? (battingAverage >= 60 ? 'text-green-400' : battingAverage >= 40 ? 'text-yellow-400' : 'text-red-400') : 'text-gray-400')}>
                {battingAverage !== null ? `${battingAverage.toFixed(0)}%` : '—'}
              </p>
              <p className="text-xs text-gray-600 mt-0.5">Approbations / Total</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500">Slugging (MOIC moyen)</p>
              <p className={cn('text-2xl font-bold mt-1', avgMoic !== null ? (avgMoic >= 3 ? 'text-green-400' : 'text-yellow-400') : 'text-gray-400')}>
                {avgMoic !== null ? `${avgMoic.toFixed(1)}×` : '—'}
              </p>
              <p className="text-xs text-gray-600 mt-0.5">Projets approuvés</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500">Score comité moyen</p>
              <p className={cn('text-2xl font-bold mt-1', avgApprovedScore !== null ? (avgApprovedScore >= 7 ? 'text-green-400' : 'text-yellow-400') : 'text-gray-400')}>
                {avgApprovedScore !== null ? `${avgApprovedScore.toFixed(1)} / 10` : '—'}
              </p>
              <p className="text-xs text-gray-600 mt-0.5">Évaluations pré-approbation</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500">OPS Score</p>
              <p className={cn('text-2xl font-bold mt-1', opsScore !== null ? 'text-blue-400' : 'text-gray-400')}>
                {opsScore ?? '—'}
              </p>
              <p className="text-xs text-gray-600 mt-0.5">BA + Slugging composite</p>
            </div>
          </div>

          {/* Activité récente */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPICard label="Décisions 90j" value={String(last90days.length)} sub="dernier trimestre" />
            <KPICard label="Approuvés" value={String(approved.length)} color="text-green-400" />
            <KPICard label="Rejetés" value={String(rejected.length)} color="text-red-400" />
            <KPICard label="Différés" value={String(deferred.length)} color="text-yellow-400" />
          </div>

          {/* Distribution MOIC */}
          {moicValues.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
              <h2 className="text-sm font-semibold text-gray-200">Distribution MOIC cible — Projets approuvés</h2>
              <div className="space-y-2">
                {moicBuckets.map(({ label, filter }) => {
                  const count = moicValues.filter(filter).length
                  const pct = moicValues.length > 0 ? Math.round((count / moicValues.length) * 100) : 0
                  return (
                    <div key={label} className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-14">{label}</span>
                      <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-gray-500 w-16 text-right">{count} ({pct}%)</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Historique des décisions */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-800">
              <h2 className="text-sm font-semibold text-gray-200">Historique ({all.length} décisions)</h2>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left text-xs text-gray-500 px-4 py-3">Projet</th>
                  <th className="text-left text-xs text-gray-500 px-4 py-3">Décision</th>
                  <th className="text-right text-xs text-gray-500 px-4 py-3">MOIC cible</th>
                  <th className="text-right text-xs text-gray-500 px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {all.slice(0, 20).map((d) => {
                  const p = d.projects as { title?: string; moic_target?: number | null } | null
                  const dColors: Record<DecisionType, string> = {
                    approved: 'text-green-400',
                    rejected: 'text-red-400',
                    deferred: 'text-yellow-400',
                  }
                  return (
                    <tr key={d.id} className="border-b border-gray-800/50 hover:bg-gray-800/20">
                      <td className="px-4 py-3">
                        <Link href={`/projects/${d.project_id}`} className="text-sm text-white hover:text-blue-300 transition-colors">
                          {p?.title ?? d.project_id}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('text-xs font-semibold', dColors[d.decision])}>
                          {d.decision}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-gray-400">
                        {p?.moic_target ? `${p.moic_target}×` : '—'}
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-gray-500">
                        {new Date(d.created_at).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-gray-600">
            <span className="text-gray-500 font-medium">Batting Average</span> — % d&apos;approuvals sur total décisions (cible : &gt; 60%).{' '}
            <span className="text-gray-500 font-medium">Slugging</span> — MOIC moyen des projets approuvés (cible : &gt; 3×).{' '}
            <span className="text-gray-500 font-medium">OPS</span> — Score composite : BA + Slugging/10.
          </p>
        </div>
      )}
    </div>
  )
}

function KPICard({ label, value, sub, color = 'text-white' }: { label: string; value: string; sub?: string; color?: string }): React.JSX.Element {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={cn('text-xl font-bold mt-1', color)}>{value}</p>
      {sub && <p className="text-xs text-gray-600 mt-0.5">{sub}</p>}
    </div>
  )
}
