import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { CriteriaManager } from './criteria-manager'

type CriteriaPageProps = { params: Promise<{ id: string }> }

export default async function CriteriaPage({ params }: CriteriaPageProps): Promise<React.JSX.Element> {
  const { id } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from('projects')
    .select('id, title, status')
    .eq('id', id)
    .single()

  if (!project) notFound()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user!.id).single()
  if (profile?.role !== 'admin') notFound()

  // Critères spécifiques au projet
  const { data: projectCriteria } = await supabase
    .from('evaluation_criteria')
    .select('id, label, weight, description, order_index')
    .eq('project_id', id)
    .order('order_index')

  // Critères par défaut (fallback)
  const { data: defaultCriteria } = await supabase
    .from('evaluation_criteria')
    .select('id, label, weight, description, order_index')
    .is('project_id', null)
    .order('order_index')

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link href={`/projects/${id}`} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
          ← Retour au projet
        </Link>
        <h1 className="text-xl font-bold text-white mt-2">Critères d&apos;évaluation</h1>
        <p className="text-gray-400 text-sm mt-1">
          Critères personnalisés pour{' '}
          <span className="text-white font-medium">{project.title}</span>
        </p>
      </div>

      {['decided', 'archived'].includes(project.status) && (
        <div className="bg-yellow-950/20 border border-yellow-800/40 rounded-xl p-4">
          <p className="text-yellow-400 text-sm font-medium">Projet décidé — lecture seule recommandée</p>
          <p className="text-yellow-600 text-xs mt-1">
            Modifier les critères après les évaluations peut affecter les calculs PROMETHEE.
          </p>
        </div>
      )}

      <CriteriaManager
        projectId={id}
        projectCriteria={projectCriteria ?? []}
        defaultCriteria={defaultCriteria ?? []}
      />
    </div>
  )
}
