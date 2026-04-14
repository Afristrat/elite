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
          <h1 className="text-2xl font-bold text-on-surface">AHP — Calibration des poids</h1>
          <p className="text-on-surface-variant text-sm mt-1">
            Analytic Hierarchy Process — comparaison par paires pour dériver des poids cohérents
          </p>
        </div>
        <Link href="/analytics" className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
          ← Analytics
        </Link>
      </div>

      {/* Explication méthode */}
      <div className="bg-surface-container-low border border-border/10 rounded-xl p-6 space-y-4">
        <p className="text-xs font-bold text-primary uppercase tracking-widest">Processus de méthode</p>
        <ol className="space-y-4">
          {[
            { n: '01.', title: 'Sélectionner les critères', desc: 'Définir les piliers fondamentaux de l\'analyse d\'investissement.' },
            { n: '02.', title: 'Comparer par paires', desc: 'Utilisez l\'échelle de Saaty : 1 = égal, 3 = modérément plus important, 9 = absolument plus important.' },
            { n: '03.', title: 'Vérifier la cohérence', desc: 'L\'algorithme calcule automatiquement les poids et vérifie la cohérence (CR < 10%).' },
            { n: '04.', title: 'Valider les poids', desc: 'Si CR < 10% : sauvegardez. Les poids deviennent les poids par défaut de toutes les évaluations futures.' },
          ].map(({ n, title, desc }) => (
            <li key={n} className="flex gap-4">
              <span className="text-primary font-bold text-lg shrink-0">{n}</span>
              <div>
                <p className="text-on-surface font-semibold text-sm">{title}</p>
                <p className="text-on-surface-variant text-xs mt-1">{desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {criteriaList.length < 2 ? (
        <div className="bg-surface-container border border-border/10 rounded-xl p-8 text-center space-y-2">
          <p className="text-muted-foreground text-sm">Au moins 2 critères par défaut sont nécessaires.</p>
          <Link href="/settings" className="text-xs text-primary hover:text-primary/80">
            → Configurer les critères par défaut
          </Link>
        </div>
      ) : (
        <AHPCalibrator criteria={criteriaList} />
      )}
    </div>
  )
}
