import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'
import { ArchiveButton } from '@/components/projects/archive-button'
import { ProjectTabs } from '@/components/projects/project-tabs'
import type { Database } from '@/types/database'

type ProjectStatus = Database['public']['Enums']['project_status']
type ProjectHorizon = Database['public']['Enums']['project_horizon']

const STATUS_LABELS: Record<ProjectStatus, string> = {
  draft: 'Brouillon',
  'pre-mortem': 'Pré-mortem',
  open: 'Ouvert à l\'évaluation',
  closed: 'Évaluation fermée',
  decided: 'Décision prise',
  archived: 'Archivé',
}

const STATUS_COLORS: Record<ProjectStatus, string> = {
  draft: 'bg-gray-700/60 text-gray-300',
  'pre-mortem': 'bg-purple-600/20 text-purple-300',
  open: 'bg-blue-600/20 text-blue-300',
  closed: 'bg-yellow-600/20 text-yellow-300',
  decided: 'bg-green-600/20 text-green-300',
  archived: 'bg-gray-800 text-gray-500',
}

const HORIZON_LABELS: Record<ProjectHorizon, string> = {
  H1: 'H1 — Court terme (0–18 mois)',
  H2: 'H2 — Moyen terme (18 mois – 3 ans)',
  H3: 'H3 — Long terme (3 ans et +)',
}

type ProjectLayoutProps = {
  params: Promise<{ id: string }>
  children: React.ReactNode
}

export default async function ProjectLayout({ params, children }: ProjectLayoutProps): Promise<React.JSX.Element> {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [{ data: profile }, { data: project }] = await Promise.all([
    supabase.from('profiles').select('role').eq('id', user!.id).single(),
    supabase
      .from('projects')
      .select('id, title, sector, status, proposant_id, horizon')
      .eq('id', id)
      .single(),
  ])

  if (!project) notFound()

  // Contributeurs ne voient pas les brouillons
  if (profile?.role === 'contributeur' && project.status === 'draft') notFound()

  const isProposant = project.proposant_id === user!.id
  const isAdmin = profile?.role === 'admin'

  // Admins peuvent évaluer même si proposants (cas des projets démo)
  const canEvaluate =
    (isAdmin || !isProposant) &&
    project.status === 'open' &&
    profile?.role !== 'contributeur'

  return (
    <div className="space-y-6 max-w-4xl">
      {/* En-tête */}
      <div className="flex items-start justify-between gap-4" data-tour="project-header">
        <div className="space-y-2">
          <Link
            href="/projects"
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            ← Retour aux projets
          </Link>

          <div className="flex items-center gap-3 flex-wrap">
            <span className={cn('text-sm px-2.5 py-1 rounded-full font-medium', STATUS_COLORS[project.status])}>
              {STATUS_LABELS[project.status]}
            </span>
            {project.horizon && (
              <span className="text-xs text-gray-400">{HORIZON_LABELS[project.horizon]}</span>
            )}
          </div>

          <h1 className="text-2xl font-bold text-white">{project.title}</h1>
          {project.sector && (
            <p className="text-gray-400 text-sm">{project.sector}</p>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {canEvaluate && (
            <Link
              href={`/projects/${id}/evaluate`}
              data-tour="evaluate-btn"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Évaluer ce projet
            </Link>
          )}
          {isAdmin && project.status === 'decided' && (
            <ArchiveButton projectId={id} projectTitle={project.title} />
          )}
        </div>
      </div>

      {/* Navigation par onglets */}
      <ProjectTabs id={id} />

      {/* Contenu de la page active */}
      {children}
    </div>
  )
}
