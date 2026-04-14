import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AARForm } from './aar-form'
import type { AARResponseData } from '@/actions/aar'

type AARPageProps = { params: Promise<{ id: string }> }

export default async function AARPage({ params }: AARPageProps): Promise<React.JSX.Element> {
  const { id } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from('projects')
    .select('id, title, status, decided_at')
    .eq('id', id)
    .single()

  if (!project) notFound()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user!.id)
    .single()

  const isAdmin = profile?.role === 'admin'
  const canSubmit = ['decided', 'archived'].includes(project.status)

  // Réponse existante de l'utilisateur courant
  const { data: myResponse } = await supabase
    .from('aar_responses')
    .select('responses')
    .eq('project_id', id)
    .eq('filled_by', user!.id)
    .single()

  // Toutes les réponses (admin seulement)
  const { data: allResponses } = isAdmin
    ? await supabase
        .from('aar_responses')
        .select('id, responses, filled_by, created_at, profiles!aar_responses_filled_by_fkey(full_name, email)')
        .eq('project_id', id)
        .order('created_at', { ascending: true })
    : { data: null }

  const decidedAt = project.decided_at ? new Date(project.decided_at) : null
  const now = new Date()
  const daysSinceDecision = decidedAt
    ? Math.floor((now.getTime() - decidedAt.getTime()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <div className="space-y-6">
      <p className="text-gray-400 text-sm">
        After Action Review de <span className="text-white font-medium">{project.title}</span>
        {daysSinceDecision !== null && (
          <span className="text-gray-500"> · J+{daysSinceDecision}</span>
        )}
      </p>

      {!canSubmit ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
          <p className="text-gray-500 text-sm">AAR disponible après la décision du comité</p>
          <p className="text-gray-600 text-xs mt-1">
            L&apos;After Action Review est déclenché une fois la décision enregistrée par l&apos;administrateur.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Description */}
          <div className="bg-blue-950/15 border border-blue-900/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-xl mt-0.5">🪖</span>
              <div>
                <p className="text-sm font-semibold text-blue-300">Méthode AAR — US Army (1970s)</p>
                <p className="text-sm text-gray-400 mt-1">
                  4 questions structurées pour tirer les leçons de chaque décision : ce qui était prévu, ce qui s&apos;est passé, pourquoi la différence, et ce que nous ferions différemment.
                </p>
              </div>
            </div>
          </div>

          {/* Formulaire personnel */}
          <div>
            <h2 className="text-sm font-semibold text-gray-300 mb-3">
              {myResponse ? 'Votre AAR (modifiable)' : 'Soumettre votre AAR'}
            </h2>
            <AARForm
              projectId={id}
              initialData={myResponse ? myResponse.responses as AARResponseData : undefined}
            />
          </div>

          {/* Contributions des autres (admin uniquement) */}
          {isAdmin && allResponses && allResponses.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-300">
                Toutes les contributions ({allResponses.length})
              </h2>
              <div className="space-y-3">
                {allResponses.map((r) => {
                  const resp = r.responses as AARResponseData
                  const profileData = r.profiles as { full_name?: string; email?: string } | null
                  return (
                    <div key={r.id} className="bg-gray-900/60 border border-gray-800/60 rounded-xl p-4 space-y-2">
                      <p className="text-xs text-gray-500 font-medium">
                        {profileData?.full_name ?? profileData?.email ?? 'Membre'} ·{' '}
                        {new Date(r.created_at).toLocaleDateString('fr-FR')}
                      </p>
                      {Object.entries(resp).map(([, value], i) => (
                        value ? (
                          <div key={i} className="pl-3 border-l border-gray-700">
                            <p className="text-xs text-gray-300 leading-relaxed">{String(value)}</p>
                          </div>
                        ) : null
                      ))}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
