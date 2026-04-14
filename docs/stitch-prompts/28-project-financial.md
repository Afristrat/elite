# Stitch Prompt — Métriques financières & Monte Carlo

**Page :** `/projects/[id]/financial-metrics`
**Mode Stitch :** Web
**Type :** Admin / Évaluateur (post-quorum)

---

## Prompt

```
Dark-themed financial metrics and Monte Carlo simulation analytics page for "Veille Élite" investment committee. Shows investment scenarios, sensitivity analysis, and expected returns.

GLOBAL LAYOUT:
- Left sidebar 240px gray-900
- Main content: gray-950, padding 32px
- Project tabs visible, "Financial" tab active

HEADER:
- Tab navigation, "Financial" active
- Title "Métriques financières" white text-xl font-bold + "Analyse quantitative du projet" gray-400 text-sm

INVESTMENT SUMMARY (3 KPI cards, margin-top 24px):
- "Montant investissement" "350 000 €" white text-2xl font-bold, gray-900 card
- "MOIC cible (réaliste)" "4.2×" blue-400 text-2xl font-bold, border-blue-800
- "VAN estimée" "€1.12M" green-400 text-2xl font-bold, border-green-800

MONTE CARLO SCENARIOS (gray-900 border-gray-800 rounded-xl p-5 margin-top 24px):
  Title "Scénarios de sortie" white font-semibold + "Modèle à 3 scénarios" gray-500 text-xs

  3 SCENARIO CARDS (3 columns, gap-4):
  
  PESSIMISTE (border-red-900/50 bg-red-950/20 rounded-xl p-5):
    - Badge "Pessimiste" red-400 text-xs font-semibold + probability "15%" gray-400 text-xs right
    - MOIC "1.5×" red-400 text-3xl font-bold font-mono
    - Return: "Retour : €525K" red-300 text-sm
    - PnL: "P&L : -€175K" red-400 text-sm
    - Description text gray-400 text-xs italic (2 lines)

  RÉALISTE (border-yellow-900/50 bg-yellow-950/20 rounded-xl p-5):
    - Badge "Réaliste" yellow-400 + "60%"
    - MOIC "4.2×" yellow-400 text-3xl font-bold
    - Return "Retour : €1.47M" yellow-300 text-sm
    - PnL "+€1.12M" green-400 text-sm
    - Description

  OPTIMISTE (border-green-900/50 bg-green-950/20 rounded-xl p-5):
    - Badge "Optimiste" green-400 + "25%"
    - MOIC "8.0×" green-400 text-3xl font-bold
    - Return "Retour : €2.8M" green-300 text-sm
    - PnL "+€2.45M" green-400 text-sm

EXPECTED VALUE (gray-900 border-gray-800 rounded-xl p-5 margin-top 16px):
  Title "Valeur espérée pondérée" white font-semibold
  
  Calculation display:
  "(15% × 1.5×) + (60% × 4.2×) + (25% × 8.0×) = 4.745×" 
  gray-300 text-sm font-mono
  
  Result: "MOIC espéré : 4.75×" blue-400 text-2xl font-bold
  "Retour attendu : €1.66M" blue-300 text-sm

PROBABILITY DISTRIBUTION CHART (gray-900 border-gray-800 rounded-xl p-5 margin-top 16px):
  Title "Distribution des probabilités de retour" white font-semibold
  
  Simplified bar chart (5 bars):
  "< 1×"  | 1 unit red-500 bar
  "1-2×"  | 2 units red-400 bar
  "2-4×"  | 4 units yellow-500 bar (tallest)
  "4-6×"  | 3 units blue-500 bar
  "> 6×"  | 2 units green-500 bar
  
  X-axis: MOIC ranges, Y-axis: "Probabilité" gray-400 text-xs

SENSITIVITY TABLE (gray-900 border-gray-800 rounded-xl p-5 margin-top 16px):
  Title "Analyse de sensibilité" white font-semibold + "Impact des hypothèses clés sur le MOIC" gray-500 text-xs
  
  3 rows:
  "Taux de croissance marché" | Si +10%: "+0.5×" green | Si -10%: "-0.4×" red
  "Taux de conversion clients" | Si +5%: "+0.3×" green | Si -5%: "-0.6×" red
  "Multiple de sortie" | Si ×6: "+1.2×" green | Si ×3: "-1.5×" red

DESIGN SYSTEM:
- Dark theme, finance-focused
- Scenario cards: red/yellow/green backgrounds
- Monospace font for financial numbers
- Clear P&L positive (green) / negative (red)
- French language, € currency
```
