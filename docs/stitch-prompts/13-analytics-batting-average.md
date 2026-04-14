# Stitch Prompt — Analytics Batting Average & Slugging

**Page :** `/analytics/batting-average`
**Mode Stitch :** Web
**Type :** Admin uniquement

---

## Prompt

```
Dark-themed decision quality metrics dashboard for "Veille Élite" investment committee. Baseball-inspired KPIs to track committee decision quality over time.

GLOBAL LAYOUT:
- Left sidebar 240px gray-900
- Main content: gray-950, padding 32px

HEADER:
- Breadcrumb "← Analytiques"
- Title "Batting Average & Slugging" white text-2xl font-bold
- Subtitle "Qualité des décisions du comité — Indicateurs de performance" gray-400 text-sm
- Period selector top-right: "30j" | "90j" | "1an" | "Tout" — pills, "90j" active blue

MAIN KPI CARDS (4 columns, margin-top 24px):

Card 1 — "Batting Average":
- bg-gray-900 border-blue-900/50 rounded-xl p-5
- Label "Batting Average" gray-500 text-xs uppercase
- Value "67%" white text-4xl font-bold font-mono
- Subtitle "Approbations / Total décisions" gray-500 text-xs
- Trend: "↑ +8% vs période précédente" green-400 text-xs

Card 2 — "Slugging":
- border-green-900/50
- Value "4.8×" green-400 text-4xl font-bold font-mono
- Subtitle "MOIC moyen des projets approuvés"

Card 3 — "Score comité":
- Value "7.3 / 10" blue-400 text-4xl font-bold font-mono
- Subtitle "Score moyen pré-décision"

Card 4 — "OPS Score":
- border-purple-900/50
- Value "0.847" purple-400 text-4xl font-bold font-mono
- Subtitle "Composite (BA + Slugging normalisé)"

ACTIVITY SUMMARY (4 columns, margin-top 16px, smaller cards):
- "Décisions (90j)" — "12" white text-2xl font-bold
- "Approuvés" — "8" green-400 text-2xl font-bold
- "Rejetés" — "3" red-400 text-2xl font-bold
- "Différés" — "1" yellow-400 text-2xl font-bold
Each: bg-gray-900 border-gray-800 rounded-xl p-4

MOIC DISTRIBUTION HISTOGRAM (gray-900 border-gray-800 rounded-xl p-5 margin-top 16px):
  Title "Distribution MOIC des projets approuvés" white font-semibold
  
  5 horizontal bars (vertical histogram):
  "< 2×"  : 1 project — short bar bg-red-500/60 + count "1" gray-400 text-xs
  "2-3×"  : 2 projects — medium bar bg-yellow-500/60 + count "2"
  "3-5×"  : 4 projects — tall bar bg-blue-500/60 + count "4" (tallest)
  "5-10×" : 1 project — medium bar bg-green-500/60 + count "1"
  "> 10×" : 0 projects — empty bar + "0"
  
  X-axis labels below bars
  Y-axis: "Nombre de projets" vertical label left

DÉCISIONS RÉCENTES TABLE (gray-900 rounded-xl overflow-hidden margin-top 16px):
  Title "Historique des décisions" + "20 dernières" gray-500 text-xs
  
  Table columns: Projet | Décision | MOIC cible | Score comité | Date
  5 visible rows:
  Row: "Marketplace Agritech" | "✓ Approuvé" green-400 | "4.2×" | "7.2" | "14 mars"
  Row: "Fintech crédit scoring" | "✓ Approuvé" green | "3.5×" | "8.1" | "8 mars"
  Row: "Logistique last-mile" | "✗ Rejeté" red-400 | "2.8×" | "4.9" | "1 mars"
  (more rows...)

DESIGN SYSTEM:
- Dark theme
- Baseball metaphor: stats-heavy, monospace font for numbers
- Histogram bars with colors based on MOIC range
- French language (metric names in English are kept as industry terms)
```
