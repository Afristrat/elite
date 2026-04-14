import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'
import { TourWidget } from '@/components/tour/tour-widget'
import type { Database } from '@/types/database'
import type { TourStep } from '@/components/tour/tour-segment'

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

type DecisionsPageProps = {
  searchParams: Promise<{ tour?: string; open?: string; decided?: string }>
}

export default async function DecisionsPage({ searchParams }: DecisionsPageProps): Promise<React.JSX.Element> {
  const sp = await searchParams
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

  // ── Tour guidé — segment 6 (Décisions) ────────────────────────────────────
  // On lit le profil pour savoir si admin (pour définir nextUrl)
  const {
    data: { user: tourUser },
  } = await supabase.auth.getUser()
  const { data: tourProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', tourUser!.id)
    .single()

  const isTour6 = sp.tour === '6'
  const tourOpen = sp.open ?? ''
  const tourDecided = sp.decided ?? ''
  const tourParams = `open=${tourOpen}&decided=${tourDecided}`
  const isAdminUser = tourProfile?.role === 'admin'

  const tour6Steps: TourStep[] = [
    {
      element: '[data-tour="decisions-list"]',
      popover: {
        title: '⚖️ Journal des décisions immuables',
        description:
          'Chaque décision — approuvée, rejetée ou différée — est inscrite de façon permanente avec sa justification et le nom du décideur. Ni l\'admin ni personne ne peut la modifier ou la supprimer. C\'est votre audit trail légal et la mémoire institutionnelle du groupe.',
        side: 'top',
        align: 'start',
      },
    },
  ]

  const tour6NextUrl = isAdminUser
    ? `/analytics?tour=7&${tourParams}`
    : null

  return (
    <div className="space-y-6">
      {/* Tour guidé — segment 6 */}
      {isTour6 && (
        <TourWidget
          steps={tour6Steps}
          nextUrl={tour6NextUrl}
          currentSegment={6}
          totalSegments={isAdminUser ? 8 : 6}
        />
      )}

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
        <div className="space-y-4" data-tour="decisions-list">
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
