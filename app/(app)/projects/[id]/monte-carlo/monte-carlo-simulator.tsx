'use client'

import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer, Cell } from 'recharts'
import { runMonteCarlo } from '@/lib/analytics/monte-carlo'
import type { Scenario } from '@/lib/analytics/monte-carlo'
import { cn } from '@/lib/utils'

type Props = {
  initialScenarios: Scenario[]
  moicTarget: number
}

export function MonteCarloSimulator({ initialScenarios, moicTarget }: Props): React.JSX.Element {
  const [scenarios, setScenarios] = useState<Scenario[]>(initialScenarios)
  const [iterations, setIterations] = useState(10_000)
  const [seed, setSeed] = useState(0) // pour re-run

  const result = useMemo(() => {
    void seed // force recalcul quand seed change
    return runMonteCarlo({ scenarios, iterations })
  }, [scenarios, iterations, seed])

  function updateScenario(i: number, field: keyof Scenario, value: string): void {
    setScenarios((prev) => {
      const next = [...prev]
      if (field === 'moic' || field === 'probability') {
        next[i] = { ...next[i]!, [field]: parseFloat(value) || 0 }
      } else {
        next[i] = { ...next[i]!, [field]: value }
      }
      return next
    })
  }

  const totalProb = scenarios.reduce((s, sc) => s + sc.probability, 0)
  const probColor = (prob: number): string => {
    if (prob >= 70) return 'text-green-400'
    if (prob >= 40) return 'text-yellow-400'
    return 'text-red-400'
  }

  // Données graphique
  const chartData = result.distribution.map((pct, i) => ({
    x: (result.bucketMin + (i + 0.5) * (result.bucketMax - result.bucketMin) / 50).toFixed(2),
    pct,
    isAboveTarget: parseFloat((result.bucketMin + (i + 0.5) * (result.bucketMax - result.bucketMin) / 50).toFixed(2)) >= moicTarget,
  }))

  return (
    <div className="space-y-5">
      {/* Scénarios */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-200">Scénarios d&apos;entrée</h2>
          <span className={cn('text-xs font-medium', Math.abs(totalProb - 100) < 0.5 ? 'text-green-400' : 'text-red-400')}>
            Σ = {totalProb.toFixed(0)}% {Math.abs(totalProb - 100) < 0.5 ? '✓' : '⚠ (doit être 100)'}
          </span>
        </div>
        <div className="space-y-3">
          {scenarios.map((sc, i) => (
            <div key={i} className="grid grid-cols-3 gap-3 items-center">
              <input
                value={sc.label}
                onChange={(e) => { updateScenario(i, 'label', e.target.value) }}
                className="text-sm bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                placeholder="Scénario"
              />
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={sc.moic}
                  onChange={(e) => { updateScenario(i, 'moic', e.target.value) }}
                  className="flex-1 text-sm bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                />
                <span className="text-xs text-gray-500">×</span>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="5"
                  value={sc.probability}
                  onChange={(e) => { updateScenario(i, 'probability', e.target.value) }}
                  className="flex-1 text-sm bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                />
                <span className="text-xs text-gray-500">%</span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 pt-1">
          <label className="text-xs text-gray-500">Itérations :</label>
          <select
            value={iterations}
            onChange={(e) => { setIterations(parseInt(e.target.value)) }}
            className="text-xs bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white"
          >
            <option value={1_000}>1 000</option>
            <option value={10_000}>10 000</option>
            <option value={50_000}>50 000</option>
          </select>
          <button
            type="button"
            onClick={() => { setSeed((s) => s + 1) }}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            ↻ Relancer
          </button>
        </div>
      </div>

      {/* Résultats clés */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500">MOIC médian (P50)</p>
          <p className="text-xl font-bold text-white mt-1">{result.median.toFixed(2)}×</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500">MOIC moyen</p>
          <p className="text-xl font-bold text-white mt-1">{result.mean.toFixed(2)}×</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500">P10 (pessimiste)</p>
          <p className="text-xl font-bold text-red-400 mt-1">{result.p10.toFixed(2)}×</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500">P90 (optimiste)</p>
          <p className="text-xl font-bold text-green-400 mt-1">{result.p90.toFixed(2)}×</p>
        </div>
      </div>

      {/* Probabilités */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
        <h2 className="text-sm font-semibold text-gray-200">Probabilités de succès</h2>
        <div className="space-y-2">
          {[
            { label: 'Ne pas perdre (MOIC ≥ 1×)', value: result.probAbove1x },
            { label: 'Doubler (MOIC ≥ 2×)', value: result.probAbove2x },
            { label: `Atteindre la cible (MOIC ≥ ${moicTarget}×)`, value: result.probAboveTarget },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="text-xs text-gray-400 flex-1">{label}</span>
              <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full', value >= 70 ? 'bg-green-500' : value >= 40 ? 'bg-yellow-500' : 'bg-red-500')}
                  style={{ width: `${value}%` }}
                />
              </div>
              <span className={cn('text-sm font-bold w-12 text-right', probColor(value))}>
                {value.toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Distribution */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
        <h2 className="text-sm font-semibold text-gray-200">Distribution des résultats</h2>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
            <XAxis
              dataKey="x"
              tick={{ fill: '#6b7280', fontSize: 10 }}
              tickLine={false}
              interval={9}
              tickFormatter={(v) => `${v}×`}
            />
            <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} />
            <Tooltip
              formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Fréquence']}
              labelFormatter={(label) => `MOIC ${String(label)}×`}
              contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', fontSize: 12 }}
              labelStyle={{ color: '#f9fafb' }}
            />
            <ReferenceLine x={String(moicTarget.toFixed(2))} stroke="#3b82f6" strokeDasharray="4 2" label={{ value: 'Cible', fill: '#60a5fa', fontSize: 10 }} />
            <Bar dataKey="pct" radius={[2, 2, 0, 0]} maxBarSize={20}>
              {chartData.map((entry, idx) => (
                <Cell key={idx} fill={entry.isAboveTarget ? '#22c55e' : '#6b7280'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-gray-600">
          {result.iterations.toLocaleString()} itérations · En vert : scénarios au-dessus de la cible ({moicTarget}×) · Intervalle de confiance P10–P90 : [{result.p10.toFixed(2)}× ; {result.p90.toFixed(2)}×]
        </p>
      </div>
    </div>
  )
}
