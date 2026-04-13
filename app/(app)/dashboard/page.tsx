import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage(): Promise<React.JSX.Element> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user!.id)
    .single()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Bonjour{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''} 👋
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Tableau de bord du portefeuille Veille Élite
        </p>
      </div>

      {/* KPI cards placeholder */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['Projets ouverts', 'À évaluer', 'Décisions ce mois', 'Score moyen'].map((label) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-gray-500 text-xs">{label}</p>
            <div className="h-7 w-16 bg-gray-800 rounded animate-pulse mt-2" />
          </div>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex items-center justify-center h-48">
        <p className="text-gray-500 text-sm">Dashboard complet — S-014</p>
      </div>
    </div>
  )
}
