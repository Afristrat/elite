import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

type InvestmentThesis = {
  statement?: string
  hypotheses?: [string, string, string]
  pain_point?: string
  solution?: string
  market_size?: string
  moat?: string
}

type InvestmentThesisPageProps = { params: Promise<{ id: string }> }

export default async function InvestmentThesisPage({ params }: InvestmentThesisPageProps): Promise<React.JSX.Element> {
  const { id } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from('projects')
    .select('id, title, sector, investment_thesis, thesis_ids, moic_target, description')
    .eq('id', id)
    .single()

  if (!project) notFound()

  const thesis = project.investment_thesis as InvestmentThesis | null

  // Thèses macro du portefeuille associées
  const { data: macroTheses } = project.thesis_ids?.length
    ? await supabase
        .from('portfolio_theses')
        .select('id, title, description, horizon')
        .in('id', project.thesis_ids)
    : { data: null }

  const hasContent = thesis?.statement || thesis?.pain_point || thesis?.solution || thesis?.hypotheses?.some(Boolean)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link href={`/projects/${id}`} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
          ← Retour au projet
        </Link>
        <h1 className="text-xl font-bold text-white mt-2">Thèse d&apos;investissement</h1>
        <p className="text-gray-400 text-sm mt-1">
          Analyse fondamentale de <span className="text-white font-medium">{project.title}</span>
        </p>
      </div>

      {!hasContent ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
          <p className="text-gray-500 text-sm">Aucune thèse d&apos;investissement renseignée</p>
          <p className="text-gray-600 text-xs mt-1">
            La thèse est définie lors de la soumission du projet (statement + hypothèses).
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Statement principal */}
          {thesis?.statement && (
            <div className="bg-blue-950/20 border border-blue-800/40 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">💡</span>
                <h2 className="text-sm font-semibold text-blue-300">Thèse principale</h2>
              </div>
              <p className="text-white text-sm leading-relaxed">{thesis.statement}</p>
              {project.moic_target && (
                <div className="mt-3 pt-3 border-t border-blue-800/30 flex items-center gap-2">
                  <span className="text-xs text-gray-500">Rendement cible :</span>
                  <span className="text-blue-400 font-bold">{project.moic_target}× MOIC</span>
                </div>
              )}
            </div>
          )}

          {/* Problème + Solution */}
          {(thesis?.pain_point ?? thesis?.solution) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {thesis?.pain_point && (
                <div className="bg-red-950/15 border border-red-900/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-base">🔥</span>
                    <h3 className="text-xs font-semibold text-red-400 uppercase tracking-wide">Problème</h3>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">{thesis.pain_point}</p>
                </div>
              )}
              {thesis?.solution && (
                <div className="bg-green-950/15 border border-green-900/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-base">✅</span>
                    <h3 className="text-xs font-semibold text-green-400 uppercase tracking-wide">Solution</h3>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">{thesis.solution}</p>
                </div>
              )}
            </div>
          )}

          {/* Market size + Moat */}
          {(thesis?.market_size ?? thesis?.moat) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {thesis?.market_size && (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-base">📊</span>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Taille de marché</h3>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">{thesis.market_size}</p>
                </div>
              )}
              {thesis?.moat && (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-base">🏰</span>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Avantage concurrentiel</h3>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">{thesis.moat}</p>
                </div>
              )}
            </div>
          )}

          {/* Hypothèses clés */}
          {thesis?.hypotheses?.some(Boolean) && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">🎯</span>
                <h2 className="text-sm font-semibold text-gray-200">Hypothèses clés à valider</h2>
              </div>
              <div className="space-y-3">
                {thesis.hypotheses.map((h, i) =>
                  h ? (
                    <div key={i} className="flex gap-3">
                      <span className="flex-none w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-400">
                        {i + 1}
                      </span>
                      <p className="text-gray-300 text-sm leading-relaxed pt-0.5">{h}</p>
                    </div>
                  ) : null,
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Thèses macro associées */}
      {macroTheses?.length ? (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-400">Thèses macro du portefeuille</h2>
          <div className="space-y-2">
            {macroTheses.map((mt) => (
              <div key={mt.id} className="bg-gray-900/60 border border-gray-800/60 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-white">{mt.title}</p>
                  {mt.horizon && (
                    <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">{mt.horizon}</span>
                  )}
                </div>
                {mt.description && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{mt.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
