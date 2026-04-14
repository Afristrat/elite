import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// Attractivité sectorielle (Y) — basé sur moic_target
// < 3×  → Faible | 3–5× → Moyenne | > 5× → Élevée
function attractiveness(moic: number | null): 0 | 1 | 2 {
  if (moic === null) return 0
  if (moic >= 5) return 2
  if (moic >= 3) return 1
  return 0
}

// Force compétitive (X) — basé sur score comité (0–10)
// < 5 → Faible | 5–7 → Moyenne | > 7 → Élevée
function strength(score: number | null): 0 | 1 | 2 {
  if (score === null) return 0
  if (score >= 7) return 2
  if (score >= 5) return 1
  return 0
}

// Quadrant GE-McKinsey → couleur + label
const QUADRANT_META: Record<string, { color: string; label: string; recommendation: string }> = {
  '2-2': { color: 'bg-green-900/40 border-green-700', label: 'Investir / Croître', recommendation: 'Priorité absolue — allouer les ressources' },
  '2-1': { color: 'bg-green-900/20 border-green-800', label: 'Croissance sélective', recommendation: 'Investir si renforcement compétitif possible' },
  '2-0': { color: 'bg-yellow-900/20 border-yellow-800', label: 'Dilemme', recommendation: 'Renforcer ou abandonner — décision stratégique' },
  '1-2': { color: 'bg-green-900/20 border-green-800', label: 'Protéger / Croître', recommendation: 'Maintenir la position, générer du cash' },
  '1-1': { color: 'bg-yellow-900/20 border-yellow-800', label: 'Sélectivité / Bénéfices', recommendation: 'Investir prudemment dans les segments porteurs' },
  '1-0': { color: 'bg-orange-900/20 border-orange-800', label: 'Expansion limitée', recommendation: 'Chercher des niches ou réduire l\'exposition' },
  '0-2': { color: 'bg-yellow-900/20 border-yellow-800', label: 'Cash Cow', recommendation: 'Maximiser les flux — réinvestir ailleurs' },
  '0-1': { color: 'bg-red-900/20 border-red-800', label: 'Récolte', recommendation: 'Extraire la valeur résiduelle, désinvestir progressivement' },
  '0-0': { color: 'bg-red-900/40 border-red-700', label: 'Désinvestir', recommendation: 'Sortir — capital redéployé ailleurs' },
}

export default async function GEMcKinseyPage(): Promise<React.JSX.Element> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user!.id).single()
  if (profile?.role !== 'admin') notFound()

  // Projets avec décision ou quorum atteint
  const { data: projects } = await supabase
    .from('projects')
    .select('id, title, sector, moic_target, horizon, barbell_category, status')
    .in('status', ['closed', 'decided', 'archived'])
    .order('created_at', { ascending: false })

  const projectList = projects ?? []

  // Scores d'évaluation pour chaque projet
  const projectIds = projectList.map((p) => p.id)
  const { data: stats } = projectIds.length > 0
    ? await supabase
        .from('project_evaluation_stats')
        .select('project_id, avg_score, quorum_reached')
        .in('project_id', projectIds)
    : { data: null }

  const statsMap = Object.fromEntries((stats ?? []).map((s) => [s.project_id, s]))

  // Décisions pour afficher le badge
  const { data: decisions } = projectIds.length > 0
    ? await supabase
        .from('decisions')
        .select('project_id, decision')
        .in('project_id', projectIds)
    : { data: null }

  const decisionsMap = Object.fromEntries((decisions ?? []).map((d) => [d.project_id, d.decision]))

  // Construire les données de la matrice
  type ProjectPoint = {
    id: string
    title: string
    sector: string | null
    moic_target: number | null
    avg_score: number | null
    decision: string | null
    attrIdx: 0 | 1 | 2
    strIdx: 0 | 1 | 2
  }

  const points: ProjectPoint[] = projectList.map((p) => {
    const s = statsMap[p.id]
    const avg = s?.avg_score != null ? Number(s.avg_score) : null
    return {
      id: p.id,
      title: p.title,
      sector: p.sector,
      moic_target: p.moic_target,
      avg_score: avg,
      decision: decisionsMap[p.id] ?? null,
      attrIdx: attractiveness(p.moic_target),
      strIdx: strength(avg),
    }
  })

  const ATTR_LABELS = ['Faible', 'Moyenne', 'Élevée']
  const STR_LABELS = ['Faible', 'Moyenne', 'Élevée']

  const DECISION_COLORS: Record<string, string> = {
    approved: 'text-green-400',
    rejected: 'text-red-400',
    deferred: 'text-yellow-400',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Matrice GE-McKinsey 9-Box</h1>
          <p className="text-on-surface-variant text-sm mt-1">
            Attractivité sectorielle (MOIC cible) × Force compétitive (score comité)
          </p>
        </div>
        <Link href="/analytics" className="text-xs text-primary hover:text-primary/80 transition-colors">
          ← Analytics
        </Link>
      </div>

      {projectList.length === 0 ? (
        <div className="bg-surface-container border border-border/10 rounded-xl p-8 text-center">
          <p className="text-muted-foreground text-sm">Aucun projet avec quorum disponible</p>
          <p className="text-on-surface-variant/50 text-xs mt-1">Les projets apparaissent après avoir atteint le quorum</p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Légende axes */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface-container border border-border/10 rounded-xl p-3 space-y-1">
              <p className="text-xs font-semibold text-on-surface">Axe Y — Attractivité sectorielle</p>
              <div className="flex gap-3 text-xs">
                <span className="text-destructive">Faible : &lt; 3×</span>
                <span className="text-yellow-400">Moyenne : 3–5×</span>
                <span className="text-na-tertiary-dim">Élevée : &gt; 5×</span>
              </div>
              <p className="text-xs text-on-surface-variant/50">Basé sur le MOIC cible du projet</p>
            </div>
            <div className="bg-surface-container border border-border/10 rounded-xl p-3 space-y-1">
              <p className="text-xs font-semibold text-on-surface">Axe X — Force compétitive</p>
              <div className="flex gap-3 text-xs">
                <span className="text-destructive">Faible : &lt; 5/10</span>
                <span className="text-yellow-400">Moyenne : 5–7</span>
                <span className="text-na-tertiary-dim">Élevée : &gt; 7</span>
              </div>
              <p className="text-xs text-on-surface-variant/50">Basé sur le score comité moyen</p>
            </div>
          </div>

          {/* Matrice 9-Box */}
          <div className="bg-surface-container border border-border/10 rounded-xl p-5">
            <div className="flex gap-2">
              {/* Étiquette Y */}
              <div className="flex flex-col justify-center pr-2">
                <div className="flex flex-col gap-0 h-full" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                  <p className="text-xs text-on-surface-variant text-center">
                    Attractivité sectorielle (↑)
                  </p>
                </div>
              </div>

              <div className="flex-1 space-y-1">
                {/* Grille 3×3 — attrIdx de haut (2) à bas (0) */}
                {([2, 1, 0] as const).map((attrIdx) => (
                  <div key={attrIdx} className="flex items-stretch gap-1">
                    {/* Étiquette ligne */}
                    <div className="w-16 flex items-center justify-end pr-2">
                      <span className={cn(
                        'text-xs font-medium',
                        attrIdx === 2 ? 'text-na-tertiary-dim' : attrIdx === 1 ? 'text-yellow-400' : 'text-destructive'
                      )}>
                        {ATTR_LABELS[attrIdx]}
                      </span>
                    </div>

                    {/* 3 cellules */}
                    {([0, 1, 2] as const).map((strIdx) => {
                      const key = `${attrIdx}-${strIdx}`
                      const meta = QUADRANT_META[key]
                      const cellProjects = points.filter((p) => p.attrIdx === attrIdx && p.strIdx === strIdx)

                      return (
                        <div
                          key={strIdx}
                          className={cn(
                            'flex-1 min-h-[120px] rounded-lg border p-2 space-y-1',
                            meta.color,
                          )}
                        >
                          <p className="text-xs font-semibold text-on-surface leading-tight">{meta.label}</p>
                          <div className="space-y-1 mt-1">
                            {cellProjects.length === 0 ? (
                              <p className="text-xs text-on-surface-variant/30 italic">—</p>
                            ) : (
                              cellProjects.map((p) => (
                                <Link
                                  key={p.id}
                                  href={`/projects/${p.id}`}
                                  className="block group"
                                >
                                  <div className="bg-surface/60 rounded px-2 py-1 hover:bg-surface-container-high/80 transition-colors">
                                    <p className="text-xs text-on-surface font-medium leading-tight truncate group-hover:text-primary">
                                      {p.title}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      {p.avg_score !== null && (
                                        <span className="text-xs text-on-surface-variant">{p.avg_score.toFixed(1)}/10</span>
                                      )}
                                      {p.moic_target !== null && (
                                        <span className="text-xs text-primary">{p.moic_target}×</span>
                                      )}
                                      {p.decision && (
                                        <span className={cn('text-xs font-semibold', DECISION_COLORS[p.decision] ?? 'text-on-surface-variant')}>
                                          {p.decision === 'approved' ? '✓' : p.decision === 'rejected' ? '✗' : '⏸'}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </Link>
                              ))
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ))}

                {/* Étiquettes colonnes */}
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-16" />
                  {([0, 1, 2] as const).map((strIdx) => (
                    <div key={strIdx} className="flex-1 text-center">
                      <span className={cn(
                        'text-xs font-medium',
                        strIdx === 2 ? 'text-na-tertiary-dim' : strIdx === 1 ? 'text-yellow-400' : 'text-destructive'
                      )}>
                        {STR_LABELS[strIdx]}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-center text-xs text-on-surface-variant mt-0.5">Force compétitive (→)</p>
              </div>
            </div>
          </div>

          {/* Recommandations par quadrant */}
          <div className="bg-surface-container border border-border/10 rounded-xl p-5 space-y-3">
            <h2 className="text-sm font-semibold text-on-surface">Recommandations stratégiques par quadrant</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {Object.entries(QUADRANT_META).map(([key, meta]) => {
                const [attrStr, strStr] = key.split('-')
                const count = points.filter((p) => p.attrIdx === Number(attrStr) && p.strIdx === Number(strStr)).length
                return (
                  <div key={key} className={cn('rounded-lg border p-3', meta.color)}>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-on-surface">{meta.label}</p>
                      {count > 0 && (
                        <span className="text-xs bg-surface-container text-on-surface-variant px-1.5 py-0.5 rounded-full">{count}</span>
                      )}
                    </div>
                    <p className="text-xs text-on-surface-variant mt-1">{meta.recommendation}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Liste projets non positionnés (sans score ou sans MOIC) */}
          {points.filter((p) => p.avg_score === null || p.moic_target === null).length > 0 && (
            <div className="bg-surface-container border border-border/10 rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-on-surface-variant">Projets sans données suffisantes</p>
              <p className="text-xs text-on-surface-variant/50">Ces projets manquent de score comité ou de MOIC cible et sont positionnés par défaut.</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {points
                  .filter((p) => p.avg_score === null || p.moic_target === null)
                  .map((p) => (
                    <Link
                      key={p.id}
                      href={`/projects/${p.id}`}
                      className="text-xs text-on-surface-variant hover:text-on-surface border border-border/10 rounded px-2 py-1 transition-colors"
                    >
                      {p.title}
                    </Link>
                  ))}
              </div>
            </div>
          )}

          <p className="text-xs text-on-surface-variant/50">
            <span className="text-on-surface-variant font-medium">Attractivité</span> — potentiel de rendement (MOIC cible).{' '}
            <span className="text-on-surface-variant font-medium">Force compétitive</span> — qualité perçue du deal (score comité moyen).{' '}
            Adapté du modèle GE-McKinsey pour le comité d&apos;investissement Projets Elite.
          </p>
        </div>
      )}
    </div>
  )
}
