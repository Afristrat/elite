import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { EvaluationForm } from '@/components/evaluations/evaluation-form'

type EvaluatepageProps = {
  params: Promise<{ id: string }>
}

export default async function EvaluatePage({ params }: EvaluatepageProps): Promise<React.JSX.Element> {
  const { id } = await params
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

  // Proposant → ne peut pas évaluer son propre projet
  if (project.proposant_id === user!.id) redirect(`/projects/${id}`)

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
      <div className="space-y-4">
        <Link href={`/projects/${id}`} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
          ← Retour au projet
        </Link>
        <div className="bg-yellow-950/30 border border-yellow-900 rounded-xl p-6">
          <p className="text-yellow-300 text-sm">
            Aucun critère d&apos;évaluation configuré. Contactez l&apos;administrateur.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link href={`/projects/${id}`} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
          ← Retour au projet
        </Link>
        <h1 className="text-xl font-bold text-white mt-2">Évaluer — {project.title}</h1>
        <p className="text-gray-400 text-sm mt-1">
          Votre évaluation est anonyme jusqu&apos;au quorum. Soyez exhaustif et impartial.
        </p>
      </div>

      <EvaluationForm projectId={id} criteria={criteria} />
    </div>
  )
}
