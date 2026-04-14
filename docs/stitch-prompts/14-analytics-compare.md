# Stitch Prompt — Analytics Comparaison projets

**Page :** `/analytics/compare`
**Mode Stitch :** Web
**Type :** Admin uniquement

---

## Prompt

```
Dark-themed side-by-side project comparison analytics page for "Veille Élite" investment committee. Compare up to 4 investment projects across all criteria.

GLOBAL LAYOUT:
- Left sidebar 240px gray-900
- Main content: gray-950, padding 32px

HEADER:
- Breadcrumb "← Analytiques"
- Title "Analyse comparative" white text-2xl font-bold
- Subtitle "Comparez jusqu'à 4 projets côte à côte" gray-400 text-sm

PROJECT SELECTOR (gray-900 border-gray-800 rounded-xl p-5 margin-top 24px):
  Title "Sélectionnez les projets à comparer" white font-semibold text-sm
  
  Flex wrap of toggle buttons (gap-2):
  - "Marketplace Agritech" — selected: bg-blue-600/20 border-blue-500 text-blue-300 rounded-lg px-3 py-2 text-sm
  - "Fintech crédit scoring" — selected: same
  - "Expansion énergies" — selected: same
  - "Logistique last-mile" — not selected: bg-gray-800 border-gray-700 text-gray-400 rounded-lg px-3 py-2
  - "EdTech rural Maroc" — not selected
  - "HealthTech diagnostics" — not selected
  
  Note: "3 / 4 projets sélectionnés" gray-500 text-xs margin-top 8px

COMPARISON TABLE — MÉTRIQUES GÉNÉRALES (gray-900 rounded-xl overflow-hidden margin-top 24px):
  Title "Métriques générales" white font-semibold px-5 py-4

  TABLE (w-full, 4 data columns + 1 label column):
  Header row: "" | "Marketplace Agritech" blue-300 font-medium | "Fintech crédit" blue-300 | "Expansion énergies" blue-300
  
  Rows:
  "Score global"    | "7.24" (green highlight = max) | "8.10" green-400 bold | "6.98"
  "Nb évaluations"  | "5" white | "5" white | "4" yellow-400 (below quorum)
  "MOIC cible"      | "4.2×" | "3.5×" | "6.0×" green-400 bold
  "Horizon"         | "H2" gray pill | "H2" gray | "H3" gray
  "Catégorie"       | "Growth" purple | "Core" blue | "Moonshot" orange
  "Secteur"         | "AgriTech" | "Fintech" | "CleanTech"
  
  Column highlighting: max value per row in green-400 bold + subtle bg-green-950/20

COMPARISON TABLE — SCORES PAR CRITÈRE (gray-900 rounded-xl overflow-hidden margin-top 16px):
  Title "Scores par critère" white font-semibold px-5 py-4

  TABLE:
  Header: "" | projects names
  Rows per criterion:
  "Impact marché (30%)" | "7.6" green | "8.2" green highlight | "7.0"
  "Solidité équipe (25%)" | "8.2" green highlight | "7.8" | "6.5" yellow
  "Modèle financier (20%)" | "5.8" yellow | "7.5" | "6.0" yellow
  "Différenciation (15%)" | "7.0" | "8.5" green highlight | "7.8"
  "Alignement strat (10%)" | "8.0" | "7.2" | "9.0" green highlight
  
  Score color: green > 7.5, yellow 5-7.5, red < 5

DESIGN SYSTEM:
- Dark theme
- Max value per row highlighted in green
- Below-average values in red/yellow
- Responsive table with overflow-x-auto on mobile
- French language
```
