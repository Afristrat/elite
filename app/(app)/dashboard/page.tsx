import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'
import { OnboardingWrapper } from '@/components/onboarding/onboarding-wrapper'
import { TourWidget } from '@/components/tour/tour-widget'
import type { Database } from '@/types/database'
import type { TourStep } from '@/components/tour/tour-segment'

type DecisionType = Database['public']['Enums']['decision_type']

type DashboardSearchParams = {
  tour?: string
  open?: string
  decided?: string
}

type DashboardPageProps = {
  searchParams: Promise<DashboardSearchParams>
}

const DECISION_LABELS: Record<DecisionType, string> = {
  approved: 'Approuvé',
  rejected: 'Rejeté',
  deferred: 'Différé',
}

const DECISION_BADGE_CLASSES: Record<DecisionType, string> = {
  approved:
    'bg-[color:var(--color-na-tertiary-container)]/10 text-[color:var(--color-na-tertiary-dim)] border border-[color:var(--color-na-tertiary-container)]/30',
  rejected:
    'bg-destructive/10 text-[color:var(--color-na-error-dim)] border border-destructive/30',
  deferred:
    'bg-secondary-container/50 text-secondary-fixed-dim border border-outline-variant/30',
}

export default async function DashboardPage({ searchParams }: DashboardPageProps): Promise<React.JSX.Element> {
  const supabase = await createClient()
  const sp = await searchParams

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user!.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  // Projets par statut
  const { data: projects } = await supabase
    .from('projects')
    .select('id, title, status, created_at, evaluation_deadline, quorum_required')
    .order('created_at', { ascending: false })

  const allProjects = projects ?? []

  // Filtrer selon le rôle (contributeurs ne voient pas les drafts)
  const visibleProjects = isAdmin
    ? allProjects
    : allProjects.filter((p) => p.status !== 'draft')

  const openProjects = visibleProjects.filter((p) => p.status === 'open')
  const closedProjects = visibleProjects.filter((p) => p.status === 'closed')
  const decidedProjects = visibleProjects.filter((p) => p.status === 'decided')

  // Évaluations de l'utilisateur courant
  const { data: myEvaluations } = await supabase
    .from('evaluations')
    .select('project_id')
    .eq('evaluateur_id', user!.id)

  const evaluatedProjectIds = new Set((myEvaluations ?? []).map((e) => e.project_id))

  // Projets ouverts que l'utilisateur n'a pas encore évalués (hors ses propres soumissions)
  const { data: ownProjects } = await supabase
    .from('projects')
    .select('id')
    .eq('proposant_id', user!.id)

  const ownProjectIds = new Set((ownProjects ?? []).map((p) => p.id))

  const toEvaluate = openProjects.filter(
    (p) => !evaluatedProjectIds.has(p.id) && !ownProjectIds.has(p.id),
  )

  // Décisions récentes (30 derniers jours)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: recentDecisions } = await supabase
    .from('decisions')
    .select(`
      id,
      decision,
      created_at,
      project_id,
      projects!decisions_project_id_fkey(title)
    `)
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: false })
    .limit(5)

  // Score moyen global (depuis la vue)
  const { data: statsRows } = await supabase
    .from('project_evaluation_stats')
    .select('avg_score')
    .not('avg_score', 'is', null)

  const avgScore =
    statsRows && statsRows.length > 0
      ? statsRows.reduce((acc, r) => acc + Number(r.avg_score ?? 0), 0) / statsRows.length
      : null

  // Projets avec deadline dans les 72h
  const now = new Date()
  const in72h = new Date(now.getTime() + 72 * 60 * 60 * 1000)
  const urgentProjects = openProjects.filter((p) => {
    if (!p.evaluation_deadline) return false
    const deadline = new Date(p.evaluation_deadline)
    return deadline > now && deadline <= in72h
  })

  // Étapes onboarding : complétées si l'utilisateur a déjà effectué l'action
  const hasSubmittedProject = (ownProjects ?? []).length > 0
  const hasEvaluated = (myEvaluations ?? []).length > 0
  const hasSeenDecisions = decidedProjects.length > 0 || (recentDecisions ?? []).length > 0

  const onboardingSteps = [
    {
      id: 'profile',
      title: 'Compléter son profil',
      description: 'Ajouter son nom complet dans les paramètres',
      href: '/settings/api-keys',
      completed: Boolean(profile?.full_name),
    },
    {
      id: 'project',
      title: 'Soumettre son premier projet',
      description: "Proposer un projet au comité d'investissement",
      href: '/projects/new',
      completed: hasSubmittedProject,
    },
    {
      id: 'evaluate',
      title: 'Évaluer un projet',
      description: "Contribuer à l'évaluation collective d'un projet ouvert",
      href: '/projects?status=open',
      completed: hasEvaluated,
    },
    {
      id: 'charter',
      title: 'Lire la Charte du Comité',
      description: 'Comprendre les règles de gouvernance de la plateforme',
      href: '/committee-charter',
      completed: hasSeenDecisions,
    },
  ]

  // ── Tour guidé — segment 1 (Dashboard) ────────────────────────────────────
  const isTour1 = sp.tour === '1'
  const tourOpen = sp.open ?? ''
  const tourDecided = sp.decided ?? ''
  const tourParams = `open=${tourOpen}&decided=${tourDecided}`

  const tour1Steps: TourStep[] = [
    {
      element: '[data-tour="dashboard-kpis"]',
      popover: {
        title: '📊 Votre portefeuille en temps réel',
        description:
          "Ces 4 indicateurs centralisent l'état de vos projets d'investissement. Combien sont ouverts à l'évaluation, combien attendent votre vote, et le score moyen global. Zéro WhatsApp — tout est ici, auditable et structuré.",
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="to-evaluate"]',
      popover: {
        title: "⭐ Votre file d'évaluation",
        description:
          "Ces projets attendent votre évaluation. Le vote est aveugle — vous ne verrez pas les scores des autres membres avant que le quorum soit atteint. C'est ce qui élimine le biais de conformité dans la décision collective.",
        side: 'top',
        align: 'start',
      },
    },
  ]

  return (
    <div className="space-y-8">
      {/* Tour guidé — segment 1 */}
      {isTour1 && (
        <TourWidget
          steps={tour1Steps}
          nextUrl={`/projects?tour=2&${tourParams}`}
          currentSegment={1}
          totalSegments={8}
        />
      )}

      {/* Alertes deadline */}
      {urgentProjects.length > 0 && (
        <div className="flex items-center gap-4 px-6 py-4 rounded-xl bg-amber-950/20 border border-amber-900/50 text-amber-200/90 text-sm">
          <span className="text-amber-500 shrink-0">⚠</span>
          <p className="font-medium">
            {urgentProjects.length} projet{urgentProjects.length > 1 ? 's' : ''} arrive
            {urgentProjects.length === 1 ? '' : 'nt'} à échéance dans moins de 72 h
          </p>
        </div>
      )}

      {/* Ligne principale : Onboarding + KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Onboarding */}
        <section className="lg:col-span-4 bg-surface-container rounded-xl p-6 relative">
          <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">
            Premiers pas
          </h3>
          <OnboardingWrapper steps={onboardingSteps} userId={user!.id} />
        </section>

        {/* KPIs */}
        <section
          className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4"
          data-tour="dashboard-kpis"
        >
          <KPICard
            label="Projets ouverts"
            value={openProjects.length}
            href="/projects?status=open"
          />
          <KPICard
            label="À évaluer"
            value={toEvaluate.length}
            href="/projects?status=open"
            accent
          />
          <KPICard
            label="Décisions (30 j)"
            value={recentDecisions?.length ?? 0}
            href="/decisions"
          />
          <KPICard
            label="Score moyen"
            value={avgScore !== null ? avgScore.toFixed(1) : '—'}
            valueSuffix={avgScore !== null ? '/ 10' : undefined}
            href="/projects"
            accentTertiary={avgScore !== null && avgScore >= 7}
          />
        </section>
      </div>

      {/* Deux colonnes : Décisions récentes + Statut portefeuille */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Décisions récentes */}
        <section className="bg-surface-container rounded-xl overflow-hidden flex flex-col">
          <div className="p-6 flex justify-between items-center border-b border-border/10">
            <h3 className="font-semibold text-lg text-on-surface">Décisions récentes</h3>
            <Link
              href="/decisions"
              className="text-sm text-primary font-medium flex items-center gap-1 hover:underline"
            >
              Voir toutes →
            </Link>
          </div>

          <div className="flex-1 px-2 py-4">
            {!recentDecisions?.length ? (
              <p className="text-sm text-on-surface-variant px-4 py-6">
                Aucune décision ce mois-ci
              </p>
            ) : (
              <div className="space-y-1">
                {recentDecisions.map((d) => {
                  const proj = d.projects as { title: string } | null
                  return (
                    <div
                      key={d.id}
                      className="flex items-center justify-between p-4 rounded-lg hover:bg-surface-container-high transition-colors group"
                    >
                      <div>
                        <Link
                          href={`/projects/${d.project_id}`}
                          className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors block"
                        >
                          {proj?.title ?? 'Projet supprimé'}
                        </Link>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          {new Date(d.created_at).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <span
                        className={cn(
                          'px-3 py-1 text-[0.65rem] font-bold uppercase tracking-widest rounded-full',
                          DECISION_BADGE_CLASSES[d.decision],
                        )}
                      >
                        {DECISION_LABELS[d.decision]}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>

        {/* Statut du portefeuille */}
        <section className="bg-surface-container rounded-xl p-6 flex flex-col">
          <h3 className="font-semibold text-lg text-on-surface mb-8">Statut du portefeuille</h3>

          <div className="space-y-8">
            <PortfolioRow
              label="Ouverts à l'évaluation"
              count={openProjects.length}
              href="/projects?status=open"
              colorClass="bg-primary"
              total={visibleProjects.length}
            />
            <PortfolioRow
              label="Quorum atteint — en attente de décision"
              count={closedProjects.length}
              href="/projects?status=closed"
              colorClass="bg-amber-500"
              total={visibleProjects.length}
            />
            <PortfolioRow
              label="Décidés"
              count={decidedProjects.length}
              href="/projects?status=decided"
              colorClass="bg-na-tertiary-dim"
              total={visibleProjects.length}
            />
          </div>

          <div className="mt-auto pt-8">
            <Link
              href="/projects"
              className="text-xs text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Voir tous les projets →
            </Link>
          </div>
        </section>
      </div>

      {/* Mes évaluations en attente */}
      {toEvaluate.length > 0 && profile?.role !== 'contributeur' && (
        <section
          className="bg-surface-container-low rounded-xl overflow-hidden"
          data-tour="to-evaluate"
        >
          <div className="p-6 border-b border-border/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-lg text-on-surface">À évaluer</h3>
              <span className="px-2 py-0.5 bg-primary-container/20 text-primary text-[0.6rem] font-bold rounded uppercase tracking-wider">
                PRIORITAIRE
              </span>
            </div>
          </div>

          <div className="divide-y divide-border/10">
            {toEvaluate.slice(0, 5).map((p) => {
              const deadline = p.evaluation_deadline ? new Date(p.evaluation_deadline) : null
              const hoursLeft =
                deadline
                  ? Math.round((deadline.getTime() - now.getTime()) / (1000 * 60 * 60))
                  : null
              const isUrgent = hoursLeft !== null && hoursLeft <= 72

              return (
                <div
                  key={p.id}
                  className="p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-surface-container-high/50 transition-all gap-4"
                >
                  <div className="flex-1">
                    <h4 className="font-bold text-on-surface">{p.title}</h4>
                  </div>
                  <div className="flex items-center gap-6">
                    {isUrgent && hoursLeft !== null && (
                      <span className="px-3 py-1 bg-amber-500/10 text-amber-500 text-[0.65rem] font-bold uppercase tracking-widest rounded-full border border-amber-500/20">
                        J-{Math.ceil(hoursLeft / 24)}
                      </span>
                    )}
                    <Link
                      href={`/projects/${p.id}/evaluate`}
                      className="px-5 py-2 bg-primary-container text-on-primary-container text-xs font-bold rounded-lg hover:bg-primary-container/80 transition-all"
                    >
                      Évaluer →
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}

// ─── Composants utilitaires ───────────────────────────────────────────────────

function KPICard({
  label,
  value,
  href,
  accent = false,
  accentTertiary = false,
  valueSuffix,
}: {
  label: string
  value: number | string
  href: string
  accent?: boolean
  accentTertiary?: boolean
  valueSuffix?: string
}): React.JSX.Element {
  return (
    <Link
      href={href}
      className={cn(
        'bg-surface-container-low rounded-xl p-6 flex flex-col justify-between hover:bg-surface-container-high transition-colors',
        accent && 'border border-primary/30 ring-1 ring-primary/10',
      )}
    >
      <p
        className={cn(
          'text-[0.7rem] uppercase font-bold tracking-widest',
          accent ? 'text-primary' : 'text-on-surface-variant',
        )}
      >
        {label}
      </p>
      <h4
        className={cn(
          'text-4xl font-bold mt-4',
          accent ? 'text-primary' : accentTertiary ? 'text-na-tertiary-dim' : 'text-on-surface',
        )}
      >
        {value}
        {valueSuffix && (
          <span className="text-base font-normal text-on-surface-variant ml-1">{valueSuffix}</span>
        )}
      </h4>
    </Link>
  )
}

function PortfolioRow({
  label,
  count,
  href,
  colorClass,
  total,
}: {
  label: string
  count: number
  href: string
  colorClass: string
  total: number
}): React.JSX.Element {
  const pct = total > 0 ? (count / total) * 100 : 0
  return (
    <Link href={href} className="block space-y-3 group">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-on-surface group-hover:text-primary transition-colors">
          {label}
        </span>
        <span className="font-bold text-on-surface">{count}</span>
      </div>
      <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', colorClass)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </Link>
  )
}
