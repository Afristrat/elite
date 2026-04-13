/**
 * PROMETHEE II — Implémentation Pure TypeScript
 * Méthode de ranking multi-critères pour le classement des projets.
 *
 * Référence : Brans, J.P. & Vincke, Ph. (1985)
 */

export type Criterion = {
  id: string
  label: string
  weight: number // Somme des poids = 100
  preferenceFunction?: 'linear' | 'usual' // default 'usual'
  threshold?: number // seuil d'indifférence pour 'linear'
}

export type Project = {
  id: string
  title: string
  scores: Record<string, number> // criterion_id → score 0-10
}

export type PrometheeLResult = {
  projectId: string
  title: string
  phi: number // Net flow (Phi+ - Phi-)
  phiPlus: number // Positive flow (force)
  phiMinus: number // Negative flow (faiblesse)
  rank: number
}

/**
 * Calcule la préférence P(a, b) pour un critère donné.
 * Fonction usuelle : 0 si d <= 0, 1 si d > 0
 * Fonction linéaire : 0 si d <= 0, d/threshold si 0 < d <= threshold, 1 si d > threshold
 */
function preference(
  scoreA: number,
  scoreB: number,
  fn: 'linear' | 'usual' = 'usual',
  threshold = 5,
): number {
  const d = scoreA - scoreB
  if (d <= 0) return 0
  if (fn === 'usual') return 1
  // linear
  return Math.min(d / threshold, 1)
}

/**
 * PROMETHEE II — calcule le ranking des projets.
 */
export function runPrometheeII(
  projects: Project[],
  criteria: Criterion[],
): PrometheeLResult[] {
  const n = projects.length
  if (n < 2) {
    return projects.map((p, i) => ({
      projectId: p.id,
      title: p.title,
      phi: 0,
      phiPlus: 0,
      phiMinus: 0,
      rank: i + 1,
    }))
  }

  // Normaliser les poids
  const totalWeight = criteria.reduce((s, c) => s + c.weight, 0)
  const normalizedCriteria = criteria.map((c) => ({
    ...c,
    weight: totalWeight > 0 ? c.weight / totalWeight : 1 / criteria.length,
  }))

  // Calculer la matrice de préférence agrégée Pi(a, b)
  const pi: number[][] = Array.from({ length: n }, () => new Array<number>(n).fill(0))

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) continue
      let piAB = 0
      for (const crit of normalizedCriteria) {
        const scoreA = projects[i].scores[crit.id] ?? 0
        const scoreB = projects[j].scores[crit.id] ?? 0
        piAB += crit.weight * preference(
          scoreA,
          scoreB,
          crit.preferenceFunction ?? 'usual',
          crit.threshold ?? 5,
        )
      }
      pi[i][j] = piAB
    }
  }

  // Calculer les flows
  const results: PrometheeLResult[] = projects.map((project, i) => {
    let phiPlus = 0
    let phiMinus = 0

    for (let j = 0; j < n; j++) {
      if (i === j) continue
      phiPlus += pi[i][j]
      phiMinus += pi[j][i]
    }

    phiPlus = phiPlus / (n - 1)
    phiMinus = phiMinus / (n - 1)
    const phi = phiPlus - phiMinus

    return {
      projectId: project.id,
      title: project.title,
      phi,
      phiPlus,
      phiMinus,
      rank: 0, // calculé après tri
    }
  })

  // Trier par phi décroissant et assigner les rangs
  results.sort((a, b) => b.phi - a.phi)
  results.forEach((r, i) => { r.rank = i + 1 })

  return results
}
