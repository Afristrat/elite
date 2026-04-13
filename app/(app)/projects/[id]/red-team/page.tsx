import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'

type RedTeamData = {
  strongest_argument_against?: string
  blind_spots?: string
  conditions_for_success?: string
}

type RedTeamPageProps = { params: Promise<{ id: string }> }

export default async function RedTeamPage({ params }: RedTeamPageProps): Promise<React.JSX.Element> {
  const { id } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from('projects')
    .select('id, title, status, quorum_required')
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

  // Évaluations avec red_team
  const { data: evaluations } = await supabase
    .from('evaluations')
    .select('id, red_team, submitted_at')
    .eq('project_id', id)
    .not('red_team', 'is', null)

  const redTeamResponses = (evaluations ?? [])
    .map((e) => e.red_team as RedTeamData | null)
    .filter((r): r is RedTeamData => r !== null && Object.keys(r).length > 0)

  const hasData = redTeamResponses.length > 0
  const quorumNotReached = project.status === 'open' && !isAdmin

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link href={`/projects/${id}`} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
          ← Retour au projet
        </Link>
        <h1 className="text-xl font-bold text-white mt-2">Red Team — Contre-argumentation</h1>
        <p className="text-gray-400 text-sm mt-1">
          Analyse critique structurée de{' '}
          <span className="text-white font-medium">{project.title}</span>
        </p>
      </div>

      {quorumNotReached ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
          <p className="text-gray-500 text-sm">Red Team disponible après le quorum</p>
          <p className="text-gray-600 text-xs mt-1">
            Les contributions Red Team seront visibles une fois que {project.quorum_required} évaluations auront été soumises.
          </p>
        </div>
      ) : !hasData ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
          <p className="text-gray-500 text-sm">Aucune contribution Red Team disponible</p>
          <p className="text-gray-600 text-xs mt-1">
            Les évaluateurs peuvent renseigner des arguments contre, angles morts et conditions de succès dans le formulaire d&apos;évaluation.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <StatCard
              label="Contributions"
              value={String(redTeamResponses.length)}
            />
            <StatCard
              label="Arguments contre"
              value={String(redTeamResponses.filter((r) => r.strongest_argument_against).length)}
              color="text-red-400"
            />
            <StatCard
              label="Conditions de succès"
              value={String(redTeamResponses.filter((r) => r.conditions_for_success).length)}
              color="text-yellow-400"
            />
          </div>

          {/* Arguments contre */}
          {redTeamResponses.some((r) => r.strongest_argument_against) && (
            <Section
              icon="⚔️"
              title="Arguments contre"
              color="text-red-300"
              bg="bg-red-950/15"
              border="border-red-900/30"
            >
              <div className="space-y-3">
                {redTeamResponses
                  .filter((r) => r.strongest_argument_against)
                  .map((r, i) => (
                    <div key={i} className={cn('pl-3 border-l-2 border-red-800/60', i > 0 && 'mt-3')}>
                      <p className="text-sm text-gray-300 leading-relaxed">{r.strongest_argument_against}</p>
                    </div>
                  ))}
              </div>
            </Section>
          )}

          {/* Angles morts */}
          {redTeamResponses.some((r) => r.blind_spots) && (
            <Section
              icon="🕳️"
              title="Angles morts identifiés"
              color="text-orange-300"
              bg="bg-orange-950/15"
              border="border-orange-900/30"
            >
              <div className="space-y-3">
                {redTeamResponses
                  .filter((r) => r.blind_spots)
                  .map((r, i) => (
                    <div key={i} className={cn('pl-3 border-l-2 border-orange-800/60', i > 0 && 'mt-3')}>
                      <p className="text-sm text-gray-300 leading-relaxed">{r.blind_spots}</p>
                    </div>
                  ))}
              </div>
            </Section>
          )}

          {/* Conditions de succès */}
          {redTeamResponses.some((r) => r.conditions_for_success) && (
            <Section
              icon="✅"
              title="Conditions de succès"
              color="text-yellow-300"
              bg="bg-yellow-950/15"
              border="border-yellow-900/30"
            >
              <div className="space-y-3">
                {redTeamResponses
                  .filter((r) => r.conditions_for_success)
                  .map((r, i) => (
                    <div key={i} className={cn('pl-3 border-l-2 border-yellow-800/60', i > 0 && 'mt-3')}>
                      <p className="text-sm text-gray-300 leading-relaxed">{r.conditions_for_success}</p>
                    </div>
                  ))}
              </div>
            </Section>
          )}

          <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-4">
            <p className="text-xs text-gray-600">
              <span className="text-gray-500 font-medium">Red Team</span> — Méthode issue du renseignement militaire US.
              Principe : désigner un groupe chargé d&apos;attaquer activement le plan pour en révéler les vulnérabilités.
              Chaque argument est anonymisé — les contributions individuelles ne sont pas attribuées.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function Section({
  icon, title, color, bg, border, children,
}: {
  icon: string
  title: string
  color: string
  bg: string
  border: string
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <div className={cn('rounded-xl border p-5', bg, border)}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">{icon}</span>
        <h2 className={cn('text-sm font-semibold', color)}>{title}</h2>
      </div>
      {children}
    </div>
  )
}

function StatCard({ label, value, color = 'text-white' }: { label: string; value: string; color?: string }): React.JSX.Element {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={cn('text-xl font-bold mt-1', color)}>{value}</p>
    </div>
  )
}
