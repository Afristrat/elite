import { createClient } from '@/lib/supabase/server'
import { ProjectForm } from '@/components/projects/project-form'

export default async function NewProjectPage(): Promise<React.JSX.Element> {
  const supabase = await createClient()

  // Récupérer les thèses macro actives pour le sélecteur de l'étape 5
  const { data: theses } = await supabase
    .from('portfolio_theses')
    .select('id, title, description')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Soumettre un projet</h1>
        <p className="text-gray-400 text-sm mt-1">
          Renseignez les informations du projet pour soumettre à l&apos;évaluation collective
        </p>
      </div>

      <ProjectForm theses={theses ?? []} />
    </div>
  )
}
