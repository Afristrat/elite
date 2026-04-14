import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'
import { TourWidget } from '@/components/tour/tour-widget'
import type { Database } from '@/types/database'
import type { TourStep } from '@/components/tour/tour-segment'

type BarbellCat = Database['public']['Enums']['barbell_cat']

type ProjectDetailPageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tour?: string; open?: string; decided?: string }>
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

export default async function ProjectDetailPage({ params, searchParams }: ProjectDetailPageProps): Promise<React.JSX.Element> {
  const { id } = await params
  const sp = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user!.id)
    .single()

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  // Le layout gère notFound() — ici on retourne vide par sécurité
  if (!project) return <></>

  const marketResearch = project.market_research as MarketResearch | null
  const scenarios = project.scenarios as Scenarios | null
  const thesis = project.investment_thesis as InvestmentThesis | null

  const { data: stats } = await supabase
    .from('project_evaluation_stats')
    .select('*')
    .eq('project_id', id)
    .single()

  const { data: theses } = project.thesis_ids?.length
    ? await supabase
        .from('portfolio_theses')
        .select('id, title')
        .in('id', project.thesis_ids)
    : { data: null }

  // ── Tour guidé — segments 3 et 5 ─────────────────────────────────────────
  const tourNum = sp.tour
  const tourOpen = sp.open ?? ''
  const tourDecided = sp.decided ?? ''
  const tourParams = `open=${tourOpen}&decided=${tourDecided}`
  const isAdmin = profile?.role === 'admin'

  const tour3Steps: TourStep[] = [
    {
      element: '[data-tour="project-header"]',
      popover: {
        title: '📋 Le dossier complet',
        description:
          'Chaque projet expose son problème de marché, la solution proposée, la thèse d\'investissement et les scénarios financiers (pessimiste / réaliste / optimiste). Vous avez l\'intégralité du contexte avant de voter. Aucune décision à l\'aveugle.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="evaluate-btn"]',
      popover: {
        title: '🗳 Le vote aveugle',
        description:
          'Ce bouton mène au formulaire d\'évaluation. Vote aveugle : vous ne verrez pas les scores des autres membres avant que le quorum soit atteint. C\'est la règle fondamentale qui élimine le biais de conformité — votre avis est indépendant.',
        side: 'bottom',
        align: 'end',
      },
    },
  ]

  const tour5Steps: TourStep[] = [
    {
      element: '[data-tour="project-header"]',
      popover: {
        title: '✅ Décision prise — immuable',
        description:
          'Ce projet a atteint le quorum, les évaluations ont été agrégées, et l\'admin a enregistré la décision avec une justification formelle. La décision est maintenant immuable — ni modifiable ni supprimable. C\'est votre audit trail d\'investissement.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="stats-section"]',
      popover: {
        title: '📊 Scores agrégés anonymes',
        description:
          'Une fois le quorum atteint, les scores sont agrégés. L\'admin voit les scores individuels ; les autres membres voient uniquement les agrégats. Ce n\'est pas une configuration — c\'est une règle RLS au niveau de la base de données.',
        side: 'bottom',
        align: 'start',
      },
    },
  ]

  const tourWidget =
    tourNum === '3' && isAdmin ? (
      <TourWidget
        steps={tour3Steps}
        nextUrl={`/projects/${id}/evaluate?tour=4&${tourParams}`}
        currentSegment={3}
        totalSegments={8}
      />
    ) : tourNum === '3' ? (
      <TourWidget
        steps={tour3Steps}
        nextUrl={
          tourDecided
            ? `/projects/${tourDecided}?tour=5&${tourParams}`
            : `/decisions?tour=6&${tourParams}`
        }
        currentSegment={3}
        totalSegments={8}
      />
    ) : tourNum === '5' ? (
      <TourWidget
        steps={tour5Steps}
        nextUrl={`/decisions?tour=6&${tourParams}`}
        currentSegment={5}
        totalSegments={8}
      />
    ) : null

  return (
    <>
      {/* Tour guidé */}
      {tourWidget}

      {/* Statistiques d'évaluation */}
      {stats && project.status !== 'draft' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4" data-tour="stats-section">
          <StatCard
            label="Évaluations"
            value={`${stats.evaluation_count ?? 0}`}
            suffix={`/ ${stats.quorum_required ?? '?'}`}
          />
          <StatCard
            label="Score moyen"
            value={stats.avg_score !== null ? `${Number(stats.avg_score).toFixed(1)}` : '—'}
            suffix="/10"
            highlight
          />
          <StatCard
            label="Quorum"
            value={stats.quorum_reached ? 'Atteint' : 'En cours…'}
            quorum={stats.quorum_reached ?? false}
            quorumProgress={stats.quorum_reached ? undefined : (stats.evaluation_count ?? 0) / (stats.quorum_required ?? 1)}
          />
        </div>
      )}

      {/* Contenu principal — disposition asymétrique */}
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Colonne gauche — contenu principal */}
        <div className="lg:w-2/3 space-y-12">
          {/* Analyse marché */}
          {marketResearch && (
            <section>
              <SectionTitle>Analyse du marché</SectionTitle>
              <div className="space-y-6">
                {marketResearch.problem && (
                  <div className="bg-surface-container-low p-8 rounded-xl">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-na-primary mb-4">Problème</h3>
                    <p className="text-on-surface-variant leading-relaxed whitespace-pre-wrap">{marketResearch.problem}</p>
                  </div>
                )}
                {marketResearch.solution && (
                  <div className="bg-surface-container-low p-8 rounded-xl">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-na-primary mb-4">Solution</h3>
                    <p className="text-on-surface-variant leading-relaxed whitespace-pre-wrap">{marketResearch.solution}</p>
                  </div>
                )}
                {marketResearch.value_proposition && (
                  <div className="bg-surface-container-low p-8 rounded-xl">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-na-primary mb-4">Proposition de valeur</h3>
                    <p className="text-on-surface-variant leading-relaxed whitespace-pre-wrap">{marketResearch.value_proposition}</p>
                  </div>
                )}
                {marketResearch.investment_amount && (
                  <div className="flex items-center justify-between p-8 bg-surface-container-highest/30 rounded-xl">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface">Montant recherché</h3>
                    <span className="text-2xl font-bold text-on-surface">
                      {marketResearch.investment_amount.toLocaleString('fr-FR')} {marketResearch.currency ?? 'EUR'}
                    </span>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Monte Carlo */}
          {scenarios && (
            <section>
              <SectionTitle>Scénarios Monte Carlo</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-na-error-container/10 border border-na-error/20 p-6 rounded-xl flex flex-col items-center text-center">
                  <div className="text-[10px] font-black uppercase tracking-widest text-na-error mb-4">Pessimiste</div>
                  {scenarios.pessimistic?.moic !== undefined && (
                    <div className="text-3xl font-bold text-na-error mb-1">{scenarios.pessimistic.moic}×</div>
                  )}
                  {scenarios.pessimistic?.probability !== undefined && (
                    <div className="text-xs text-on-surface-variant">Probabilité : {scenarios.pessimistic.probability}%</div>
                  )}
                  {scenarios.pessimistic?.description && (
                    <p className="text-xs text-on-surface-variant/60 mt-2 leading-relaxed">{scenarios.pessimistic.description}</p>
                  )}
                </div>
                <div className="bg-na-secondary-container/20 border border-na-secondary/20 p-6 rounded-xl flex flex-col items-center text-center scale-105 shadow-xl shadow-black/20">
                  <div className="text-[10px] font-black uppercase tracking-widest text-na-secondary mb-4">Réaliste</div>
                  {scenarios.realistic?.moic !== undefined && (
                    <div className="text-3xl font-bold text-na-secondary mb-1">{scenarios.realistic.moic}×</div>
                  )}
                  {scenarios.realistic?.probability !== undefined && (
                    <div className="text-xs text-on-surface-variant">Probabilité : {scenarios.realistic.probability}%</div>
                  )}
                  {scenarios.realistic?.description && (
                    <p className="text-xs text-on-surface-variant/60 mt-2 leading-relaxed">{scenarios.realistic.description}</p>
                  )}
                </div>
                <div className="bg-na-tertiary-container/10 border border-na-tertiary-dim/20 p-6 rounded-xl flex flex-col items-center text-center">
                  <div className="text-[10px] font-black uppercase tracking-widest text-na-tertiary-dim mb-4">Optimiste</div>
                  {scenarios.optimistic?.moic !== undefined && (
                    <div className="text-3xl font-bold text-na-tertiary-dim mb-1">{scenarios.optimistic.moic}×</div>
                  )}
                  {scenarios.optimistic?.probability !== undefined && (
                    <div className="text-xs text-on-surface-variant">Probabilité : {scenarios.optimistic.probability}%</div>
                  )}
                  {scenarios.optimistic?.description && (
                    <p className="text-xs text-on-surface-variant/60 mt-2 leading-relaxed">{scenarios.optimistic.description}</p>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Notes libres */}
          {project.description && (
            <section>
              <SectionTitle>Notes</SectionTitle>
              <div className="bg-surface-container-low p-8 rounded-xl">
                <p className="text-on-surface-variant leading-relaxed whitespace-pre-wrap">{project.description}</p>
              </div>
            </section>
          )}

          {/* Calendrier */}
          {project.evaluation_deadline && (
            <section>
              <SectionTitle>Calendrier</SectionTitle>
              <div className="bg-surface-container-low p-8 rounded-xl flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">Date limite d&apos;évaluation</h3>
                <span className="text-on-surface font-medium">
                  {new Date(project.evaluation_deadline).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </section>
          )}
        </div>

        {/* Colonne droite — sidebar */}
        <div className="lg:w-1/3 space-y-8">
          {/* Thèse d'investissement */}
          {thesis && (
            <div className="bg-surface-container p-8 rounded-xl border border-border/10">
              <h2 className="text-sm font-bold text-on-surface uppercase tracking-widest mb-6">
                Thèse d&apos;investissement
              </h2>
              {thesis.statement && (
                <div className="mb-8">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-2">
                    Conviction
                  </label>
                  <p className="text-sm text-on-surface leading-relaxed font-medium italic">
                    &ldquo;{thesis.statement}&rdquo;
                  </p>
                </div>
              )}
              {thesis.hypotheses && (
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block">
                    Hypothèses clés
                  </label>
                  {thesis.hypotheses.map((h, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-na-primary text-xs mt-1 font-mono">
                        0{i + 1}.
                      </span>
                      <p className="text-xs text-on-surface-variant">{h}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Catégorisation stratégique */}
          {(project.barbell_category ?? project.horizon) && (
            <div className="bg-surface-container p-8 rounded-xl border border-border/10">
              <h2 className="text-sm font-bold text-on-surface uppercase tracking-widest mb-6">
                Catégorisation stratégique
              </h2>
              <div className="space-y-4">
                {project.barbell_category && (
                  <div>
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                      Barbell Strategy
                    </p>
                    <p className="text-sm text-on-surface font-medium">
                      {BARBELL_LABELS[project.barbell_category]}
                    </p>
                  </div>
                )}
                {project.moic_target && (
                  <div>
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                      MOIC cible
                    </p>
                    <p className="text-sm text-on-surface font-medium">{project.moic_target}×</p>
                  </div>
                )}
              </div>
              {theses && theses.length > 0 && (
                <div className="mt-6">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3">
                    Thèses macro associées
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {theses.map((t) => (
                      <span
                        key={t.id}
                        className="text-xs px-2.5 py-1 bg-primary-container/10 text-na-primary rounded-full border border-na-primary/20"
                      >
                        {t.title}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Risques & Hypothèses */}
          {marketResearch && (marketResearch.key_risks ?? marketResearch.key_hypotheses) && (
            <div>
              <h2 className="text-sm font-bold text-on-surface uppercase tracking-widest mb-6">
                Risques &amp; Mitigation
              </h2>
              <div className="space-y-6">
                {marketResearch.key_risks && (
                  <div>
                    <h4 className="text-xs font-bold text-na-error mb-2">Risques principaux</h4>
                    <p className="text-[11px] text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                      {marketResearch.key_risks}
                    </p>
                  </div>
                )}
                {marketResearch.key_hypotheses && (
                  <div>
                    <h4 className="text-xs font-bold text-na-primary mb-2">Hypothèses du modèle</h4>
                    <p className="text-[11px] text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                      {marketResearch.key_hypotheses}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2.5 py-1 bg-surface-container-highest text-on-surface-variant rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pied de page */}
      <p className="text-xs text-on-surface-variant/30 pt-4 border-t border-border/10">
        Soumis le{' '}
        {new Date(project.created_at).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        })}
      </p>
    </>
  )
}

// ─── Composants utilitaires ───────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <h2 className="text-xl font-bold text-on-surface mb-8 flex items-center gap-3">
      <span className="w-1 h-6 bg-na-primary rounded-full" />
      {children}
    </h2>
  )
}

function StatCard({
  label,
  value,
  suffix,
  highlight = false,
  quorum,
  quorumProgress,
}: {
  label: string
  value: string
  suffix?: string
  highlight?: boolean
  quorum?: boolean
  quorumProgress?: number
}): React.JSX.Element {
  return (
    <div className={cn(
      'bg-surface-container p-8 rounded-xl border relative overflow-hidden',
      highlight ? 'border-na-primary/20' : quorum !== undefined ? 'border-na-tertiary-dim/20' : 'border-border/10',
    )}>
      {/* Halo subtil sur le highlight */}
      {highlight && (
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
      )}
      <div className="text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
        {label}
      </div>
      <div className={cn('flex items-baseline gap-2', highlight && 'text-na-primary')}>
        <span className={cn(
          'text-4xl font-bold',
          highlight ? 'text-na-primary' : quorum === true ? 'text-na-tertiary-dim' : quorum === false ? 'text-na-secondary italic text-2xl font-semibold' : 'text-on-surface',
        )}>
          {value}
        </span>
        {suffix && (
          <span className="text-on-surface-variant font-medium">{suffix}</span>
        )}
      </div>
      {/* Barre de progression quorum */}
      {quorum === false && quorumProgress !== undefined && (
        <div className="absolute bottom-0 left-0 h-1 bg-na-secondary-container rounded-b-xl transition-all"
          style={{ width: `${Math.min(quorumProgress * 100, 100)}%` }}
        />
      )}
    </div>
  )
}
