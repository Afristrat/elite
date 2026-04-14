import Link from 'next/link'
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
    <div className="space-y-8">
      {/* En-tête de navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/projects"
          className="text-na-primary text-sm flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          ← Retour aux projets
        </Link>
        <div className="flex items-center gap-2 text-on-surface-variant text-[10px] font-medium">
          💾 Auto-sauvegarde activée
        </div>
      </div>

      {/* Titre */}
      <div>
        <h1 className="text-on-surface text-2xl font-semibold tracking-tight">
          Soumettre un projet
        </h1>
        <p className="text-on-surface-variant text-sm mt-1">
          Renseignez les informations du projet pour soumettre à l&apos;évaluation collective
        </p>
      </div>

      <ProjectForm theses={theses ?? []} />
    </div>
  )
}
