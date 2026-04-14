import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'
import type { Database } from '@/types/database'

type ProjectHorizon = Database['public']['Enums']['project_horizon']
type BarbellCat = Database['public']['Enums']['barbell_cat']
type ThreeHorizonsPageProps = { params: Promise<{ id: string }> }

const HORIZON_CONFIG: Record<ProjectHorizon, {
  label: string
  duration: string
  description: string
  color: string
  bg: string
  border: string
  icon: string
}> = {
  H1: {
    label: 'Horizon 1 — Core',
    duration: '0–2 ans',
    description: 'Extension ou optimisation du cœur de métier actuel. Risque faible, rendement prévisible, retour sur investissement à court terme.',
    color: 'text-green-400',
    bg: 'bg-green-950/20',
    border: 'border-green-800/40',
    icon: '🏢',
  },
  H2: {
    label: 'Horizon 2 — Émergent',
    duration: '2–5 ans',
    description: 'Nouvelles opportunités à fort potentiel en cours de maturation. Risque modéré, retour moyen terme, nécessite un pilotage actif.',
    color: 'text-blue-400',
    bg: 'bg-blue-950/20',
    border: 'border-blue-800/40',
    icon: '🌱',
  },
  H3: {
    label: 'Horizon 3 — Transformationnel',
    duration: '5+ ans',
    description: 'Options sur l\'avenir — innovations de rupture ou paris asymétriques. Risque élevé, potentiel de transformation, horizon long.',
    color: 'text-purple-400',
    bg: 'bg-purple-950/20',
    border: 'border-purple-800/40',
    icon: '🚀',
  },
}

const BARBELL_CONFIG: Record<BarbellCat, {
  label: string
  description: string
  allocation: string
  color: string
  bg: string
  border: string
  icon: string
}> = {
  core: {
    label: 'Barbell — Cœur conservateur',
    description: 'Investissements stables à faible risque constituant la base du portefeuille. Préservent le capital et génèrent un rendement fiable.',
    allocation: '~80% portefeuille',
    color: 'text-green-400',
    bg: 'bg-green-950/20',
    border: 'border-green-800/40',
    icon: '🛡️',
  },
  growth: {
    label: 'Barbell — Croissance',
    description: 'Segment intermédiaire à éviter selon la stratégie barbell pure — risque modéré sans upside exceptionnel. Présence limitée recommandée.',
    allocation: '~0–10% (éviter)',
    color: 'text-yellow-400',
    bg: 'bg-yellow-950/20',
    border: 'border-yellow-800/40',
    icon: '⚠️',
  },
  moonshot: {
    label: 'Barbell — Paris asymétriques',
    description: 'Investissements spéculatifs à fort potentiel de rendement. Pertes limitées au capital investi, gains potentiellement transformationnels.',
    allocation: '~20% portefeuille',
    color: 'text-purple-400',
    bg: 'bg-purple-950/20',
    border: 'border-purple-800/40',
    icon: '🎯',
  },
}

export default async function ThreeHorizonsPage({ params }: ThreeHorizonsPageProps): Promise<React.JSX.Element> {
  const { id } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from('projects')
    .select('id, title, sector, horizon, barbell_category, moic_target, description')
    .eq('id', id)
    .single()

  if (!project) notFound()

  // Distribution du portefeuille pour le contexte
  const { data: portfolioProjects } = await supabase
    .from('projects')
    .select('horizon, barbell_category')
    .not('status', 'eq', 'draft')

  const portfolio = portfolioProjects ?? []
  const horizonCounts: Record<string, number> = { H1: 0, H2: 0, H3: 0 }
  const barbellCounts: Record<string, number> = { core: 0, growth: 0, moonshot: 0 }

  for (const p of portfolio) {
    if (p.horizon) horizonCounts[p.horizon] = (horizonCounts[p.horizon] ?? 0) + 1
    if (p.barbell_category) barbellCounts[p.barbell_category] = (barbellCounts[p.barbell_category] ?? 0) + 1
  }

  const totalPortfolio = portfolio.length
  const horizonCfg = project.horizon ? HORIZON_CONFIG[project.horizon] : null
  const barbellCfg = project.barbell_category ? BARBELL_CONFIG[project.barbell_category] : null

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link href={`/projects/${id}`} className="text-xs text-on-surface-variant hover:text-on-surface transition-colors">
          ← Retour au projet
        </Link>
        <h1 className="text-xl font-bold text-on-surface mt-2">Three Horizons × Barbell</h1>
        <p className="text-on-surface-variant text-sm mt-1">
          Positionnement stratégique de <span className="text-on-surface font-medium">{project.title}</span> dans le portefeuille
        </p>
      </div>

      {!project.horizon && !project.barbell_category ? (
        <div className="bg-surface-container border border-border/10 rounded-xl p-8 text-center">
          <p className="text-muted-foreground text-sm">Aucune catégorisation stratégique renseignée</p>
          <p className="text-on-surface-variant/50 text-xs mt-1">
            L&apos;horizon et la catégorie barbell sont définis lors de la soumission du projet.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Three Horizons */}
          {horizonCfg && (
            <div className={cn('rounded-xl border p-5 space-y-3', horizonCfg.bg, horizonCfg.border)}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{horizonCfg.icon}</span>
                <div>
                  <p className={cn('text-sm font-bold', horizonCfg.color)}>{horizonCfg.label}</p>
                  <p className="text-xs text-on-surface-variant">{horizonCfg.duration}</p>
                </div>
              </div>
              <p className="text-sm text-on-surface-variant">{horizonCfg.description}</p>

              {/* Timeline visuelle */}
              <div className="mt-3 space-y-2">
                <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wide">Positionnement temporel</p>
                <div className="flex gap-1">
                  {(['H1', 'H2', 'H3'] as ProjectHorizon[]).map((h) => (
                    <div
                      key={h}
                      className={cn(
                        'flex-1 h-2 rounded-full transition-all',
                        project.horizon === h ? horizonCfg.color.replace('text-', 'bg-') : 'bg-surface-container-high',
                      )}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-xs text-on-surface-variant/50">
                  <span>Court terme</span>
                  <span>Moyen terme</span>
                  <span>Long terme</span>
                </div>
              </div>
            </div>
          )}

          {/* Barbell */}
          {barbellCfg && (
            <div className={cn('rounded-xl border p-5 space-y-3', barbellCfg.bg, barbellCfg.border)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{barbellCfg.icon}</span>
                  <div>
                    <p className={cn('text-sm font-bold', barbellCfg.color)}>{barbellCfg.label}</p>
                    <p className="text-xs text-on-surface-variant">Allocation cible : {barbellCfg.allocation}</p>
                  </div>
                </div>
                {project.moic_target && (
                  <div className="text-right">
                    <p className="text-xs text-on-surface-variant">MOIC cible</p>
                    <p className={cn('text-xl font-bold', barbellCfg.color)}>{project.moic_target}×</p>
                  </div>
                )}
              </div>
              <p className="text-sm text-on-surface-variant">{barbellCfg.description}</p>

              {/* Barbell visuel */}
              <div className="mt-3">
                <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wide mb-2">Distribution barbell</p>
                <div className="flex items-center gap-2">
                  <div className={cn('flex-none text-center', project.barbell_category === 'core' ? '' : 'opacity-40')}>
                    <div className="w-16 h-8 bg-green-800/60 rounded flex items-center justify-center">
                      <span className="text-xs text-green-300 font-medium">Core</span>
                    </div>
                    <p className="text-xs text-on-surface-variant/50 mt-1">80%</p>
                  </div>
                  <div className="flex-1 h-1 bg-surface-container-high rounded" />
                  <div className={cn('flex-none text-center', project.barbell_category === 'growth' ? '' : 'opacity-40')}>
                    <div className="w-16 h-4 bg-yellow-800/60 rounded flex items-center justify-center">
                      <span className="text-xs text-yellow-300 font-medium">Growth</span>
                    </div>
                    <p className="text-xs text-on-surface-variant/50 mt-1">éviter</p>
                  </div>
                  <div className="flex-1 h-1 bg-surface-container-high rounded" />
                  <div className={cn('flex-none text-center', project.barbell_category === 'moonshot' ? '' : 'opacity-40')}>
                    <div className="w-16 h-8 bg-purple-800/60 rounded flex items-center justify-center">
                      <span className="text-xs text-purple-300 font-medium">Moonshot</span>
                    </div>
                    <p className="text-xs text-on-surface-variant/50 mt-1">20%</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contexte portefeuille */}
          {totalPortfolio > 1 && (
            <div className="bg-surface-container border border-border/10 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-semibold text-on-surface">Contexte portefeuille ({totalPortfolio} projets)</h2>
              <div className="grid grid-cols-2 gap-6">
                {/* Horizons */}
                <div className="space-y-2">
                  <p className="text-xs text-on-surface-variant font-medium">Distribution horizons</p>
                  {(['H1', 'H2', 'H3'] as ProjectHorizon[]).map((h) => {
                    const count = horizonCounts[h] ?? 0
                    const pct = totalPortfolio > 0 ? Math.round((count / totalPortfolio) * 100) : 0
                    const cfg = HORIZON_CONFIG[h]
                    return (
                      <div key={h} className="flex items-center gap-2">
                        <span className={cn('text-xs w-8', cfg.color)}>{h}</span>
                        <div className="flex-1 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                          <div
                            className={cfg.color.replace('text-', 'bg-')}
                            style={{ width: `${pct}%`, height: '100%' }}
                          />
                        </div>
                        <span className="text-xs text-on-surface-variant/50 w-8 text-right">{pct}%</span>
                      </div>
                    )
                  })}
                </div>
                {/* Barbell */}
                <div className="space-y-2">
                  <p className="text-xs text-on-surface-variant font-medium">Distribution barbell</p>
                  {(['core', 'growth', 'moonshot'] as BarbellCat[]).map((b) => {
                    const count = barbellCounts[b] ?? 0
                    const pct = totalPortfolio > 0 ? Math.round((count / totalPortfolio) * 100) : 0
                    const cfg = BARBELL_CONFIG[b]
                    return (
                      <div key={b} className="flex items-center gap-2">
                        <span className={cn('text-xs w-14', cfg.color)}>{b}</span>
                        <div className="flex-1 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                          <div
                            className={cfg.color.replace('text-', 'bg-')}
                            style={{ width: `${pct}%`, height: '100%' }}
                          />
                        </div>
                        <span className="text-xs text-on-surface-variant/50 w-8 text-right">{pct}%</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Frameworks reference */}
          <div className="bg-surface-container-low border border-border/10 rounded-xl p-4">
            <p className="text-xs text-on-surface-variant/50">
              <span className="text-on-surface-variant font-medium">Three Horizons</span> — McKinsey (1999) ·{' '}
              <span className="text-on-surface-variant font-medium">Barbell Strategy</span> — Nassim Nicholas Taleb (2012, Antifragile)
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
