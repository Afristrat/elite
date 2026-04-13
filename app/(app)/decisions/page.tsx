import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'
import type { Database } from '@/types/database'

type DecisionType = Database['public']['Enums']['decision_type']

const DECISION_LABELS: Record<DecisionType, string> = {
  approved: 'Approuvé',
  rejected: 'Rejeté',
  deferred: 'Différé',
}

const DECISION_COLORS: Record<DecisionType, string> = {
  approved: 'bg-green-600/20 text-green-300 border-green-900',
  rejected: 'bg-red-600/20 text-red-300 border-red-900',
  deferred: 'bg-yellow-600/20 text-yellow-300 border-yellow-900',
}

const DECISION_ICONS: Record<DecisionType, string> = {
  approved: '✓',
  rejected: '✗',
  deferred: '⏸',
}

export default async function DecisionsPage(): Promise<React.JSX.Element> {
  const supabase = await createClient()

  const { data: decisions } = await supabase
    .from('decisions')
    .select(`
      id,
      decision,
      rationale,
      real_option_data,
      created_at,
      project_id,
      made_by,
      projects!decisions_project_id_fkey(title, sector, horizon, barbell_category, moic_target, repo_url),
      profiles!decisions_made_by_fkey(full_name, email)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Journal des décisions</h1>
        <p className="text-gray-400 text-sm mt-1">
          {decisions?.length ?? 0} décision{(decisions?.length ?? 0) > 1 ? 's' : ''} enregistrée{(decisions?.length ?? 0) > 1 ? 's' : ''}
        </p>
      </div>

      {!decisions?.length ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <p className="text-gray-500 text-sm">Aucune décision enregistrée pour l&apos;instant</p>
          <p className="text-gray-600 text-xs mt-2">
            Les décisions apparaîtront ici une fois le quorum atteint et la décision validée
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {decisions.map((d) => {
            const project = d.projects as {
              title: string
              sector: string | null
              horizon: string | null
              barbell_category: string | null
              moic_target: number | null
              repo_url: string | null
            } | null

            const decider = d.profiles as {
              full_name: string | null
              email: string
            } | null

            const deciderName = decider?.full_name ?? decider?.email ?? 'Admin'
            const decisionDate = new Date(d.created_at)

            return (
              <div
                key={d.id}
                className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4"
              >
                {/* En-tête */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={cn(
                          'text-xs px-2.5 py-1 rounded-full font-semibold border',
                          DECISION_COLORS[d.decision],
                        )}
                      >
                        {DECISION_ICONS[d.decision]} {DECISION_LABELS[d.decision]}
                      </span>
                      {project?.horizon && (
                        <span className="text-xs text-gray-500 font-mono">{project.horizon}</span>
                      )}
                      {project?.barbell_category && (
                        <span className="text-xs text-gray-500 capitalize">{project.barbell_category}</span>
                      )}
                    </div>

                    <Link
                      href={`/projects/${d.project_id}`}
                      className="font-semibold text-white hover:text-blue-300 transition-colors block truncate"
                    >
                      {project?.title ?? 'Projet supprimé'}
                    </Link>

                    <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                      {project?.sector && <span>{project.sector}</span>}
                      {project?.moic_target && (
                        <>
                          {project.sector && <span>·</span>}
                          <span>MOIC cible : {project.moic_target}×</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0 space-y-1">
                    <p className="text-xs text-gray-400">{deciderName}</p>
                    <p className="text-xs text-gray-600">
                      {decisionDate.toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                {/* Justification */}
                <div className="border-t border-gray-800 pt-3">
                  <p className="text-xs text-gray-500 font-medium mb-1">Justification</p>
                  <p className="text-sm text-gray-300 leading-relaxed line-clamp-3">{d.rationale}</p>
                </div>

                {/* Pied de carte */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {project?.repo_url && (
                      <a
                        href={project.repo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        → Repo / Deal
                      </a>
                    )}
                    {d.real_option_data && (
                      <span className="text-xs text-yellow-400">⏸ Real Option configurée</span>
                    )}
                  </div>
                  <Link
                    href={`/projects/${d.project_id}/results`}
                    className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
                  >
                    Voir les résultats →
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
