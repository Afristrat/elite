import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

type RealOptionPageProps = {
  params: Promise<{ id: string }>
}

type RealOptionData = {
  trigger?: string
  trigger_date?: string
  option_value?: number
  description?: string
}

export default async function RealOptionPage({ params }: RealOptionPageProps): Promise<React.JSX.Element> {
  const { id } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from('projects')
    .select('id, title, status')
    .eq('id', id)
    .single()

  if (!project) notFound()

  // Récupérer la décision (type deferred)
  const { data: decision } = await supabase
    .from('decisions')
    .select('id, decision, rationale, real_option_data, created_at')
    .eq('project_id', id)
    .eq('decision', 'deferred')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!decision || decision.decision !== 'deferred') {
    return (
      <div className="space-y-4">
        <Link href={`/projects/${id}`} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
          ← Retour au projet
        </Link>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
          <p className="text-gray-500 text-sm">Aucune Real Option configurée pour ce projet</p>
          <p className="text-gray-600 text-xs mt-1">
            Les Real Options sont définies lors d&apos;une décision Différé
          </p>
        </div>
      </div>
    )
  }

  const ro = decision.real_option_data as RealOptionData | null
  const triggerDate = ro?.trigger_date ? new Date(ro.trigger_date) : null
  const now = new Date()
  const daysUntilTrigger = triggerDate
    ? Math.round((triggerDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link href={`/projects/${id}`} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
          ← Retour au projet
        </Link>
        <h1 className="text-xl font-bold text-white mt-2">
          Real Option — {project.title}
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Formalisation de la valeur d&apos;attente — décision différée
        </p>
      </div>

      {/* Statut */}
      {daysUntilTrigger !== null && (
        <div className={`rounded-xl border p-4 ${
          daysUntilTrigger < 0
            ? 'bg-red-950/20 border-red-900/50'
            : daysUntilTrigger <= 30
              ? 'bg-yellow-950/20 border-yellow-900/50'
              : 'bg-gray-900 border-gray-800'
        }`}>
          <p className={`text-sm font-semibold ${
            daysUntilTrigger < 0 ? 'text-red-400' : daysUntilTrigger <= 30 ? 'text-yellow-400' : 'text-gray-300'
          }`}>
            {daysUntilTrigger < 0
              ? `Déclencheur dépassé il y a ${Math.abs(daysUntilTrigger)} jours`
              : daysUntilTrigger === 0
                ? 'Déclencheur attendu aujourd\'hui'
                : `Déclencheur dans ${daysUntilTrigger} jours`}
          </p>
          {triggerDate && (
            <p className="text-xs text-gray-500 mt-1">
              {triggerDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          )}
        </div>
      )}

      {/* Données Real Option */}
      {ro && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-5">
          <h2 className="text-sm font-semibold text-gray-200">Configuration de la Real Option</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {ro.trigger && (
              <div className="space-y-1">
                <p className="text-xs text-gray-500 font-medium">Événement déclencheur</p>
                <p className="text-sm text-gray-300 leading-relaxed">{ro.trigger}</p>
              </div>
            )}

            {ro.option_value && (
              <div className="space-y-1">
                <p className="text-xs text-gray-500 font-medium">Valeur d&apos;option estimée</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {ro.option_value.toLocaleString('fr-FR')} €
                </p>
              </div>
            )}
          </div>

          {ro.description && (
            <div className="border-t border-gray-800 pt-4 space-y-1">
              <p className="text-xs text-gray-500 font-medium">Description de l&apos;option</p>
              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{ro.description}</p>
            </div>
          )}
        </div>
      )}

      {/* Justification */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-2">
        <p className="text-xs text-gray-500 font-medium">Justification de la décision Différé</p>
        <p className="text-sm text-gray-300 leading-relaxed">{decision.rationale}</p>
        <p className="text-xs text-gray-600 mt-2">
          Différé le{' '}
          {new Date(decision.created_at).toLocaleDateString('fr-FR', {
            day: '2-digit', month: 'long', year: 'numeric',
          })}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link
          href={`/projects/${id}/results`}
          className="text-xs px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
        >
          Voir les résultats
        </Link>
      </div>
    </div>
  )
}
