import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { OutcomeForm } from './outcome-form'
import type { OutcomeEntry } from '@/actions/outcomes'

type OutcomesPageProps = { params: Promise<{ id: string }> }

export default async function OutcomesPage({ params }: OutcomesPageProps): Promise<React.JSX.Element> {
  const { id } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from('projects')
    .select('id, title, status, outcomes, decided_at')
    .eq('id', id)
    .single()

  if (!project) notFound()

  const canHarvest = ['decided', 'archived'].includes(project.status)
  const outcomes = (project.outcomes as OutcomeEntry[] | null) ?? []

  const decidedAt = project.decided_at ? new Date(project.decided_at) : null
  const now = new Date()
  const daysSinceDecision = decidedAt
    ? Math.floor((now.getTime() - decidedAt.getTime()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link href={`/projects/${id}`} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
          ← Retour au projet
        </Link>
        <h1 className="text-xl font-bold text-white mt-2">Outcome Harvesting</h1>
        <p className="text-gray-400 text-sm mt-1">
          Collecte d&apos;impact de <span className="text-white font-medium">{project.title}</span>
          {daysSinceDecision !== null && (
            <span className="text-gray-500"> · J+{daysSinceDecision}</span>
          )}
        </p>
      </div>

      {!canHarvest ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
          <p className="text-gray-500 text-sm">Outcome Harvesting disponible après la décision</p>
          <p className="text-gray-600 text-xs mt-1">
            La collecte d&apos;impact commence après la décision du comité (recommandé : J+90 et J+180).
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Description */}
          <div className="bg-green-950/15 border border-green-900/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-xl mt-0.5">🌱</span>
              <div>
                <p className="text-sm font-semibold text-green-300">Méthode Outcome Harvesting (Better Evaluation, 2012)</p>
                <p className="text-sm text-gray-400 mt-1">
                  Documenter les changements réels produits par l&apos;intervention, indépendamment des objectifs initiaux.
                  4 questions structurées : qui a changé, quoi, pourquoi c&apos;est significatif, et ce qui y a contribué.
                </p>
              </div>
            </div>
          </div>

          {/* Calendrier recommandé */}
          {daysSinceDecision !== null && (
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Revue J+90', days: 90, description: 'Premiers signes de changement' },
                { label: 'Revue J+180', days: 180, description: 'Impact consolidé' },
              ].map(({ label, days, description }) => {
                const isDue = daysSinceDecision >= days
                const remaining = days - daysSinceDecision
                return (
                  <div key={days} className={`rounded-xl border p-4 ${isDue ? 'border-green-800/40 bg-green-950/15' : 'border-gray-800 bg-gray-900'}`}>
                    <p className={`text-sm font-semibold ${isDue ? 'text-green-400' : 'text-gray-400'}`}>{label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{description}</p>
                    <p className={`text-xs mt-2 font-medium ${isDue ? 'text-green-400' : 'text-gray-600'}`}>
                      {isDue ? '→ À renseigner maintenant' : `Dans ${remaining} jours`}
                    </p>
                  </div>
                )
              })}
            </div>
          )}

          {/* Outcomes existants */}
          {outcomes.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-300">{outcomes.length} outcome{outcomes.length > 1 ? 's' : ''} documenté{outcomes.length > 1 ? 's' : ''}</h2>
              {outcomes.map((o) => (
                <div key={o.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-2">
                  <p className="text-xs text-gray-500">{new Date(o.captured_at).toLocaleDateString('fr-FR')}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500 font-medium">👤 Qui a changé</p>
                      <p className="text-sm text-gray-300 mt-0.5">{o.who_changed}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">🔄 Ce qui a changé</p>
                      <p className="text-sm text-gray-300 mt-0.5">{o.what_changed}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">💡 Pourquoi significatif</p>
                      <p className="text-sm text-gray-300 mt-0.5">{o.why_significant}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">🎯 Contributeurs</p>
                      <p className="text-sm text-gray-300 mt-0.5">{o.contributed_by}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Formulaire */}
          <OutcomeForm projectId={id} />

          <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-4">
            <p className="text-xs text-gray-600">
              <span className="text-gray-500 font-medium">Outcome Harvesting</span> — Better Evaluation / International Development (2012).
              Contrairement à l&apos;évaluation traditionnelle, l&apos;OH collecte les changements réels plutôt que de mesurer l&apos;atteinte des objectifs initiaux.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
