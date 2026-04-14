import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PreMortemForm } from './pre-mortem-form'
import type { PreMortemResponse } from '@/actions/premortems'

type PreMortemPageProps = { params: Promise<{ id: string }> }

type AggregationType = {
  total_responses: number
  failure_scenarios: string[]
  major_risks: string[]
  aggregated_at: string
}

export default async function PreMortemPage({ params }: PreMortemPageProps): Promise<React.JSX.Element> {
  const { id } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from('projects')
    .select('id, title, status')
    .eq('id', id)
    .single()

  if (!project) notFound()

  // Si le projet n'est pas en pre-mortem (ni fermé/décidé), rediriger
  if (!['pre-mortem', 'closed', 'decided', 'archived'].includes(project.status)) {
    redirect(`/projects/${id}`)
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user!.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  // Données Pre-Mortem
  const { data: preMortem } = await supabase
    .from('project_premortems')
    .select('id, responses, aggregation, closed_at')
    .eq('project_id', id)
    .single()

  const responses = (preMortem?.responses as PreMortemResponse[] ?? [])
  const aggregation = preMortem?.aggregation as AggregationType | null
  const isClosed = !!preMortem?.closed_at || project.status !== 'pre-mortem'
  const hasAlreadySubmitted = responses.some((r) => r.user_id === user!.id)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link href={`/projects/${id}`} className="text-xs text-on-surface-variant hover:text-on-surface transition-colors">
          ← Retour au projet
        </Link>
        <h1 className="text-xl font-bold text-on-surface mt-2">Pre-Mortem collectif</h1>
        <p className="text-on-surface-variant text-sm mt-1">
          Exercice de prospective pour <span className="text-on-surface font-medium">{project.title}</span>
        </p>
      </div>

      {/* Explication */}
      <div className="bg-na-error-container/10 border border-na-error/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl mt-0.5">🪦</span>
          <div>
            <p className="text-sm font-semibold text-na-error">Méthode Pre-Mortem (Gary Klein, 1989)</p>
            <p className="text-sm text-on-surface-variant mt-1">
              Imaginez que nous sommes dans 18 mois et que ce projet a échoué.
              Raisonnez à rebours : décrivez comment l&apos;échec s&apos;est produit et quels risques ont été sous-estimés.
              Chaque contribution est anonyme et agrégée.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      {(responses.length > 0 || isClosed) && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-surface-container border border-border/10 rounded-xl p-4">
            <p className="text-xs text-on-surface-variant">Contributions</p>
            <p className="text-xl font-bold text-on-surface mt-1">{responses.length}</p>
          </div>
          <div className="bg-surface-container border border-border/10 rounded-xl p-4">
            <p className="text-xs text-on-surface-variant">Statut</p>
            <p className={`text-sm font-bold mt-1 ${isClosed ? 'text-na-tertiary-dim' : 'text-na-secondary'}`}>
              {isClosed ? 'Clôturé' : 'En cours'}
            </p>
          </div>
          <div className="bg-surface-container border border-border/10 rounded-xl p-4">
            <p className="text-xs text-on-surface-variant">Scénarios récoltés</p>
            <p className="text-xl font-bold text-on-surface mt-1">
              {responses.filter((r) => r.failure_scenario).length}
            </p>
          </div>
        </div>
      )}

      {/* Formulaire (si phase pre-mortem active) */}
      {project.status === 'pre-mortem' && (
        <PreMortemForm
          projectId={id}
          hasAlreadySubmitted={hasAlreadySubmitted}
          isAdmin={isAdmin}
          isClosed={isClosed}
          totalResponses={responses.length}
        />
      )}

      {/* Résultats agrégés (visible quand clôturé ou admin) */}
      {(isClosed || isAdmin) && responses.length > 0 && (
        <div className="space-y-4">
          {/* Scénarios d'échec */}
          {(aggregation?.failure_scenarios ?? responses.map((r) => r.failure_scenario)).some(Boolean) && (
            <div className="bg-na-error-container/10 border border-na-error/20 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-na-error mb-3">
                🪦 Scénarios d&apos;échec ({responses.filter((r) => r.failure_scenario).length})
              </h2>
              <div className="space-y-3">
                {(aggregation?.failure_scenarios ?? responses.map((r) => r.failure_scenario))
                  .filter(Boolean)
                  .map((scenario, i) => (
                    <div key={i} className="pl-3 border-l-2 border-na-error/40">
                      <p className="text-sm text-on-surface-variant leading-relaxed">{scenario}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Risques majeurs */}
          {(aggregation?.major_risks ?? responses.map((r) => r.major_risks)).some(Boolean) && (
            <div className="bg-na-secondary-container/20 border border-na-secondary/20 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-na-secondary mb-3">
                ⚠️ Risques majeurs identifiés ({responses.filter((r) => r.major_risks).length})
              </h2>
              <div className="space-y-3">
                {(aggregation?.major_risks ?? responses.map((r) => r.major_risks))
                  .filter(Boolean)
                  .map((risk, i) => (
                    <div key={i} className="pl-3 border-l-2 border-na-secondary/40">
                      <p className="text-sm text-on-surface-variant leading-relaxed">{risk}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-surface-container-low border border-border/10 rounded-xl p-4">
        <p className="text-xs text-on-surface-variant/50">
          <span className="text-on-surface-variant font-medium">Pre-Mortem</span> — Gary Klein (1989).
          Contrairement au post-mortem, le pre-mortem projette l&apos;échec dans le futur pour lever les biais de confirmation avant la décision.
          Toutes les réponses sont anonymisées.
        </p>
      </div>
    </div>
  )
}
