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
        <Link href={`/projects/${id}`} className="text-xs text-on-surface-variant hover:text-on-surface transition-colors">
          ← Retour au projet
        </Link>
        <div className="bg-surface-container border border-border/10 rounded-xl p-8 text-center">
          <p className="text-muted-foreground text-sm">Aucune Real Option configurée pour ce projet</p>
          <p className="text-on-surface-variant/50 text-xs mt-1">
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
        <Link href={`/projects/${id}`} className="text-xs text-on-surface-variant hover:text-on-surface transition-colors">
          ← Retour au projet
        </Link>
        <h1 className="text-xl font-bold text-on-surface mt-2">
          Real Option — {project.title}
        </h1>
        <p className="text-on-surface-variant text-sm mt-1">
          Formalisation de la valeur d&apos;attente — décision différée
        </p>
      </div>

      {/* Statut */}
      {daysUntilTrigger !== null && (
        <div className={`rounded-xl border p-4 ${
          daysUntilTrigger < 0
            ? 'bg-na-error-container/10 border-na-error/30'
            : daysUntilTrigger <= 30
              ? 'bg-na-secondary-container/20 border-na-secondary/30'
              : 'bg-surface-container border-border/10'
        }`}>
          <p className={`text-sm font-semibold ${
            daysUntilTrigger < 0 ? 'text-na-error' : daysUntilTrigger <= 30 ? 'text-na-secondary' : 'text-on-surface'
          }`}>
            {daysUntilTrigger < 0
              ? `Déclencheur dépassé il y a ${Math.abs(daysUntilTrigger)} jours`
              : daysUntilTrigger === 0
                ? 'Déclencheur attendu aujourd\'hui'
                : `Déclencheur dans ${daysUntilTrigger} jours`}
          </p>
          {triggerDate && (
            <p className="text-xs text-on-surface-variant mt-1">
              {triggerDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          )}
        </div>
      )}

      {/* Données Real Option */}
      {ro && (
        <div className="bg-surface-container border border-border/10 rounded-xl p-5 space-y-5">
          <h2 className="text-sm font-semibold text-on-surface">Configuration de la Real Option</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {ro.trigger && (
              <div className="space-y-1">
                <p className="text-xs text-on-surface-variant font-medium">Événement déclencheur</p>
                <p className="text-sm text-on-surface leading-relaxed">{ro.trigger}</p>
              </div>
            )}

            {ro.option_value && (
              <div className="space-y-1">
                <p className="text-xs text-on-surface-variant font-medium">Valeur d&apos;option estimée</p>
                <p className="text-2xl font-bold text-na-secondary">
                  {ro.option_value.toLocaleString('fr-FR')} €
                </p>
              </div>
            )}
          </div>

          {ro.description && (
            <div className="border-t border-border/10 pt-4 space-y-1">
              <p className="text-xs text-on-surface-variant font-medium">Description de l&apos;option</p>
              <p className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-wrap">{ro.description}</p>
            </div>
          )}
        </div>
      )}

      {/* Justification */}
      <div className="bg-surface-container border border-border/10 rounded-xl p-5 space-y-2">
        <p className="text-xs text-on-surface-variant font-medium">Justification de la décision Différé</p>
        <p className="text-sm text-on-surface-variant leading-relaxed">{decision.rationale}</p>
        <p className="text-xs text-muted-foreground mt-2">
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
          className="text-xs px-4 py-2 bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant rounded-lg transition-colors"
        >
          Voir les résultats
        </Link>
      </div>
    </div>
  )
}
