import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'
import type { Database } from '@/types/database'

type ProjectStatus = Database['public']['Enums']['project_status']

const COLUMNS: { status: ProjectStatus; label: string; color: string; headerColor: string }[] = [
  { status: 'open', label: 'En évaluation', color: 'border-blue-900/50', headerColor: 'text-blue-400' },
  { status: 'closed', label: 'Quorum atteint', color: 'border-yellow-900/50', headerColor: 'text-yellow-400' },
  { status: 'decided', label: 'Décidés', color: 'border-green-900/50', headerColor: 'text-green-400' },
  { status: 'archived', label: 'Archivés', color: 'border-gray-800', headerColor: 'text-gray-600' },
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
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Portfolio Kanban</h1>
          <p className="text-gray-400 text-sm mt-1">Vue tableau des projets par statut</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/projects"
            className="text-xs px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
          >
            Vue liste
          </Link>
          {isAdmin && (
            <Link
              href="/projects/new"
              className="text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
            >
              + Nouveau projet
            </Link>
          )}
        </div>
      </div>

      {/* Colonnes kanban */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
        {COLUMNS.map((col) => {
          const colProjects = byStatus[col.status] ?? []
          return (
            <div key={col.status} className={cn('rounded-xl border bg-gray-950/50', col.color)}>
              {/* En-tête colonne */}
              <div className="px-4 py-3 border-b border-inherit flex items-center justify-between">
                <span className={cn('text-xs font-semibold uppercase tracking-wide', col.headerColor)}>
                  {col.label}
                </span>
                <span className="text-xs text-gray-600 font-mono">{colProjects.length}</span>
              </div>

              {/* Cartes */}
              <div className="p-3 space-y-2 min-h-32">
                {colProjects.length === 0 && (
                  <p className="text-xs text-gray-700 text-center py-4">Aucun projet</p>
                )}
                {colProjects.map((project) => {
                  const stats = statsMap[project.id]
                  const isOverdue =
                    project.evaluation_deadline &&
                    project.status === 'open' &&
                    new Date(project.evaluation_deadline) < now

                  return (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      className="block bg-gray-900 border border-gray-800 rounded-lg p-3 space-y-2 hover:border-gray-600 transition-colors"
                    >
                      <p className="text-sm font-medium text-white leading-tight line-clamp-2">
                        {project.title}
                      </p>

                      {project.sector && (
                        <p className="text-xs text-gray-500 truncate">{project.sector}</p>
                      )}

                      <div className="flex items-center gap-2 flex-wrap">
                        {project.horizon && (
                          <span className="text-xs text-gray-600 font-mono">{project.horizon}</span>
                        )}
                        {project.moic_target && (
                          <span className="text-xs text-gray-600">{project.moic_target}×</span>
                        )}
                        {isOverdue && (
                          <span className="text-xs text-red-400">⚠ Deadline</span>
                        )}
                      </div>

                      {stats && project.status !== 'archived' && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">
                            {stats.evaluation_count ?? 0}/{project.quorum_required} éval.
                          </span>
                          {stats.avg_score !== null && (
                            <span className={cn(
                              'font-semibold',
                              Number(stats.avg_score) >= 7 ? 'text-green-400' :
                              Number(stats.avg_score) >= 5 ? 'text-blue-400' : 'text-red-400'
                            )}>
                              {Number(stats.avg_score).toFixed(1)}
                            </span>
                          )}
                        </div>
                      )}
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
