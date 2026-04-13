import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'
import type { Database } from '@/types/database'

type ProjectStatus = Database['public']['Enums']['project_status']
type ProjectHorizon = Database['public']['Enums']['project_horizon']
type BarbellCat = Database['public']['Enums']['barbell_cat']

type SearchParams = {
  status?: ProjectStatus
  horizon?: ProjectHorizon
}

type ProjectsPageProps = {
  searchParams: Promise<SearchParams>
}

const STATUS_LABELS: Record<ProjectStatus, string> = {
  draft: 'Brouillon',
  'pre-mortem': 'Pré-mortem',
  open: 'Ouvert',
  closed: 'Fermé',
  decided: 'Décidé',
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

const HORIZON_COLORS: Record<ProjectHorizon, string> = {
  H1: 'text-emerald-400',
  H2: 'text-blue-400',
  H3: 'text-purple-400',
}

const BARBELL_LABELS: Record<BarbellCat, string> = {
  core: 'Core',
  growth: 'Growth',
  moonshot: '🌙 Moonshot',
}

const STATUS_FILTER_OPTIONS: Array<{ value: ProjectStatus | ''; label: string }> = [
  { value: '', label: 'Tous' },
  { value: 'draft', label: 'Brouillons' },
  { value: 'open', label: 'Ouverts' },
  { value: 'closed', label: 'Fermés' },
  { value: 'decided', label: 'Décidés' },
  { value: 'archived', label: 'Archivés' },
]

export default async function ProjectsPage({ searchParams }: ProjectsPageProps): Promise<React.JSX.Element> {
  const supabase = await createClient()
  const params = await searchParams

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user!.id)
    .single()

  const isContributeur = profile?.role === 'contributeur'

  let query = supabase
    .from('projects')
    .select('id, title, sector, status, horizon, barbell_category, tags, created_at, evaluation_deadline, moic_target, proposant_id')
    .order('created_at', { ascending: false })

  // Contributeurs ne voient pas les brouillons ni les pre-mortem
  if (isContributeur) {
    query = query.in('status', ['open', 'closed', 'decided', 'archived'])
  }

  // Filtres URL
  if (params.status) {
    query = query.eq('status', params.status)
  }
  if (params.horizon) {
    query = query.eq('horizon', params.horizon)
  }

  const { data: projects } = await query

  const activeFilters = [
    params.status ? STATUS_LABELS[params.status] : null,
    params.horizon ?? null,
  ].filter(Boolean)

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Projets</h1>
          <p className="text-gray-400 text-sm mt-1">
            {projects?.length ?? 0} projet{(projects?.length ?? 0) > 1 ? 's' : ''}
            {activeFilters.length > 0 && ` · Filtre : ${activeFilters.join(', ')}`}
          </p>
        </div>

        {!isContributeur && (
          <Link
            href="/projects/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors shrink-0"
          >
            + Soumettre un projet
          </Link>
        )}
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500 mr-1">Statut :</span>
          {STATUS_FILTER_OPTIONS.filter(
            (opt) => !isContributeur || !['draft', 'pre-mortem'].includes(opt.value),
          ).map((opt) => (
            <Link
              key={opt.value}
              href={opt.value ? `/projects?status=${opt.value}` : '/projects'}
              className={cn(
                'text-xs px-2.5 py-1 rounded-full border transition-colors',
                params.status === opt.value || (!params.status && opt.value === '')
                  ? 'border-blue-500 bg-blue-600/10 text-blue-300'
                  : 'border-gray-700 text-gray-500 hover:border-gray-600 hover:text-gray-300',
              )}
            >
              {opt.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500 mr-1">Horizon :</span>
          {(['', 'H1', 'H2', 'H3'] as const).map((h) => (
            <Link
              key={h}
              href={h ? (params.status ? `/projects?status=${params.status}&horizon=${h}` : `/projects?horizon=${h}`) : (params.status ? `/projects?status=${params.status}` : '/projects')}
              className={cn(
                'text-xs px-2.5 py-1 rounded-full border transition-colors',
                params.horizon === h || (!params.horizon && h === '')
                  ? 'border-blue-500 bg-blue-600/10 text-blue-300'
                  : 'border-gray-700 text-gray-500 hover:border-gray-600 hover:text-gray-300',
              )}
            >
              {h || 'Tous'}
            </Link>
          ))}
        </div>
      </div>

      {/* Liste */}
      {!projects?.length ? (
        <EmptyState isContributeur={isContributeur} hasFilters={activeFilters.length > 0} />
      ) : (
        <div className="grid gap-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Carte projet ─────────────────────────────────────────────────────────────

type ProjectRow = {
  id: string
  title: string
  sector: string | null
  status: ProjectStatus
  horizon: ProjectHorizon | null
  barbell_category: BarbellCat | null
  tags: string[] | null
  created_at: string
  evaluation_deadline: string | null
  moic_target: number | null
  proposant_id: string
}

function ProjectCard({ project }: { project: ProjectRow }): React.JSX.Element {
  const deadlineDate = project.evaluation_deadline
    ? new Date(project.evaluation_deadline)
    : null
  const isOverdue =
    deadlineDate !== null &&
    deadlineDate < new Date() &&
    project.status === 'open'

  return (
    <Link
      href={`/projects/${project.id}`}
      className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors block group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-2.5">
          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', STATUS_COLORS[project.status])}>
              {STATUS_LABELS[project.status]}
            </span>
            {project.horizon && (
              <span className={cn('text-xs font-mono font-bold', HORIZON_COLORS[project.horizon])}>
                {project.horizon}
              </span>
            )}
            {project.barbell_category && (
              <span className="text-xs text-gray-500">{BARBELL_LABELS[project.barbell_category]}</span>
            )}
          </div>

          {/* Titre */}
          <h3 className="font-semibold text-white group-hover:text-blue-300 transition-colors line-clamp-1">
            {project.title}
          </h3>

          {/* Métadonnées */}
          <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
            {project.sector && <span>{project.sector}</span>}
            {project.moic_target && (
              <>
                {project.sector && <span>·</span>}
                <span>MOIC cible : {project.moic_target}×</span>
              </>
            )}
            {deadlineDate && (
              <>
                <span>·</span>
                <span className={cn(isOverdue && 'text-red-400 font-medium')}>
                  {isOverdue ? '⚠ Deadline dépassée' : 'Deadline :'}{' '}
                  {deadlineDate.toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </>
            )}
          </div>

          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {project.tags.slice(0, 5).map((tag) => (
                <span key={tag} className="text-xs px-2 py-0.5 bg-gray-800 text-gray-400 rounded-full">
                  {tag}
                </span>
              ))}
              {project.tags.length > 5 && (
                <span className="text-xs text-gray-500">+{project.tags.length - 5}</span>
              )}
            </div>
          )}
        </div>

        <span className="text-gray-600 group-hover:text-gray-400 transition-colors shrink-0 mt-1">→</span>
      </div>
    </Link>
  )
}

// ─── État vide ────────────────────────────────────────────────────────────────

function EmptyState({
  isContributeur,
  hasFilters,
}: {
  isContributeur: boolean
  hasFilters: boolean
}): React.JSX.Element {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 flex flex-col items-center justify-center gap-3">
      <p className="text-gray-400 text-sm">
        {hasFilters ? 'Aucun projet ne correspond aux filtres sélectionnés' : 'Aucun projet pour l&apos;instant'}
      </p>
      {!isContributeur && !hasFilters && (
        <Link href="/projects/new" className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
          Soumettre le premier projet →
        </Link>
      )}
      {hasFilters && (
        <Link href="/projects" className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
          Réinitialiser les filtres
        </Link>
      )}
    </div>
  )
}
