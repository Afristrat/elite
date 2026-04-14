# Stitch Prompt — Matrice GE-McKinsey 9-Box

**Page :** `/analytics/ge-mckinsey`
**Mode Stitch :** Web
**Type :** Admin uniquement

---

## Prompt

```
Dark-themed GE-McKinsey 9-box strategic portfolio matrix for "Veille Élite" investment committee. Strategic visualization showing projects by market attractiveness vs competitive strength.

GLOBAL LAYOUT:
- Left sidebar 240px gray-900
- Main content: gray-950, padding 32px

HEADER:
- Breadcrumb "← Analytiques"
- Title "Matrice GE-McKinsey 9-Box" white text-2xl font-bold
- Subtitle "Positionnement stratégique du portefeuille" gray-400 text-sm

AXES LEGEND (2 columns, gray-900 border-gray-800 rounded-xl p-4 margin-top 24px):
  Left: "Y — Attractivité sectorielle" white font-medium text-sm
    "< 3×" → Faible | "3-5×" → Moyenne | "> 5×" → Forte (basé sur MOIC cible)
  Right: "X — Force compétitive" white font-medium text-sm
    "< 5" → Faible | "5-7" → Moyenne | "> 7" → Forte (basé sur score évaluation)

9-BOX MATRIX GRID (3×3, gray-900 border-gray-800 rounded-xl p-5 margin-top 16px):
  Title "Matrice stratégique" white font-semibold margin-bottom 16px
  
  Y-axis label rotated left: "Attractivité sectorielle" ↑ gray-400 text-xs
  X-axis label below: "Force compétitive →" gray-400 text-xs
  
  Column headers (top): "Faible" | "Moyenne" | "Forte" — gray-500 text-xs
  Row labels (left): "Forte" | "Moyenne" | "Faible" — gray-500 text-xs

  CELLS (3×3 grid, gap-1):
  
  Row 1 (attractivité forte):
  - Cell [forte/faible]: bg-yellow-950/40 border border-yellow-900/50 rounded-lg p-3
    Label "Sélectivité" yellow-400 text-xs font-semibold
    1 project card inside: "Expansion énergies" text-xs white

  - Cell [forte/moyenne]: bg-green-950/40 border border-green-900/50 rounded-lg p-3
    Label "Investir" green-400 text-xs font-semibold
    Empty: dashed border

  - Cell [forte/forte]: bg-green-950/60 border border-green-900/70 rounded-lg p-3
    Label "Leader — Investir" green-300 text-xs font-semibold font-bold
    2 project cards: "Fintech crédit" + "Marketplace Agritech" each as micro-card

  Row 2 (attractivité moyenne):
  - Cell [moyenne/faible]: bg-orange-950/40 rounded-lg p-3
    Label "Récolter / Désinvestir" orange-400 text-xs
    Empty

  - Cell [moyenne/moyenne]: bg-yellow-950/40 border-yellow-900/50 rounded-lg p-3
    Label "Sélectivité" yellow-400 text-xs
    1 project

  - Cell [moyenne/forte]: bg-green-950/40 border-green-900/50 rounded-lg p-3
    Label "Investir" green-400 text-xs
    Empty

  Row 3 (attractivité faible):
  - Cell [faible/faible]: bg-red-950/40 border-red-900/50 rounded-lg p-3
    Label "Désinvestir" red-400 text-xs
    Empty

  - Cell [faible/moyenne]: bg-orange-950/40 rounded-lg p-3
    Label "Récolter" orange-400 text-xs
    Empty

  - Cell [faible/forte]: bg-yellow-950/40 rounded-lg p-3
    Label "Récolter sélectivement" yellow-400 text-xs
    Empty

  MICRO PROJECT CARD (inside cell):
  - bg-gray-800/80 rounded px-2 py-1 text-xs
  - Title white truncate + score badge gray-600

RECOMMENDATIONS (3 columns, gray-900 rounded-xl p-5 margin-top 16px):
  "Recommandations par quadrant" white font-semibold
  3 cards: "Leader (2 projets)" green | "Sélectivité (1 projet)" yellow | "Récolter (0 projets)" red

DESIGN SYSTEM:
- Dark theme with strategic color zones (green=invest, yellow=selective, red/orange=harvest)
- 9-box grid visual with clear cell differentiation
- French language
- Mini project cards inside cells
```
