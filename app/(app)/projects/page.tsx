import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'
import { TourWidget } from '@/components/tour/tour-widget'
import type { Database } from '@/types/database'
import type { TourStep } from '@/components/tour/tour-segment'

type ProjectStatus = Database['public']['Enums']['project_status']
type ProjectHorizon = Database['public']['Enums']['project_horizon']
type BarbellCat = Database['public']['Enums']['barbell_cat']

type SearchParams = {
  status?: ProjectStatus
  horizon?: ProjectHorizon
  tour?: string
  open?: string
  decided?: string
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
  draft: 'bg-surface-container-highest text-on-surface-variant',
  'pre-mortem': 'bg-na-secondary-container text-on-surface-variant',
  open: 'bg-primary-container/30 text-na-primary',
  closed: 'bg-na-secondary-container/40 text-na-secondary',
  decided: 'bg-na-tertiary-container/20 text-na-tertiary-dim',
  archived: 'bg-surface-container-highest text-on-surface-variant',
}

const HORIZON_COLORS: Record<ProjectHorizon, string> = {
  H1: 'text-na-tertiary-dim',
  H2: 'text-na-primary',
  H3: 'text-na-secondary',
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

  // ── Tour guidé — segment 2 (Projets) ──────────────────────────────────────
  const isTour2 = params.tour === '2'
  const tourOpen = params.open ?? ''
  const tourDecided = params.decided ?? ''
  const tourParams = `open=${tourOpen}&decided=${tourDecided}`

  const tour2Steps: TourStep[] = [
    {
      element: '[data-tour="new-project-btn"]',
      popover: {
        title: '✍️ Soumettre un projet',
        description:
          'Le formulaire guide en 5 étapes structurées : identité du projet, description du problème et de la solution, finances et simulation Monte Carlo, thèse d\'investissement, finalisation. L\'IA assiste chaque champ. Durée typique : 20–30 min pour un dossier complet.',
        side: 'bottom',
        align: 'end',
      },
    },
    {
      element: '[data-tour="projects-grid"]',
      popover: {
        title: '📁 Le pipeline de décision',
        description:
          'Chaque carte est un projet dans le pipeline. Les couleurs indiquent le statut : Bleu = ouvert à l\'évaluation, Jaune = quorum atteint (en attente de décision), Vert = décision prise. Cliquez sur le prochain écran pour explorer un projet ouvert en détail.',
        side: 'top',
        align: 'start',
      },
    },
  ]

  return (
    <div className="space-y-8">
      {/* Tour guidé — segment 2 */}
      {isTour2 && tourOpen && (
        <TourWidget
          steps={tour2Steps}
          nextUrl={`/projects/${tourOpen}?tour=3&${tourParams}`}
          currentSegment={2}
          totalSegments={8}
        />
      )}

      {/* En-tête */}
      <header className="flex justify-between items-end">
        <div className="space-y-1">
          <div className="flex items-baseline gap-3">
            <h1 className="text-2xl font-bold text-on-surface tracking-tight">Projets</h1>
            <span className="text-on-surface-variant/60 font-medium">
              ({projects?.length ?? 0})
            </span>
          </div>
          {activeFilters.length > 0 && (
            <p className="text-xs text-on-surface-variant/50 font-medium uppercase tracking-widest">
              Filtre : {activeFilters.join(' · ')}
            </p>
          )}
        </div>

        {!isContributeur && (
          <Link
            href="/projects/new"
            data-tour="new-project-btn"
            className="bg-primary-container text-on-primary-container px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-na-primary hover:text-on-primary transition-all flex items-center gap-2"
          >
            <span>+</span>
            Soumettre un projet
          </Link>
        )}
      </header>

      {/* Filtres */}
      <section className="space-y-6">
        {/* Filtre statut */}
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTER_OPTIONS.filter(
            (opt) => !isContributeur || !['draft', 'pre-mortem'].includes(opt.value),
          ).map((opt) => (
            <Link
              key={opt.value}
              href={opt.value ? `/projects?status=${opt.value}` : '/projects'}
              className={cn(
                'px-5 py-2 rounded-full text-xs font-semibold transition-colors',
                params.status === opt.value || (!params.status && opt.value === '')
                  ? 'bg-na-primary text-on-primary shadow-lg shadow-primary/10'
                  : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface',
              )}
            >
              {opt.label}
            </Link>
          ))}
        </div>

        {/* Filtre horizon */}
        <div className="flex items-center gap-8 border-t border-border/10 pt-6">
          <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/50">
            Horizon
          </span>
          <div className="flex gap-6">
            {(['', 'H1', 'H2', 'H3'] as const).map((h) => (
              <Link
                key={h}
                href={
                  h
                    ? params.status
                      ? `/projects?status=${params.status}&horizon=${h}`
                      : `/projects?horizon=${h}`
                    : params.status
                      ? `/projects?status=${params.status}`
                      : '/projects'
                }
                className={cn(
                  'text-sm font-medium pb-1 transition-colors',
                  params.horizon === h || (!params.horizon && h === '')
                    ? 'text-na-primary border-b-2 border-na-primary'
                    : 'text-on-surface-variant hover:text-on-surface',
                )}
              >
                {h || 'Tous horizons'}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Liste */}
      {!projects?.length ? (
        <EmptyState isContributeur={isContributeur} hasFilters={activeFilters.length > 0} />
      ) : (
        <div className="flex flex-col gap-3" data-tour="projects-grid">
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
      className="group relative bg-surface-container hover:bg-surface-container-high transition-all duration-300 rounded-xl p-6 flex items-center gap-8 cursor-pointer overflow-hidden"
    >
      {/* Indicateur latéral hover */}
      <div className="absolute left-0 top-0 h-full w-1 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-l-xl" />

      <div className="flex-1 min-w-0">
        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <span className={cn('px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider', STATUS_COLORS[project.status])}>
            {STATUS_LABELS[project.status]}
          </span>
          {project.horizon && (
            <span className={cn('px-2 py-0.5 rounded text-[10px] font-mono bg-surface-container-lowest border border-border/10', HORIZON_COLORS[project.horizon])}>
              {project.horizon}
            </span>
          )}
          {project.barbell_category && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary-container/10 text-na-primary">
              {BARBELL_LABELS[project.barbell_category]}
            </span>
          )}
        </div>

        {/* Titre */}
        <h3 className="text-lg font-semibold text-on-surface truncate leading-snug group-hover:text-na-primary transition-colors">
          {project.title}
        </h3>

        {/* Métadonnées */}
        <div className="flex items-center gap-4 mt-2 flex-wrap">
          {project.sector && (
            <span className="text-xs text-on-surface-variant">{project.sector}</span>
          )}
          {project.moic_target && (
            <>
              {project.sector && <span className="text-on-surface-variant/20">•</span>}
              <span className="text-xs text-on-surface-variant">
                MOIC : <span className="text-on-surface font-medium">{project.moic_target}×</span>
              </span>
            </>
          )}
          {deadlineDate && (
            <>
              <span className="text-on-surface-variant/20">•</span>
              <span className={cn('text-xs flex items-center gap-1', isOverdue ? 'text-na-error font-semibold' : 'text-on-surface-variant')}>
                {isOverdue && <span>⚠</span>}
                {isOverdue ? 'Deadline dépassée —' : ''}{' '}
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
          <div className="flex flex-wrap gap-1.5 mt-3">
            {project.tags.slice(0, 5).map((tag) => (
              <span key={tag} className="text-xs px-2 py-0.5 bg-surface-container-highest text-on-surface-variant rounded-full">
                {tag}
              </span>
            ))}
            {project.tags.length > 5 && (
              <span className="text-xs text-on-surface-variant/40">+{project.tags.length - 5}</span>
            )}
          </div>
        )}
      </div>

      <span className="text-on-surface-variant/30 group-hover:text-on-surface-variant transition-colors shrink-0 mt-1 text-lg">
        →
      </span>
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
    <div className="bg-surface-container/40 border border-dashed border-border/20 rounded-xl p-12 flex flex-col items-center justify-center gap-3">
      <p className="text-on-surface-variant text-sm">
        {hasFilters ? 'Aucun projet ne correspond aux filtres sélectionnés' : 'Aucun projet pour l\'instant'}
      </p>
      {!isContributeur && !hasFilters && (
        <Link href="/projects/new" className="text-na-primary hover:text-on-surface-variant text-sm transition-colors">
          Soumettre le premier projet →
        </Link>
      )}
      {hasFilters && (
        <Link href="/projects" className="text-na-primary hover:text-on-surface-variant text-sm transition-colors">
          Réinitialiser les filtres
        </Link>
      )}
    </div>
  )
}
