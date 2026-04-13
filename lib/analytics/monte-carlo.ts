/**
 * Monte Carlo — Simulateur de scénarios ROI
 * Génère une distribution de MOIC en simulant N itérations
 * avec une probabilité pondérée par scénario.
 */

export type Scenario = {
  label: string
  moic: number
  probability: number // 0–100, somme = 100
}

export type MonteCarloInput = {
  scenarios: Scenario[]
  iterations?: number // default 10 000
}

export type MonteCarloResult = {
  iterations: number
  mean: number
  median: number
  p10: number // percentile 10 — scénario pessimiste
  p25: number
  p75: number
  p90: number // percentile 90 — scénario optimiste
  probAbove1x: number // probabilité de ne pas perdre
  probAbove2x: number
  probAboveTarget: number // probabilité de dépasser la cible
  target: number
  distribution: number[] // 50 buckets pour le graphique
  bucketMin: number
  bucketMax: number
}

function percentile(sorted: Float64Array, p: number): number {
  const idx = Math.floor((p / 100) * (sorted.length - 1))
  return sorted[idx] ?? 0
}

export function runMonteCarlo(input: MonteCarloInput, moicTarget = 3): MonteCarloResult {
  const { scenarios, iterations = 10_000 } = input

  // Normaliser les probabilités
  const totalProb = scenarios.reduce((s, sc) => s + sc.probability, 0)
  const normalizedScenarios = scenarios.map((sc) => ({
    ...sc,
    probability: totalProb > 0 ? sc.probability / totalProb : 1 / scenarios.length,
  }))

  // Construire la CDF pour le sampling
  const cdf: { threshold: number; moic: number; label: string }[] = []
  let cumulative = 0
  for (const sc of normalizedScenarios) {
    cumulative += sc.probability
    cdf.push({ threshold: cumulative, moic: sc.moic, label: sc.label })
  }

  // Simulation Monte Carlo
  const results = new Float64Array(iterations)
  for (let i = 0; i < iterations; i++) {
    const rand = Math.random()
    let moic = normalizedScenarios[normalizedScenarios.length - 1]?.moic ?? 1
    for (const point of cdf) {
      if (rand <= point.threshold) {
        moic = point.moic
        break
      }
    }
    // Ajouter une légère variance gaussienne (~5% de bruit) pour lisser la distribution
    const noise = 1 + (Math.random() + Math.random() + Math.random() - 1.5) * 0.05
    results[i] = moic * noise
  }

  // Trier pour les percentiles
  results.sort()

  const mean = results.reduce((a, b) => a + b, 0) / iterations
  const median = percentile(results, 50)
  const p10 = percentile(results, 10)
  const p25 = percentile(results, 25)
  const p75 = percentile(results, 75)
  const p90 = percentile(results, 90)

  const probAbove1x = (results.filter((r) => r >= 1).length / iterations) * 100
  const probAbove2x = (results.filter((r) => r >= 2).length / iterations) * 100
  const probAboveTarget = (results.filter((r) => r >= moicTarget).length / iterations) * 100

  // Distribution en 50 buckets pour le graphique
  const bucketMin = Math.max(0, p10 * 0.5)
  const bucketMax = p90 * 1.2
  const bucketSize = (bucketMax - bucketMin) / 50
  const distribution = new Array<number>(50).fill(0)

  for (const r of results) {
    const bucket = Math.floor((r - bucketMin) / bucketSize)
    if (bucket >= 0 && bucket < 50) {
      distribution[bucket] = (distribution[bucket] ?? 0) + 1
    }
  }

  // Normaliser en pourcentage
  for (let i = 0; i < 50; i++) {
    distribution[i] = ((distribution[i] ?? 0) / iterations) * 100
  }

  return {
    iterations,
    mean,
    median,
    p10,
    p25,
    p75,
    p90,
    probAbove1x,
    probAbove2x,
    probAboveTarget,
    target: moicTarget,
    distribution,
    bucketMin,
    bucketMax,
  }
}

/**
 * Scénarios par défaut si le projet n'en a pas de définis.
 */
export function defaultScenarios(moicTarget: number): Scenario[] {
  return [
    { label: 'Pessimiste', moic: Math.max(0.1, moicTarget * 0.3), probability: 25 },
    { label: 'Base', moic: moicTarget, probability: 50 },
    { label: 'Optimiste', moic: moicTarget * 2, probability: 25 },
  ]
}
