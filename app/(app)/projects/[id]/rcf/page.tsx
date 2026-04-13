import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'
import type { Database } from '@/types/database'

type DecisionType = Database['public']['Enums']['decision_type']
type RCFPageProps = { params: Promise<{ id: string }> }

export default async function RCFPage({ params }: RCFPageProps): Promise<React.JSX.Element> {
  const { id } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from('projects')
    .select('id, title, sector, horizon, barbell_category, moic_target')
    .eq('id', id)
    .single()

  if (!project) notFound()

  // Décisions passées (hors ce projet) pour le benchmark
  const { data: pastDecisions } = await supabase
    .from('decisions')
    .select(`
      id, decision, created_at, project_id,
      projects!decisions_project_id_fkey(title, sector, horizon, barbell_category, moic_target)
    `)
    .neq('project_id', id)
    .order('created_at', { ascending: false })

  const decisions = pastDecisions ?? []

  // Stats globales
  const total = decisions.length
  const approved = decisions.filter((d) => d.decision === 'approved').length
  const rejected = decisions.filter((d) => d.decision === 'rejected').length
  const deferred = decisions.filter((d) => d.decision === 'deferred').length
  const approvalRate = total > 0 ? Math.round((approved / total) * 100) : null

  // Projets similaires (même secteur OU même horizon)
  const similar = decisions.filter((d) => {
    const p = d.projects as { sector?: string | null; horizon?: string | null } | null
    return (
      (project.sector && p?.sector && p.sector === project.sector) ||
      (project.horizon && p?.horizon && p.horizon === project.horizon)
    )
  })

  const similarTotal = similar.length
  const similarApproved = similar.filter((d) => d.decision === 'approved').length
  const similarRate = similarTotal > 0 ? Math.round((similarApproved / similarTotal) * 100) : null

  // Référence MOIC : moyenne des MOIC cibles des projets approuvés
  const approvedProjects = decisions.filter((d) => d.decision === 'approved')
  const moicValues = approvedProjects
    .map((d) => {
      const p = d.projects as { moic_target?: number | null } | null
      return p?.moic_target
    })
    .filter((m): m is number => m !== null && m !== undefined)

  const avgMoic = moicValues.length > 0
    ? moicValues.reduce((a, b) => a + b, 0) / moicValues.length
    : null

  const DECISION_LABELS: Record<DecisionType, string> = {
    approved: 'Approuvé',
    rejected: 'Rejeté',
    deferred: 'Différé',
  }

  const DECISION_COLORS: Record<DecisionType, string> = {
    approved: 'text-green-400',
    rejected: 'text-red-400',
    deferred: 'text-yellow-400',
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link href={`/projects/${id}`} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
          ← Retour au projet
        </Link>
        <h1 className="text-xl font-bold text-white mt-2">Reference Class Forecasting</h1>
        <p className="text-gray-400 text-sm mt-1">
          Benchmark de <span className="text-white font-medium">{project.title}</span> par rapport aux décisions passées du comité
        </p>
      </div>

      {total === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
          <p className="text-gray-500 text-sm">Aucune décision passée disponible pour le benchmark</p>
          <p className="text-gray-600 text-xs mt-1">
            Le benchmark sera disponible après la première décision du comité
          </p>
        </div>
      ) : (
        <>
          {/* Statistiques globales */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Décisions totales" value={String(total)} />
            <StatCard
              label="Taux d'approbation"
              value={approvalRate !== null ? `${approvalRate}%` : '—'}
              accent
            />
            <StatCard label="Approuvés" value={String(approved)} color="text-green-400" />
            <StatCard label="Rejetés" value={String(rejected)} color="text-red-400" />
          </div>

          {/* Comparaison avec projets similaires */}
          {similarTotal > 0 && (
            <div className="bg-blue-950/20 border border-blue-900/40 rounded-xl p-5 space-y-3">
              <h2 className="text-sm font-semibold text-blue-300">
                Projets similaires ({similarTotal} trouvés)
              </h2>
              <p className="text-xs text-gray-400">
                Même secteur ({project.sector ?? '—'}) ou même horizon ({project.horizon ?? '—'})
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Taux d&apos;approbation similaires</p>
                  <p className="text-2xl font-bold text-blue-400 mt-1">
                    {similarRate !== null ? `${similarRate}%` : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Approuvés / Total similaires</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {similarApproved} / {similarTotal}
                  </p>
                </div>
              </div>

              {/* Comparaison avec taux global */}
              {approvalRate !== null && similarRate !== null && (
                <p className={cn(
                  'text-xs font-medium',
                  similarRate > approvalRate ? 'text-green-400' : similarRate < approvalRate ? 'text-red-400' : 'text-gray-400'
                )}>
                  {similarRate > approvalRate
                    ? `+${similarRate - approvalRate}pts vs le taux global — profil favorable`
                    : similarRate < approvalRate
                      ? `-${approvalRate - similarRate}pts vs le taux global — profil plus sélectif`
                      : 'Aligné avec le taux global'}
                </p>
              )}
            </div>
          )}

          {/* Benchmark MOIC */}
          {avgMoic !== null && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
              <h2 className="text-sm font-semibold text-gray-200">Benchmark MOIC</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">MOIC moyen des projets approuvés</p>
                  <p className="text-2xl font-bold text-green-400 mt-1">{avgMoic.toFixed(2)}×</p>
                </div>
                {project.moic_target && (
                  <div>
                    <p className="text-xs text-gray-500">MOIC cible de ce projet</p>
                    <p className={cn(
                      'text-2xl font-bold mt-1',
                      project.moic_target >= avgMoic ? 'text-green-400' : 'text-yellow-400'
                    )}>
                      {project.moic_target}×
                    </p>
                  </div>
                )}
              </div>
              {project.moic_target && (
                <p className={cn(
                  'text-xs',
                  project.moic_target >= avgMoic ? 'text-green-400' : 'text-yellow-400'
                )}>
                  {project.moic_target >= avgMoic
                    ? `Supérieur à la moyenne des projets approuvés (+${(project.moic_target - avgMoic).toFixed(2)}×)`
                    : `Inférieur à la moyenne des projets approuvés (-${(avgMoic - project.moic_target).toFixed(2)}×)`}
                </p>
              )}
            </div>
          )}

          {/* Répartition des décisions */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
            <h2 className="text-sm font-semibold text-gray-200">Répartition historique</h2>
            <div className="space-y-2">
              {(
                [
                  { type: 'approved' as DecisionType, count: approved },
                  { type: 'rejected' as DecisionType, count: rejected },
                  { type: 'deferred' as DecisionType, count: deferred },
                ]
              ).map(({ type, count }) => (
                <div key={type} className="flex items-center gap-3">
                  <span className={cn('text-xs font-semibold w-16', DECISION_COLORS[type])}>
                    {DECISION_LABELS[type]}
                  </span>
                  <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full',
                        type === 'approved' ? 'bg-green-500' : type === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
                      )}
                      style={{ width: total > 0 ? `${(count / total) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 w-12 text-right">
                    {total > 0 ? `${Math.round((count / total) * 100)}%` : '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function StatCard({
  label,
  value,
  accent = false,
  color = 'text-white',
}: {
  label: string
  value: string
  accent?: boolean
  color?: string
}): React.JSX.Element {
  return (
    <div className={cn('bg-gray-900 border rounded-xl p-4', accent ? 'border-blue-800' : 'border-gray-800')}>
      <p className="text-xs text-gray-500">{label}</p>
      <p className={cn('text-xl font-bold mt-1', color)}>{value}</p>
    </div>
  )
}
