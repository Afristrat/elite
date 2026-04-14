import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EvaluationForm } from '@/components/evaluations/evaluation-form'
import { TourWidget } from '@/components/tour/tour-widget'
import type { TourStep } from '@/components/tour/tour-segment'

type EvaluatepageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tour?: string; open?: string; decided?: string }>
}

export default async function EvaluatePage({ params, searchParams }: EvaluatepageProps): Promise<React.JSX.Element> {
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

  // Contributeurs ne peuvent pas accéder à cette page
  if (profile?.role === 'contributeur') redirect(`/projects/${id}`)

  const { data: project } = await supabase
    .from('projects')
    .select('id, title, status, proposant_id, sector, horizon')
    .eq('id', id)
    .single()

  if (!project) notFound()

  // Projet pas ouvert → redirect vers la page projet
  if (project.status !== 'open') redirect(`/projects/${id}`)

  // Proposant → ne peut pas évaluer son propre projet (sauf admin pour démo / supervision)
  if (project.proposant_id === user!.id && profile?.role !== 'admin') redirect(`/projects/${id}`)

  // Vérifier si déjà évalué
  const { data: existing } = await supabase
    .from('evaluations')
    .select('id')
    .eq('project_id', id)
    .eq('evaluateur_id', user!.id)
    .single()

  if (existing) {
    redirect(`/projects/${id}/results`)
  }

  // Récupérer les critères d'évaluation (globaux par défaut, spécifiques au projet si définis)
  const { data: projectCriteria } = await supabase
    .from('evaluation_criteria')
    .select('id, label, description, weight, weight_method, order_index')
    .eq('project_id', id)
    .order('order_index')

  const { data: defaultCriteria } = await supabase
    .from('evaluation_criteria')
    .select('id, label, description, weight, weight_method, order_index')
    .is('project_id', null)
    .order('order_index')

  const criteria = (projectCriteria?.length ? projectCriteria : defaultCriteria) ?? []

  if (criteria.length === 0) {
    return (
      <div className="bg-na-error-container/10 border border-na-error/30 rounded-xl p-6">
        <p className="text-na-error text-sm">
          Aucun critère d&apos;évaluation configuré. Contactez l&apos;administrateur.
        </p>
      </div>
    )
  }

  // ── Tour guidé — segment 4 (Évaluation) ────────────────────────────────────
  const isTour4 = sp.tour === '4'
  const tourDecided = sp.decided ?? ''
  const tourOpen = sp.open ?? ''
  const tourParams = `open=${tourOpen}&decided=${tourDecided}`

  const tour4Steps: TourStep[] = [
    {
      element: '[data-tour="evaluation-criteria"]',
      popover: {
        title: '📏 5 critères pondérés',
        description:
          'Chaque projet est noté sur 5 critères définis par l\'admin et pondérés via la méthode AHP (Analytic Hierarchy Process). Les poids garantissent que les critères les plus stratégiques ont le plus d\'impact sur la décision finale. Notez de 0 à 10.',
        side: 'top',
        align: 'start',
      },
    },
    {
      element: '[data-tour="red-team-section"]',
      popover: {
        title: '⚔️ Red Team — L\'avocat du diable',
        description:
          'Le Red Team vous force à challenger activement la thèse d\'investissement. Trouvez les failles, les hypothèses non validées, les risques ignorés. C\'est l\'exercice le plus difficile — et le plus précieux pour éviter les biais optimistes et les investissements récupérables.',
        side: 'top',
        align: 'start',
      },
    },
  ]

  const tour4NextUrl = tourDecided
    ? `/projects/${tourDecided}?tour=5&${tourParams}`
    : `/decisions?tour=6&${tourParams}`

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Tour guidé — segment 4 */}
      {isTour4 && (
        <TourWidget
          steps={tour4Steps}
          nextUrl={tour4NextUrl}
          currentSegment={4}
          totalSegments={8}
        />
      )}

      {/* Notice d'anonymat */}
      <div className="bg-primary-container/10 border border-primary-container/30 rounded-xl p-4 flex items-center gap-3">
        <span className="text-na-primary text-lg">🔒</span>
        <span className="text-na-primary text-sm font-medium">
          Votre évaluation est anonyme jusqu&apos;au quorum. Soyez exhaustif et impartial.
        </span>
      </div>

      <EvaluationForm projectId={id} criteria={criteria} />
    </div>
  )
}
