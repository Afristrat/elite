// AHP — Analytic Hierarchy Process
// Méthode de comparaison par paires pour calibrer les poids des critères d'évaluation

// Indice de cohérence aléatoire (RI) pour n critères (Saaty 1980)
const RANDOM_INDEX: Record<number, number> = {
  1: 0,
  2: 0,
  3: 0.58,
  4: 0.90,
  5: 1.12,
  6: 1.24,
  7: 1.32,
  8: 1.41,
  9: 1.45,
  10: 1.49,
}

export type AHPMatrix = number[][] // matrice n×n, valeurs > 0

export type AHPResult = {
  weights: number[]        // poids normalisés (somme = 1)
  lambdaMax: number        // valeur propre principale
  ci: number               // Consistency Index = (λmax - n) / (n - 1)
  ri: number               // Random Index pour n critères
  cr: number               // Consistency Ratio = CI / RI
  consistent: boolean      // CR < 0.10
}

/**
 * Calcule les poids AHP et le Consistency Ratio à partir d'une matrice de comparaison par paires.
 * Utilise l'approximation de la moyenne géométrique des lignes (méthode de Saaty).
 */
export function computeAHP(matrix: AHPMatrix): AHPResult {
  const n = matrix.length
  if (n < 2) {
    return { weights: [1], lambdaMax: 1, ci: 0, ri: 0, cr: 0, consistent: true }
  }

  // Étape 1 : Somme de chaque colonne
  const colSums = Array.from({ length: n }, (_, j) =>
    matrix.reduce((sum, row) => sum + row[j], 0)
  )

  // Étape 2 : Normaliser chaque colonne puis faire la moyenne des lignes
  const weights = matrix.map((row) => {
    const rowNorm = row.map((val, j) => val / colSums[j])
    return rowNorm.reduce((a, b) => a + b, 0) / n
  })

  // Étape 3 : λmax = Σ (colSum × weight)
  const lambdaMax = colSums.reduce((sum, cs, j) => sum + cs * weights[j], 0)

  // Étape 4 : CI = (λmax - n) / (n - 1)
  const ci = (lambdaMax - n) / (n - 1)

  // Étape 5 : RI et CR
  const ri = RANDOM_INDEX[n] ?? 1.49
  const cr = ri === 0 ? 0 : ci / ri

  return {
    weights,
    lambdaMax,
    ci,
    ri,
    cr,
    consistent: cr < 0.10,
  }
}

/**
 * Construit une matrice AHP complète (n×n) depuis le triangle supérieur.
 * upperTriangle[i][j] (i < j) → matrix[i][j], matrix[j][i] = 1 / matrix[i][j]
 */
export function buildMatrix(n: number, upperValues: Record<string, number>): AHPMatrix {
  const matrix: number[][] = Array.from({ length: n }, () => Array(n).fill(1))
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const val = upperValues[`${i}-${j}`] ?? 1
      matrix[i][j] = val
      matrix[j][i] = 1 / val
    }
  }
  return matrix
}

/**
 * Convertit les poids AHP (somme = 1) en pourcentages entiers (somme ≈ 100).
 * Utilise la méthode "largest remainder" pour que la somme soit exactement 100.
 */
export function weightsToPercent(weights: number[]): number[] {
  const raw = weights.map((w) => w * 100)
  const floored = raw.map(Math.floor)
  const remainders = raw.map((r, i) => ({ idx: i, rem: r - floored[i] }))
  remainders.sort((a, b) => b.rem - a.rem)
  const deficit = 100 - floored.reduce((a, b) => a + b, 0)
  for (let k = 0; k < deficit; k++) {
    floored[remainders[k].idx]++
  }
  return floored
}

/** Échelle de Saaty : valeurs standard de comparaison par paires */
export const SAATY_SCALE = [
  { value: 9, label: '9× — Absolument plus important' },
  { value: 7, label: '7× — Très fortement plus important' },
  { value: 5, label: '5× — Fortement plus important' },
  { value: 3, label: '3× — Modérément plus important' },
  { value: 1, label: '1 — Importance égale' },
  { value: 1 / 3, label: '1/3 — Modérément moins important' },
  { value: 1 / 5, label: '1/5 — Fortement moins important' },
  { value: 1 / 7, label: '1/7 — Très fortement moins important' },
  { value: 1 / 9, label: '1/9 — Absolument moins important' },
]

/** Formate une valeur de comparaison AHP en fraction lisible */
export function formatSaatyValue(val: number): string {
  if (val >= 1) return val.toFixed(0) + '×'
  const inv = Math.round(1 / val)
  return `1/${inv}`
}
