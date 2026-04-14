import { createClient } from '@/lib/supabase/server'
import { ThesesManager } from './theses-manager'

export default async function AdminThesesPage(): Promise<React.JSX.Element> {
  const supabase = await createClient()

  const { data: theses } = await supabase
    .from('portfolio_theses')
    .select('id, title, description, horizon, status, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Thèses macro du portefeuille</h1>
        <p className="text-on-surface-variant text-sm mt-1">
          Définissez les convictions stratégiques du groupe — utilisées pour catégoriser les projets
        </p>
      </div>

      <ThesesManager theses={theses ?? []} />
    </div>
  )
}
