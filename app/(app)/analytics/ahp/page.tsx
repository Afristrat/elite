import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { AHPCalibrator } from './ahp-calibrator'

export default async function AHPPage(): Promise<React.JSX.Element> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user!.id).single()
  if (profile?.role !== 'admin') notFound()

  // Critères par défaut (project_id IS NULL)
  const { data: criteria } = await supabase
    .from('evaluation_criteria')
    .select('id, label, weight, order_index')
    .is('project_id', null)
    .order('order_index')

  const criteriaList = criteria ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">AHP — Calibration des poids</h1>
          <p className="text-gray-400 text-sm mt-1">
            Analytic Hierarchy Process — comparaison par paires pour dériver des poids cohérents
          </p>
        </div>
        <Link href="/analytics" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
          ← Analytics
        </Link>
      </div>

      {/* Explication méthode */}
      <div className="bg-blue-950/20 border border-blue-800/40 rounded-xl p-4 space-y-2">
        <p className="text-sm font-semibold text-blue-300">Comment fonctionne la méthode AHP ?</p>
        <ol className="text-xs text-gray-400 space-y-1 list-decimal list-inside">
          <li>Comparez chaque critère avec chaque autre critère (triangle supérieur uniquement)</li>
          <li>Utilisez l&apos;échelle de Saaty : 1 = égal, 3 = modérément plus important, 9 = absolument plus important</li>
          <li>L&apos;algorithme calcule automatiquement les poids et vérifie la cohérence (CR &lt; 10%)</li>
          <li>Si CR &lt; 10% : sauvegardez. Les poids deviennent les poids par défaut de toutes les évaluations futures</li>
        </ol>
      </div>

      {criteriaList.length < 2 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center space-y-2">
          <p className="text-gray-500 text-sm">Au moins 2 critères par défaut sont nécessaires.</p>
          <Link href="/settings" className="text-xs text-blue-400 hover:text-blue-300">
            → Configurer les critères par défaut
          </Link>
        </div>
      ) : (
        <AHPCalibrator criteria={criteriaList} />
      )}
    </div>
  )
}
