import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'
import { ArchiveButton } from '@/components/projects/archive-button'
import type { Database } from '@/types/database'

type ProjectStatus = Database['public']['Enums']['project_status']
type ProjectHorizon = Database['public']['Enums']['project_horizon']
type BarbellCat = Database['public']['Enums']['barbell_cat']

type ProjectDetailPageProps = {
  params: Promise<{ id: string }>
}

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

const BARBELL_LABELS: Record<BarbellCat, string> = {
  core: 'Core — Actif stable',
  growth: 'Growth — Croissance modérée',
  moonshot: 'Moonshot — Haut risque / haut rendement',
}

type MarketResearch = {
  problem?: string
  solution?: string
  value_proposition?: string
  investment_amount?: number
  currency?: string
  key_risks?: string
  key_hypotheses?: string
}

type Scenario = {
  probability?: number
  moic?: number
  description?: string
}

type Scenarios = {
  pessimistic?: Scenario
  realistic?: Scenario
  optimistic?: Scenario
}

type InvestmentThesis = {
  statement?: string
  hypotheses?: [string, string, string]
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps): Promise<React.JSX.Element> {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, id')
    .eq('id', user!.id)
    .single()

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (!project) notFound()

  // Les contributeurs ne peuvent pas voir les drafts
  if (profile?.role === 'contributeur' && project.status === 'draft') notFound()

  const isProposant = project.proposant_id === user!.id
  const canEvaluate =
    !isProposant &&
    project.status === 'open' &&
    profile?.role !== 'contributeur'

  const marketResearch = project.market_research as MarketResearch | null
  const scenarios = project.scenarios as Scenarios | null
  const thesis = project.investment_thesis as InvestmentThesis | null

  // Récupérer les statistiques d'évaluation (vue)
  const { data: stats } = await supabase
    .from('project_evaluation_stats')
    .select('*')
    .eq('project_id', id)
    .single()

  // Récupérer les thèses macro associées
  const { data: theses } = project.thesis_ids?.length
    ? await supabase
        .from('portfolio_theses')
        .select('id, title')
        .in('id', project.thesis_ids)
    : { data: null }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* En-tête */}
      <div className="flex items-start justify-between gap-4">
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
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Évaluer ce projet
            </Link>
          )}
          {profile?.role === 'admin' && project.status === 'decided' && (
            <ArchiveButton projectId={id} projectTitle={project.title} />
          )}
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex gap-1 border-b border-gray-800 pb-0">
        {[
          { label: 'Aperçu', href: `/projects/${id}`, active: true },
          { label: 'Évaluation', href: `/projects/${id}/evaluate`, active: false },
          { label: 'Résultats', href: `/projects/${id}/results`, active: false },
          { label: 'AAR', href: `/projects/${id}/aar`, active: false },
        ].map((tab) => (
          <Link
            key={tab.label}
            href={tab.href}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              tab.active
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-300',
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Statistiques */}
      {stats && project.status !== 'draft' && (
        <div className="grid grid-cols-3 gap-4">
          <StatCard
            label="Évaluations"
            value={`${stats.evaluation_count ?? 0} / ${stats.quorum_required ?? '?'}`}
          />
          <StatCard
            label="Score moyen"
            value={stats.avg_score !== null ? `${Number(stats.avg_score).toFixed(1)} / 10` : '—'}
          />
          <StatCard
            label="Quorum"
            value={stats.quorum_reached ? 'Atteint ✓' : 'En cours…'}
            highlight={stats.quorum_reached ?? false}
          />
        </div>
      )}

      {/* Catégorisation stratégique */}
      {(project.barbell_category ?? project.horizon) && (
        <Section title="Catégorisation stratégique">
          <div className="grid grid-cols-2 gap-4">
            {project.barbell_category && (
              <InfoItem
                label="Barbell Strategy"
                value={BARBELL_LABELS[project.barbell_category]}
              />
            )}
            {project.moic_target && (
              <InfoItem
                label="MOIC cible"
                value={`${project.moic_target}×`}
              />
            )}
          </div>
          {theses && theses.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-1.5">Thèses macro associées</p>
              <div className="flex flex-wrap gap-2">
                {theses.map((t) => (
                  <span key={t.id} className="text-xs px-2.5 py-1 bg-blue-600/10 text-blue-300 rounded-full border border-blue-800">
                    {t.title}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Section>
      )}

      {/* Tags */}
      {project.tags && project.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span key={tag} className="text-xs px-2 py-0.5 bg-gray-800 text-gray-400 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Description */}
      {project.description && (
        <Section title="Notes">
          <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{project.description}</p>
        </Section>
      )}

      {/* Market Research */}
      {marketResearch && (
        <Section title="Analyse marché">
          {marketResearch.problem && (
            <Subsection title="Problème identifié">
              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{marketResearch.problem}</p>
            </Subsection>
          )}
          {marketResearch.solution && (
            <Subsection title="Solution proposée">
              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{marketResearch.solution}</p>
            </Subsection>
          )}
          {marketResearch.value_proposition && (
            <Subsection title="Proposition de valeur">
              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{marketResearch.value_proposition}</p>
            </Subsection>
          )}
          {marketResearch.investment_amount && (
            <InfoItem
              label="Montant d'investissement"
              value={`${marketResearch.investment_amount.toLocaleString('fr-FR')} ${marketResearch.currency ?? 'EUR'}`}
            />
          )}
        </Section>
      )}

      {/* Monte Carlo */}
      {scenarios && (
        <Section title="Scénarios Monte Carlo">
          <div className="grid grid-cols-3 gap-4">
            {(
              [
                { key: 'pessimistic', label: 'Pessimiste', color: 'border-red-900 bg-red-950/20' },
                { key: 'realistic', label: 'Réaliste', color: 'border-yellow-900 bg-yellow-950/20' },
                { key: 'optimistic', label: 'Optimiste', color: 'border-green-900 bg-green-950/20' },
              ] as const
            ).map(({ key, label, color }) => {
              const s = scenarios[key]
              if (!s) return null
              return (
                <div key={key} className={cn('rounded-lg border p-4 space-y-2', color)}>
                  <p className="text-xs font-semibold text-gray-300">{label}</p>
                  {s.probability !== undefined && (
                    <p className="text-2xl font-bold text-white">{s.probability}%</p>
                  )}
                  {s.moic !== undefined && (
                    <p className="text-sm text-gray-400">MOIC : {s.moic}×</p>
                  )}
                  {s.description && (
                    <p className="text-xs text-gray-500 leading-relaxed">{s.description}</p>
                  )}
                </div>
              )
            })}
          </div>
        </Section>
      )}

      {/* Investment Thesis */}
      {thesis && (
        <Section title="Thèse d'investissement">
          {thesis.statement && (
            <Subsection title="Conviction">
              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{thesis.statement}</p>
            </Subsection>
          )}
          {thesis.hypotheses && (
            <Subsection title="Hypothèses vérifiables">
              <ul className="space-y-2">
                {thesis.hypotheses.map((h, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-300">
                    <span className="text-gray-600 font-mono shrink-0">{i + 1}.</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </Subsection>
          )}
        </Section>
      )}

      {/* Risques & Hypothèses */}
      {marketResearch && (marketResearch.key_risks ?? marketResearch.key_hypotheses) && (
        <Section title="Risques &amp; Hypothèses clés">
          {marketResearch.key_risks && (
            <Subsection title="Risques principaux">
              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{marketResearch.key_risks}</p>
            </Subsection>
          )}
          {marketResearch.key_hypotheses && (
            <Subsection title="Hypothèses du modèle">
              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{marketResearch.key_hypotheses}</p>
            </Subsection>
          )}
        </Section>
      )}

      {/* Deadline */}
      {project.evaluation_deadline && (
        <Section title="Calendrier">
          <InfoItem
            label="Date limite d'évaluation"
            value={new Date(project.evaluation_deadline).toLocaleDateString('fr-FR', {
              weekday: 'long',
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          />
        </Section>
      )}

      {/* Soumis le */}
      <p className="text-xs text-gray-600">
        Soumis le{' '}
        {new Date(project.created_at).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        })}
      </p>
    </div>
  )
}

// ─── Composants utilitaires ───────────────────────────────────────────────────

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
      <h2 className="text-sm font-semibold text-gray-200 uppercase tracking-wide">{title}</h2>
      {children}
    </div>
  )
}

function Subsection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
      {children}
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-200 mt-0.5">{value}</p>
    </div>
  )
}

function StatCard({
  label,
  value,
  highlight = false,
}: {
  label: string
  value: string
  highlight?: boolean
}): React.JSX.Element {
  return (
    <div className={cn('bg-gray-900 border rounded-xl p-4', highlight ? 'border-green-800' : 'border-gray-800')}>
      <p className="text-xs text-gray-500">{label}</p>
      <p className={cn('text-lg font-bold mt-1', highlight ? 'text-green-400' : 'text-white')}>{value}</p>
    </div>
  )
}
