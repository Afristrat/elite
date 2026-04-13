import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'
import { OnboardingWrapper } from '@/components/onboarding/onboarding-wrapper'
import type { Database } from '@/types/database'

type DecisionType = Database['public']['Enums']['decision_type']

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

export default async function DashboardPage(): Promise<React.JSX.Element> {
  const supabase = await createClient()

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

  const firstName = profile?.full_name?.split(' ')[0] ?? null

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
      description: 'Proposer un projet au comité d\'investissement',
      href: '/projects/new',
      completed: hasSubmittedProject,
    },
    {
      id: 'evaluate',
      title: 'Évaluer un projet',
      description: 'Contribuer à l\'évaluation collective d\'un projet ouvert',
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

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Bonjour{firstName ? `, ${firstName}` : ''}
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Tableau de bord du portefeuille Veille Élite
        </p>
      </div>

      {/* Onboarding */}
      <OnboardingWrapper steps={onboardingSteps} userId={user!.id} />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          label="Projets ouverts"
          value={openProjects.length}
          href="/projects?status=open"
          accent={openProjects.length > 0}
        />
        <KPICard
          label="À évaluer"
          value={toEvaluate.length}
          href="/projects?status=open"
          accent={toEvaluate.length > 0}
          accentColor="blue"
        />
        <KPICard
          label="Décisions (30 j)"
          value={recentDecisions?.length ?? 0}
          href="/decisions"
        />
        <KPICard
          label="Score moyen global"
          value={avgScore !== null ? `${avgScore.toFixed(1)} / 10` : '—'}
          href="/projects"
          accent={avgScore !== null && avgScore >= 7}
          accentColor="green"
        />
      </div>

      {/* Alertes deadline */}
      {urgentProjects.length > 0 && (
        <div className="bg-yellow-950/20 border border-yellow-900/50 rounded-xl p-4 space-y-2">
          <p className="text-xs font-semibold text-yellow-400 uppercase tracking-wide">
            ⚠ Évaluations à clôturer dans 72h
          </p>
          <div className="space-y-1.5">
            {urgentProjects.map((p) => {
              const deadline = new Date(p.evaluation_deadline!)
              const hoursLeft = Math.round(
                (deadline.getTime() - now.getTime()) / (1000 * 60 * 60),
              )
              return (
                <div key={p.id} className="flex items-center justify-between gap-2">
                  <Link
                    href={`/projects/${p.id}`}
                    className="text-sm text-white hover:text-yellow-300 transition-colors truncate"
                  >
                    {p.title}
                  </Link>
                  <span className="text-xs text-yellow-500 shrink-0">{hoursLeft}h restantes</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Décisions récentes */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-200">Décisions récentes</h2>
            <Link href="/decisions" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
              Tout voir →
            </Link>
          </div>

          {!recentDecisions?.length ? (
            <p className="text-sm text-gray-600">Aucune décision ce mois-ci</p>
          ) : (
            <div className="space-y-3">
              {recentDecisions.map((d) => {
                const proj = d.projects as { title: string } | null
                return (
                  <div key={d.id} className="flex items-center justify-between gap-2">
                    <Link
                      href={`/projects/${d.project_id}`}
                      className="text-sm text-gray-300 hover:text-white transition-colors truncate"
                    >
                      {proj?.title ?? 'Projet supprimé'}
                    </Link>
                    <span className={cn('text-xs font-semibold shrink-0', DECISION_COLORS[d.decision])}>
                      {DECISION_LABELS[d.decision]}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Statut du portefeuille */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-200">Statut du portefeuille</h2>

          <div className="space-y-3">
            <PortfolioRow
              label="Ouverts à l'évaluation"
              count={openProjects.length}
              href="/projects?status=open"
              color="bg-blue-500"
              total={visibleProjects.length}
            />
            <PortfolioRow
              label="Quorum atteint — en attente de décision"
              count={closedProjects.length}
              href="/projects?status=closed"
              color="bg-yellow-500"
              total={visibleProjects.length}
            />
            <PortfolioRow
              label="Décidés"
              count={decidedProjects.length}
              href="/projects?status=decided"
              color="bg-green-500"
              total={visibleProjects.length}
            />
          </div>

          <div className="pt-2 border-t border-gray-800">
            <Link
              href="/projects"
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Voir tous les projets →
            </Link>
          </div>
        </div>
      </div>

      {/* Mes évaluations en attente */}
      {toEvaluate.length > 0 && profile?.role !== 'contributeur' && (
        <div className="bg-gray-900 border border-blue-900/40 rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-semibold text-gray-200">
            Projets en attente de mon évaluation ({toEvaluate.length})
          </h2>
          <div className="space-y-2">
            {toEvaluate.slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-2">
                <Link
                  href={`/projects/${p.id}`}
                  className="text-sm text-gray-300 hover:text-white transition-colors truncate"
                >
                  {p.title}
                </Link>
                <Link
                  href={`/projects/${p.id}/evaluate`}
                  className="text-xs px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shrink-0"
                >
                  Évaluer
                </Link>
              </div>
            ))}
          </div>
        </div>
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
  accentColor = 'yellow',
}: {
  label: string
  value: number | string
  href: string
  accent?: boolean
  accentColor?: 'yellow' | 'blue' | 'green'
}): React.JSX.Element {
  const borderClass = accent
    ? accentColor === 'blue'
      ? 'border-blue-800'
      : accentColor === 'green'
        ? 'border-green-800'
        : 'border-yellow-800'
    : 'border-gray-800'

  const valueClass = accent
    ? accentColor === 'blue'
      ? 'text-blue-400'
      : accentColor === 'green'
        ? 'text-green-400'
        : 'text-yellow-400'
    : 'text-white'

  return (
    <Link href={href} className={cn('bg-gray-900 border rounded-xl p-4 block hover:border-gray-600 transition-colors', borderClass)}>
      <p className="text-xs text-gray-500">{label}</p>
      <p className={cn('text-2xl font-bold mt-1.5', valueClass)}>{value}</p>
    </Link>
  )
}

function PortfolioRow({
  label,
  count,
  href,
  color,
  total,
}: {
  label: string
  count: number
  href: string
  color: string
  total: number
}): React.JSX.Element {
  const pct = total > 0 ? (count / total) * 100 : 0
  return (
    <Link href={href} className="block space-y-1 group">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-400 group-hover:text-gray-200 transition-colors">{label}</span>
        <span className="text-gray-500 font-mono">{count}</span>
      </div>
      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </Link>
  )
}
