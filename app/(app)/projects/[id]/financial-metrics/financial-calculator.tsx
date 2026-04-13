'use client'

import { useState, useMemo } from 'react'
import { runMonteCarlo } from '@/lib/analytics/monte-carlo'
import type { Scenario } from '@/lib/analytics/monte-carlo'
import { cn } from '@/lib/utils'

/** MOIC → IRR annualisé */
function moicToIrr(moic: number, years: number): number {
  if (years <= 0 || moic <= 0) return 0
  return (Math.pow(moic, 1 / years) - 1) * 100
}

/** Tableau de sensibilité : MOIC en fonction de l'IRR et des années */
function irrToMoic(irr: number, years: number): number {
  return Math.pow(1 + irr / 100, years)
}

type Props = {
  moicTarget: number
  initialScenarios: Scenario[]
}

const HOLDING_PERIODS = [2, 3, 5, 7, 10]
const TARGET_IRRS = [15, 20, 25, 30, 40]

export function FinancialCalculator({ moicTarget, initialScenarios }: Props): React.JSX.Element {
  const [ticketSize, setTicketSize] = useState(100_000)
  const [holdingPeriod, setHoldingPeriod] = useState(5)

  const monteCarloResult = useMemo(
    () => runMonteCarlo({ scenarios: initialScenarios }),
    [initialScenarios],
  )

  // Métriques pour le ticket + horizon donnés
  const scenarios = [
    { label: 'Pessimiste (P10)', moic: monteCarloResult.p10, color: 'text-red-400' },
    { label: 'Base (P50)', moic: monteCarloResult.median, color: 'text-gray-300' },
    { label: 'Cible', moic: moicTarget, color: 'text-blue-400' },
    { label: 'Optimiste (P90)', moic: monteCarloResult.p90, color: 'text-green-400' },
  ]

  return (
    <div className="space-y-5">
      {/* Inputs */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-200 mb-4">Paramètres de l&apos;investissement</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs text-gray-500">Ticket (€)</label>
            <input
              type="number"
              min={1000}
              step={10000}
              value={ticketSize}
              onChange={(e) => { setTicketSize(parseInt(e.target.value) || 100_000) }}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-gray-500">Horizon de sortie (années)</label>
            <select
              value={holdingPeriod}
              onChange={(e) => { setHoldingPeriod(parseInt(e.target.value)) }}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
            >
              {HOLDING_PERIODS.map((y) => (
                <option key={y} value={y}>{y} ans</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tableau MOIC → IRR → Valeur finale */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800">
          <h2 className="text-sm font-semibold text-gray-200">Scénarios sur {holdingPeriod} ans</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left text-xs text-gray-500 px-5 py-3">Scénario</th>
              <th className="text-right text-xs text-gray-500 px-5 py-3">MOIC</th>
              <th className="text-right text-xs text-gray-500 px-5 py-3">IRR annualisé</th>
              <th className="text-right text-xs text-gray-500 px-5 py-3">Valeur finale</th>
              <th className="text-right text-xs text-gray-500 px-5 py-3">Gain net</th>
            </tr>
          </thead>
          <tbody>
            {scenarios.map((sc) => {
              const irr = moicToIrr(sc.moic, holdingPeriod)
              const finalValue = sc.moic * ticketSize
              const gain = finalValue - ticketSize
              return (
                <tr key={sc.label} className="border-b border-gray-800/50 hover:bg-gray-800/20">
                  <td className="px-5 py-3 text-sm text-gray-400">{sc.label}</td>
                  <td className={cn('px-5 py-3 text-sm font-semibold text-right', sc.color)}>
                    {sc.moic.toFixed(2)}×
                  </td>
                  <td className={cn('px-5 py-3 text-sm font-semibold text-right', sc.color)}>
                    {irr.toFixed(1)}%
                  </td>
                  <td className="px-5 py-3 text-sm text-right text-white">
                    {finalValue.toLocaleString('fr-FR', { minimumFractionDigits: 0 })} €
                  </td>
                  <td className={cn('px-5 py-3 text-sm text-right', gain >= 0 ? 'text-green-400' : 'text-red-400')}>
                    {gain >= 0 ? '+' : ''}{gain.toLocaleString('fr-FR', { minimumFractionDigits: 0 })} €
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Sensibilité IRR → MOIC par horizon */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800">
          <h2 className="text-sm font-semibold text-gray-200">Table de sensibilité — MOIC par IRR et horizon</h2>
          <p className="text-xs text-gray-500 mt-0.5">Lecture : quel MOIC pour un IRR donné sur N années ?</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-xs text-gray-500 px-4 py-3">IRR \ Ans</th>
                {HOLDING_PERIODS.map((y) => (
                  <th key={y} className={cn('text-right text-xs font-medium px-4 py-3', y === holdingPeriod ? 'text-blue-400' : 'text-gray-500')}>
                    {y} ans
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TARGET_IRRS.map((irr) => (
                <tr key={irr} className="border-b border-gray-800/50 hover:bg-gray-800/20">
                  <td className="px-4 py-2 text-xs font-semibold text-gray-400">{irr}%</td>
                  {HOLDING_PERIODS.map((y) => {
                    const moic = irrToMoic(irr, y)
                    const isTarget = Math.abs(moic - moicTarget) < 0.5 && y === holdingPeriod
                    return (
                      <td key={y} className={cn(
                        'px-4 py-2 text-xs text-right',
                        isTarget ? 'text-blue-400 font-bold' : moic >= moicTarget ? 'text-green-400' : 'text-gray-500',
                        y === holdingPeriod ? 'bg-blue-950/10' : '',
                      )}>
                        {moic.toFixed(2)}×
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Probabilité de succès (Monte Carlo) */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
        <h2 className="text-sm font-semibold text-gray-200">Probabilités Monte Carlo</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Ne pas perdre (≥ 1×)', value: monteCarloResult.probAbove1x, color: 'text-white' },
            { label: 'Doubler (≥ 2×)', value: monteCarloResult.probAbove2x, color: 'text-blue-400' },
            { label: `Cible (≥ ${moicTarget}×)`, value: monteCarloResult.probAboveTarget, color: 'text-green-400' },
            { label: `IRR ≥ 20% (${holdingPeriod} ans)`, value: (irrToMoic(20, holdingPeriod) <= monteCarloResult.median ? monteCarloResult.probAbove2x : monteCarloResult.probAboveTarget), color: 'text-purple-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center">
              <p className="text-xs text-gray-500">{label}</p>
              <p className={cn('text-xl font-bold mt-1', color)}>{value.toFixed(0)}%</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
