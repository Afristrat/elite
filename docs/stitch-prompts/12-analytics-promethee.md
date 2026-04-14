# Stitch Prompt — Analytics PROMETHEE II

**Page :** `/analytics`
**Mode Stitch :** Web
**Type :** Admin uniquement

---

## Prompt

```
Dark-themed PROMETHEE II multi-criteria ranking analytics page for "Veille Élite" investment committee. Shows mathematical ranking of all evaluated projects.

GLOBAL LAYOUT:
- Left sidebar 240px gray-900, active item "Analytiques"
- Main content: gray-950, padding 32px

HEADER:
- Title "Analytics — PROMETHEE II" white text-2xl font-bold
- Subtitle "Classement multi-critères pondérés par flux de préférence" gray-400 text-sm
- Info badge: "ⓘ Méthode" gray-700 text-gray-400 text-xs rounded-full px-2 py-1 clickable

PODIUM TOP 3 (gray-900 border-gray-800 rounded-xl p-6, margin-top 24px):
  Title "Podium" white font-semibold + date "Mis à jour 14 mars 2026" gray-500 text-xs right
  
  3-column grid (items-end for podium height effect):
  
  POSITION 2 (left, medium height):
  - Medal 🥈 text-3xl centered
  - Project title "Fintech crédit scoring PME" white text-sm font-medium text-center line-clamp-2
  - Φ net score "+0.312" blue-400 font-mono text-lg font-bold centered
  - Base platform: bg-gray-700 rounded-t-lg h-20

  POSITION 1 (center, tallest):
  - Medal 🥇 text-4xl
  - Project title "Marketplace SaaS B2B Agritech" white text-sm font-medium
  - Φ net "+0.487" yellow-400 font-mono text-xl font-bold
  - Base: bg-yellow-900/40 rounded-t-lg h-32

  POSITION 3 (right, shortest):
  - Medal 🥉 text-3xl
  - Project title "Expansion énergies renouvelables"
  - Φ net "+0.198" green-400 font-mono text-base
  - Base: bg-gray-700 rounded-t-lg h-14

FULL RANKING TABLE (gray-900 border-gray-800 rounded-xl overflow-hidden margin-top 24px):
  Header: "Classement complet" white font-semibold px-5 py-4 + "8 projets analysés" gray-500 text-xs

  TABLE (w-full):
  Columns: Rang | Projet | Φ net | Φ+ | Φ− | Score moy.
  Column headers: text-xs text-gray-500 uppercase tracking-wide px-4 py-3 border-b border-gray-800

  ROW 1 (gold highlight):
  - Rang: "1" yellow-400 font-bold text-sm
  - Projet: link "Marketplace SaaS B2B Agritech" white text-sm font-medium
  - Φ net: "+0.487" green-400 font-mono text-sm
  - Φ+: "0.623" gray-300 text-sm
  - Φ−: "0.136" gray-300 text-sm
  - Score: "7.2 / 10" blue-400 text-sm
  Row bg: bg-yellow-950/10

  ROW 2:
  - Rang: "2" gray-400 font-bold
  - Same columns with different values
  Row bg: transparent, hover:bg-gray-800/50

  ROW 3 (bronze):
  - Rang: "3" orange-400 font-bold
  Row bg: bg-orange-950/10

  Rows 4-8: Standard rows, alternating subtle bg

  NEGATIVE Φ net row (bottom): value in red-400

METHOD EXPLANATION (gray-900 border-gray-800 rounded-xl p-5 margin-top 16px):
  "Comment lire ce classement ?" gray-500 text-xs collapsible
  List of criteria with weights

DESIGN SYSTEM:
- Dark theme
- Podium: visual height difference (tallest center, medium left, short right)
- Φ net: green if positive, red if negative
- Top 3 row highlights: gold/silver/bronze subtle backgrounds
- French language
```
