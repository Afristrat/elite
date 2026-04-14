# Stitch Prompt — AHP Calibration des poids

**Page :** `/analytics/ahp`
**Mode Stitch :** Web
**Type :** Admin uniquement

---

## Prompt

```
Dark-themed AHP (Analytic Hierarchy Process) pairwise comparison calibration tool for "Veille Élite" investment committee. Admin tool for setting evaluation criteria weights.

GLOBAL LAYOUT:
- Left sidebar 240px gray-900
- Main content: gray-950, padding 32px

HEADER:
- Breadcrumb "← Analytiques"
- Title "AHP — Calibration des poids" white text-2xl font-bold
- Subtitle "Comparaisons par paires pour pondérer les critères d'évaluation" gray-400 text-sm

METHOD EXPLANATION (gray-900 border-gray-800 rounded-xl p-5 margin-top 24px):
  Title "Comment ça marche ?" white font-semibold text-sm
  4 numbered steps (list):
  1. "Comparez chaque paire de critères selon leur importance relative"
  2. "Utilisez l'échelle de Saaty (1/9 = extrêmement moins important → 9 = extrêmement plus important)"
  3. "L'algorithme calcule automatiquement les poids et vérifie la cohérence (CR < 10%)"
  4. "Validez pour appliquer les nouveaux poids aux futures évaluations"
  Each step: gray-300 text-sm, numbered in blue-400

AHP MATRIX (gray-900 border-gray-800 rounded-xl p-6 margin-top 16px):
  Title "Matrice de comparaison (5×5)" white font-semibold

  TABLE (triangular upper matrix):
  
  Headers row: "" | "Impact marché" | "Solidité équipe" | "Modèle financier" | "Différenciation" | "Alignement strat."
  All headers: gray-400 text-xs font-medium
  
  Row "Impact marché": "1" (diagonal, gray-700 bg) | dropdown "3" blue | dropdown "5" | dropdown "3" | dropdown "7"
  Row "Solidité équipe": "--" (lower triangle, gray-800) | "1" diagonal | dropdown "3" | dropdown "5" | dropdown "5"
  Row "Modèle financier": "--" "--" | "1" | dropdown "2" | dropdown "3"
  Row "Différenciation": "--" "--" "--" | "1" | dropdown "2"
  Row "Alignement": "--" "--" "--" "--" | "1"
  
  DROPDOWN (each comparison cell):
  - bg-gray-800 border border-gray-700 rounded-md px-2 py-1.5 text-white text-sm w-20
  - Options: 1/9, 1/7, 1/5, 1/3, 1, 3, 5, 7, 9
  - Selected value shown as text

CONSISTENCY CHECK (margin-top 24px):
  Row: "Ratio de cohérence (CR) :" gray-500 text-sm + "7.3%" green-400 font-mono text-base font-bold
  Bar indicator: h-2 bg-gray-800 rounded-full, fill bg-green-500 at 73% (of 10% max threshold)
  Status: "✓ Cohérent (seuil : < 10%)" green-400 text-xs

RESULTING WEIGHTS (gray-900 border-gray-800 rounded-xl p-5 margin-top 16px):
  Title "Poids résultants" white font-semibold
  
  5 rows:
  "Impact marché"    | bar blue-500 at 30% | "30.2%" white font-mono text-sm font-bold
  "Solidité équipe"  | bar blue-500 at 25% | "24.8%"
  "Modèle financier" | bar blue-500 at 20% | "20.1%"
  "Différenciation"  | bar blue-500 at 15% | "15.3%"
  "Alignement strat."| bar blue-500 at 10% | "9.6%"
  Total: "100%" green-400 font-bold text-right

ACTION BUTTONS (margin-top 24px, flex justify-between):
  Left: "← Retour" gray border button
  Right: "Valider et appliquer" bg-blue-600 text-white rounded-lg px-5 py-2.5 font-medium

DESIGN SYSTEM:
- Dark theme, form/matrix heavy
- Upper triangle = editable dropdowns, lower triangle = grayed out (symmetric)
- Diagonal = "1" (auto, gray bg, not editable)
- CR indicator: green if < 10%, red if >= 10%
- French language
```
