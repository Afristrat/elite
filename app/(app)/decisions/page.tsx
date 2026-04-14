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

const DECISION_BADGE_CLASSES: Record<DecisionType, string> = {
  approved:
    'bg-[color:var(--color-na-tertiary-container)]/10 border border-[color:var(--color-na-tertiary-container)]/30 text-[color:var(--color-na-tertiary-container)]',
  rejected:
    'bg-destructive/10 border border-destructive/30 text-[color:var(--color-na-error)]',
  deferred:
    'bg-secondary-container/30 border border-secondary/20 text-on-secondary-container',
}

const DECISION_ICONS: Record<DecisionType, string> = {
  approved: 'check_circle',
  rejected: 'cancel',
  deferred: 'pause_circle',
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
          "Chaque décision — approuvée, rejetée ou différée — est inscrite de façon permanente avec sa justification et le nom du décideur. Ni l'admin ni personne ne peut la modifier ou la supprimer. C'est votre audit trail légal et la mémoire institutionnelle du groupe.",
        side: 'top',
        align: 'start',
      },
    },
  ]

  const tour6NextUrl = isAdminUser ? `/analytics?tour=7&${tourParams}` : null

  return (
    <div className="space-y-8">
      {/* Tour guidé — segment 6 */}
      {isTour6 && (
        <TourWidget
          steps={tour6Steps}
          nextUrl={tour6NextUrl}
          currentSegment={6}
          totalSegments={isAdminUser ? 8 : 6}
        />
      )}

      {/* En-tête */}
      <div className="mb-10">
        <div className="flex items-baseline gap-3">
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">
            Journal des décisions immuables
          </h1>
          <span className="text-sm font-medium text-outline">
            ({decisions?.length ?? 0} décision{(decisions?.length ?? 0) > 1 ? 's' : ''})
          </span>
        </div>
        <p className="mt-2 text-on-surface-variant text-sm">
          Toutes les décisions du comité, dans l&apos;ordre chronologique
        </p>
      </div>

      {/* Liste des décisions */}
      {!decisions?.length ? (
        <div className="bg-surface-container rounded-xl p-12 text-center">
          <p className="text-on-surface-variant text-sm">Aucune décision enregistrée pour l&apos;instant</p>
          <p className="text-outline text-xs mt-2">
            Les décisions apparaîtront ici une fois le quorum atteint et la décision validée
          </p>
        </div>
      ) : (
        <div className="space-y-8" data-tour="decisions-list">
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
                className="bg-surface-container rounded-xl p-6 hover:bg-surface-container-high transition-colors duration-300"
              >
                {/* En-tête de la carte */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span
                      className={cn(
                        'inline-flex items-center px-3 py-1 rounded-full text-[0.625rem] font-bold tracking-wider uppercase gap-1',
                        DECISION_BADGE_CLASSES[d.decision],
                      )}
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {DECISION_ICONS[d.decision]}
                      </span>
                      {DECISION_LABELS[d.decision]}
                    </span>

                    {project?.horizon && (
                      <span className="text-xs font-mono text-outline-variant tracking-tighter">
                        {project.horizon}
                      </span>
                    )}

                    {project?.barbell_category && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary-container/20 text-primary-dim text-[0.625rem] font-bold tracking-wider uppercase">
                        {project.barbell_category}
                      </span>
                    )}

                    {d.real_option_data && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-[0.625rem] font-bold tracking-wider uppercase">
                        Real Option
                      </span>
                    )}
                  </div>

                  <span className="text-xs text-on-surface-variant font-medium shrink-0">
                    {decisionDate.toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                {/* Titre du projet */}
                <Link
                  href={`/projects/${d.project_id}`}
                  className="text-lg font-semibold text-on-surface mb-2 tracking-tight block hover:text-primary transition-colors"
                >
                  {project?.title ?? 'Projet supprimé'}
                </Link>

                {/* Méta */}
                <div className="flex gap-2 text-[0.6875rem] font-medium text-on-surface-variant uppercase tracking-wider mb-4 flex-wrap">
                  {project?.sector && <span>{project.sector}</span>}
                  {project?.sector && project?.moic_target && (
                    <span className="text-outline-variant opacity-30">•</span>
                  )}
                  {project?.moic_target && <span>MOIC : {project.moic_target}×</span>}
                  {(project?.sector || project?.moic_target) && (
                    <span className="text-outline-variant opacity-30">•</span>
                  )}
                  <span>Décidé par {deciderName}</span>
                </div>

                {/* Justification */}
                <p className="text-sm text-secondary-dim leading-relaxed mb-6 max-w-3xl line-clamp-3">
                  {d.rationale}
                </p>

                {/* Pied de carte */}
                <div className="flex items-center justify-between pt-4 border-t border-outline-variant/10">
                  <div className="flex items-center gap-3">
                    {project?.repo_url && (
                      <a
                        href={project.repo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-primary text-[0.6875rem] font-bold tracking-wide hover:underline"
                      >
                        <span className="material-symbols-outlined text-[14px]">link</span>
                        VOIR LE REPO
                      </a>
                    )}
                  </div>

                  <Link
                    href={`/projects/${d.project_id}/results`}
                    className="text-on-surface-variant text-[0.6875rem] font-medium flex items-center gap-1 hover:text-on-surface transition-colors"
                  >
                    Voir les résultats{' '}
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
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
