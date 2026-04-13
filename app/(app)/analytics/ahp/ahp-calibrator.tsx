'use client'

import { useState, useTransition, useMemo } from 'react'
import { buildMatrix, computeAHP, weightsToPercent, formatSaatyValue } from '@/lib/analytics/ahp'
import { saveAHPWeights } from '@/actions/ahp'
import { cn } from '@/lib/utils'

type Criterion = {
  id: string
  label: string
  weight: number
}

type Props = {
  criteria: Criterion[]
}

// Valeurs Saaty disponibles (triangle supérieur)
const SAATY_OPTIONS = [9, 7, 5, 3, 1, 1 / 3, 1 / 5, 1 / 7, 1 / 9]

export function AHPCalibrator({ criteria }: Props): React.JSX.Element {
  const n = criteria.length

  // upperValues[`i-j`] = valeur de comparaison (i < j)
  const [upperValues, setUpperValues] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {}
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        init[`${i}-${j}`] = 1
      }
    }
    return init
  })

  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const { result, percents } = useMemo(() => {
    const matrix = buildMatrix(n, upperValues)
    const r = computeAHP(matrix)
    const p = weightsToPercent(r.weights)
    return { result: r, percents: p }
  }, [n, upperValues])

  function handleChange(i: number, j: number, val: number): void {
    setSaved(false)
    setSaveError(null)
    setUpperValues((prev) => ({ ...prev, [`${i}-${j}`]: val }))
  }

  function handleSave(): void {
    setSaved(false)
    setSaveError(null)
    const weights: Record<string, number> = {}
    criteria.forEach((c, i) => { weights[c.id] = percents[i] })
    startTransition(async () => {
      const r = await saveAHPWeights(weights)
      if (r.success) {
        setSaved(true)
      } else {
        setSaveError(r.error ?? 'Erreur lors de la sauvegarde')
      }
    })
  }

  if (n < 2) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
        <p className="text-gray-500 text-sm">Au moins 2 critères sont nécessaires pour la calibration AHP.</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Matrice de comparaison par paires */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-200">Comparaison par paires</h2>
        <p className="text-xs text-gray-500">
          Pour chaque paire de critères, indiquez l&apos;importance relative du critère en ligne par rapport
          au critère en colonne. Utilisez l&apos;échelle de Saaty (1 = égal, 9 = absolument plus important).
        </p>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left text-xs text-gray-600 px-2 py-2 min-w-[140px]">Critère</th>
                {criteria.map((c) => (
                  <th key={c.id} className="text-center text-xs text-gray-500 px-2 py-2 min-w-[100px]">
                    <span className="block truncate max-w-[90px]" title={c.label}>{c.label}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {criteria.map((row, i) => (
                <tr key={row.id} className="border-t border-gray-800/50">
                  <td className="px-2 py-2 text-xs text-gray-300 font-medium">{row.label}</td>
                  {criteria.map((col, j) => {
                    if (i === j) {
                      return (
                        <td key={col.id} className="px-2 py-2 text-center">
                          <span className="text-xs text-gray-600 font-semibold">1</span>
                        </td>
                      )
                    }
                    if (i > j) {
                      // Triangle inférieur : afficher la valeur inverse (lecture seule)
                      const inv = upperValues[`${j}-${i}`] ?? 1
                      return (
                        <td key={col.id} className="px-2 py-2 text-center">
                          <span className="text-xs text-gray-600 italic">{formatSaatyValue(1 / inv)}</span>
                        </td>
                      )
                    }
                    // Triangle supérieur : sélecteur
                    const current = upperValues[`${i}-${j}`] ?? 1
                    return (
                      <td key={col.id} className="px-2 py-2 text-center">
                        <select
                          value={current}
                          onChange={(e) => { handleChange(i, j, Number(e.target.value)) }}
                          className="text-xs bg-gray-800 border border-gray-700 rounded px-1.5 py-1 text-white focus:border-blue-500 focus:outline-none w-full"
                        >
                          {SAATY_OPTIONS.map((v) => (
                            <option key={v} value={v}>
                              {formatSaatyValue(v)}
                            </option>
                          ))}
                        </select>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Résultats AHP */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Poids calculés */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-semibold text-gray-200">Poids calculés</h2>
          <div className="space-y-2">
            {criteria.map((c, i) => (
              <div key={c.id} className="flex items-center gap-3">
                <span className="text-xs text-gray-400 flex-1 truncate" title={c.label}>{c.label}</span>
                <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${percents[i]}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-white w-10 text-right">
                  {percents[i]}%
                </span>
                <span className="text-xs text-gray-600 w-12 text-right">
                  (avant : {c.weight}%)
                </span>
              </div>
            ))}
          </div>
          <div className="pt-2 border-t border-gray-800">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Total</span>
              <span className="font-semibold text-white">
                {percents.reduce((a, b) => a + b, 0)}%
              </span>
            </div>
          </div>
        </div>

        {/* Indicateurs de cohérence */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-semibold text-gray-200">Cohérence AHP</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">λ max</span>
              <span className="text-sm font-semibold text-white">{result.lambdaMax.toFixed(4)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Consistency Index (CI)</span>
              <span className="text-sm font-semibold text-white">{result.ci.toFixed(4)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Random Index (RI, n={n})</span>
              <span className="text-sm font-semibold text-white">{result.ri.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-800">
              <span className="text-xs font-semibold text-gray-300">Consistency Ratio (CR)</span>
              <span className={cn(
                'text-lg font-bold',
                result.consistent ? 'text-green-400' : 'text-red-400'
              )}>
                {(result.cr * 100).toFixed(1)}%
              </span>
            </div>
            <div className={cn(
              'rounded-lg px-3 py-2 text-xs',
              result.consistent
                ? 'bg-green-950/20 border border-green-800/40 text-green-400'
                : 'bg-red-950/20 border border-red-800/40 text-red-400'
            )}>
              {result.consistent
                ? '✓ Cohérence acceptable (CR < 10%) — les poids peuvent être sauvegardés.'
                : '✗ Incohérence détectée (CR ≥ 10%) — revisez vos comparaisons avant de sauvegarder.'}
            </div>
            <p className="text-xs text-gray-600">
              Règle de Saaty : CR &lt; 10% garantit la cohérence des comparaisons par paires.
            </p>
          </div>
        </div>
      </div>

      {/* Sauvegarde */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending || !result.consistent}
          className={cn(
            'px-5 py-2 text-sm font-semibold rounded-lg transition-colors',
            result.consistent
              ? 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed',
          )}
        >
          {isPending ? 'Sauvegarde…' : 'Sauvegarder les poids AHP'}
        </button>
        {saved && <span className="text-sm text-green-400">✓ Poids mis à jour</span>}
        {saveError && <span className="text-sm text-red-400">{saveError}</span>}
        {!result.consistent && (
          <span className="text-xs text-yellow-500">CR ≥ 10% — sauvegarde bloquée</span>
        )}
      </div>

      <p className="text-xs text-gray-600">
        <span className="text-gray-500 font-medium">AHP (Analytic Hierarchy Process)</span> — méthode de Thomas Saaty (1980).
        La sauvegarde met à jour les poids des critères par défaut utilisés dans toutes les évaluations futures.
        Les évaluations existantes ne sont pas recalculées.
      </p>
    </div>
  )
}
