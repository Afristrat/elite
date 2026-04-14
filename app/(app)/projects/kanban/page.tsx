import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'
import type { Database } from '@/types/database'

type ProjectStatus = Database['public']['Enums']['project_status']

const COLUMNS: {
  status: ProjectStatus
  label: string
  borderColor: string
  badgeColor: string
  badgeText: string
}[] = [
  {
    status: 'open',
    label: 'En évaluation',
    borderColor: 'border-blue-500',
    badgeColor: 'bg-blue-500/20 text-blue-400',
    badgeText: 'blue',
  },
  {
    status: 'closed',
    label: 'Quorum atteint',
    borderColor: 'border-yellow-500',
    badgeColor: 'bg-yellow-500/20 text-yellow-400',
    badgeText: 'yellow',
  },
  {
    status: 'decided',
    label: 'Décidés',
    borderColor: 'border-green-500',
    badgeColor: 'bg-green-500/20 text-green-400',
    badgeText: 'green',
  },
  {
    status: 'archived',
    label: 'Archivés',
    borderColor: 'border-gray-600',
    badgeColor: 'bg-gray-600/20 text-gray-400',
    badgeText: 'gray',
  },
]

export default async function KanbanPage(): Promise<React.JSX.Element> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user!.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  const { data: projects } = await supabase
    .from('projects')
    .select('id, title, status, sector, horizon, barbell_category, moic_target, evaluation_deadline, created_at, quorum_required')
    .in('status', ['open', 'closed', 'decided', 'archived'])
    .order('created_at', { ascending: false })

  // Stats par projet
  const { data: statsRows } = await supabase
    .from('project_evaluation_stats')
    .select('project_id, evaluation_count, avg_score, quorum_reached')

  const statsMap = Object.fromEntries(
    (statsRows ?? []).map((s) => [s.project_id, s]),
  )

  // Regrouper par statut
  const byStatus = Object.fromEntries(
    COLUMNS.map((col) => [
      col.status,
      (projects ?? []).filter((p) => p.status === col.status),
    ]),
  )

  const now = new Date()

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold tracking-wide text-on-surface">Portfolio Kanban</h1>
          <div className="h-6 w-px bg-border/30 mx-2" />
          <div className="flex bg-surface-container-low rounded-lg p-1">
            <Link
              href="/projects"
              className="px-4 py-1 text-xs font-medium text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Vue liste
            </Link>
            <span className="px-4 py-1 text-xs font-bold text-primary bg-surface-container-high rounded-md">
              Kanban
            </span>
          </div>
        </div>

        {isAdmin && (
          <Link
            href="/projects/new"
            className="text-xs px-4 py-2 bg-primary-container text-on-primary-container hover:bg-na-primary hover:text-on-primary rounded-xl font-semibold transition-all"
          >
            + Nouveau projet
          </Link>
        )}
      </div>

      {/* Colonnes kanban */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start">
        {COLUMNS.map((col) => {
          const colProjects = byStatus[col.status] ?? []
          return (
            <div key={col.status} className="w-full flex flex-col">
              {/* En-tête colonne */}
              <div className={cn('flex items-center justify-between mb-4 pb-2 border-t-2 pt-3', col.borderColor)}>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface">
                    {col.label}
                  </h3>
                  <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', col.badgeColor)}>
                    {colProjects.length}
                  </span>
                </div>
              </div>

              {/* Cartes */}
              <div className="space-y-4 min-h-32">
                {colProjects.length === 0 && col.status === 'archived' && (
                  <div className="border-2 border-dashed border-border/10 rounded-xl flex items-center justify-center p-8 text-center bg-surface-container-low/50">
                    <div>
                      <p className="text-on-surface-variant text-sm font-medium">Aucun projet</p>
                      <p className="text-[10px] text-on-surface-variant/40 mt-1 uppercase tracking-widest">
                        Les dossiers archivés apparaîtront ici
                      </p>
                    </div>
                  </div>
                )}
                {colProjects.length === 0 && col.status !== 'archived' && (
                  <p className="text-xs text-on-surface-variant/40 text-center py-4">Aucun projet</p>
                )}

                {colProjects.map((project) => {
                  const stats = statsMap[project.id]
                  const isOverdue =
                    project.evaluation_deadline &&
                    project.status === 'open' &&
                    new Date(project.evaluation_deadline) < now

                  const isDecided = project.status === 'decided'

                  return (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      className={cn(
                        'block p-4 rounded-lg hover:bg-surface-container-high transition-all cursor-pointer border border-transparent hover:border-border/20',
                        isDecided
                          ? 'bg-surface-container border border-na-primary/20 bg-primary/5'
                          : 'bg-surface-container',
                      )}
                    >
                      <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                          <div className="min-w-0 flex-1">
                            <h4 className="text-on-surface text-sm font-semibold leading-snug line-clamp-2">
                              {project.title}
                            </h4>
                            {project.sector && (
                              <span className="text-on-surface-variant text-[10px] uppercase font-bold tracking-tighter mt-0.5 block">
                                {project.sector}
                              </span>
                            )}
                          </div>
                          {isDecided && (
                            <span className="text-na-primary text-sm ml-2 shrink-0">✓</span>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {project.horizon && (
                              <span className="bg-surface-container-highest text-on-surface-variant text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                                {project.horizon}
                              </span>
                            )}
                            {project.moic_target && (
                              <span className="text-on-surface-variant text-[11px] font-medium">
                                MOIC: <span className="text-on-surface">{project.moic_target}×</span>
                              </span>
                            )}
                            {isOverdue && (
                              <span className="text-xs text-na-error font-semibold">⚠ Deadline</span>
                            )}
                          </div>

                          {stats && project.status !== 'archived' && (
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-on-surface-variant font-medium">
                                {stats.evaluation_count ?? 0}/{project.quorum_required} éval.
                              </span>
                              {stats.avg_score !== null && (
                                <span className={cn(
                                  'font-mono text-xs font-bold',
                                  Number(stats.avg_score) >= 7 ? 'text-na-tertiary-dim' :
                                  Number(stats.avg_score) >= 5 ? 'text-na-primary' : 'text-na-error'
                                )}>
                                  {Number(stats.avg_score).toFixed(1)}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
