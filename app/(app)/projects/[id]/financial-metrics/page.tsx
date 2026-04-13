import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { FinancialCalculator } from './financial-calculator'
import { defaultScenarios } from '@/lib/analytics/monte-carlo'
import type { Scenario } from '@/lib/analytics/monte-carlo'

type FinancialMetricsPageProps = { params: Promise<{ id: string }> }

export default async function FinancialMetricsPage({ params }: FinancialMetricsPageProps): Promise<React.JSX.Element> {
  const { id } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from('projects')
    .select('id, title, moic_target, scenarios')
    .eq('id', id)
    .single()

  if (!project) notFound()

  const moicTarget = project.moic_target ?? 3

  let scenarios: Scenario[]
  if (Array.isArray(project.scenarios) && project.scenarios.length >= 2) {
    scenarios = (project.scenarios as unknown as Scenario[]).map((s) => ({
      label: String(s.label ?? 'Scénario'),
      moic: Number(s.moic ?? 1),
      probability: Number(s.probability ?? 33),
    }))
  } else {
    scenarios = defaultScenarios(moicTarget)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link href={`/projects/${id}`} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
          ← Retour au projet
        </Link>
        <h1 className="text-xl font-bold text-white mt-2">Métriques financières</h1>
        <p className="text-gray-400 text-sm mt-1">
          IRR, MOIC et sensibilité pour{' '}
          <span className="text-white font-medium">{project.title}</span>
          {' '}· Cible : <span className="text-blue-400 font-medium">{moicTarget}×</span>
        </p>
      </div>

      <FinancialCalculator moicTarget={moicTarget} initialScenarios={scenarios} />

      <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-4">
        <p className="text-xs text-gray-600">
          <span className="text-gray-500 font-medium">IRR</span> (Internal Rate of Return) — taux actuariel annualisé.{' '}
          <span className="text-gray-500 font-medium">MOIC</span> (Multiple on Invested Capital) = valeur sortie / capital investi.
          Conversion : MOIC = (1 + IRR)^n. Les probabilités sont calculées par simulation Monte Carlo ({project.scenarios ? 'scénarios du projet' : 'scénarios par défaut'}).
        </p>
      </div>
    </div>
  )
}
