# Stitch Prompt — Synthèse Red Team

**Page :** `/projects/[id]/red-team`
**Mode Stitch :** Web
**Type :** Admin / Évaluateur (post-quorum)

---

## Prompt

```
Dark-themed Red Team synthesis page for "Veille Élite" investment committee. Shows aggregated devil's advocate arguments from all evaluators.

GLOBAL LAYOUT:
- Left sidebar 240px gray-900
- Main content: gray-950, padding 32px
- Project tabs visible, "Red Team" active

HEADER:
- Tab navigation, "Red Team" active
- Title "Red Team — Synthèse collective" white text-xl font-bold
- Badge "🔴 5 contributions anonymes" red-600/20 text-red-400 rounded-full px-3 py-1 text-xs

INTRO CARD (bg-red-950/10 border border-red-900/30 rounded-xl p-4 margin-top 24px):
  "L'avocat du diable collectif — Ces arguments sont compilés anonymement pour challenger la décision avant qu'elle soit définitive. Ils ne reflètent pas nécessairement l'avis de chaque évaluateur."
  red-300 text-sm leading-relaxed italic

SECTION 1 — "Arguments contre" (gray-900 border-red-900/30 rounded-xl p-5 margin-top 16px):
  Title "💥 Arguments contre ce projet" red-400 font-semibold + "(5 contributions)" gray-500 text-xs
  
  5 argument bubbles (space-y-3):
  - ARGUMENT 1: bg-gray-800 border border-red-900/30 rounded-lg p-4
    Quote mark icon red-600 + text "Le marché agricole marocain est fragmenté et la consolidation prendra 5-7 ans minimum, pas 2." gray-300 text-sm leading-relaxed
    Footer: "Évaluateur 1" gray-500 text-xs + strength tag "Fort" red-400 text-xs border-red-900 rounded-full px-2

  - ARGUMENT 2 (similar):
    "L'équipe n'a pas d'expérience en distribution rurale, c'est un risque opérationnel critique non adressé."
    Strength: "Modéré" yellow-400

  - ARGUMENT 3: "Le MOIC de 4.2× suppose une sortie à 6× les revenus dans un marché sans comparables..."
    Strength: "Fort"

  - ARGUMENT 4 (slightly dimmed): Less impactful argument

  - ARGUMENT 5: Shorter argument

SECTION 2 — "Angles morts" (gray-900 border-yellow-900/30 rounded-xl p-5 margin-top 16px):
  Title "🔍 Angles morts identifiés" yellow-400 font-semibold + "(4 contributions)"
  
  4 blind spots cards in 2×2 grid:
  CARD: bg-gray-800 border border-yellow-900/30 rounded-lg p-4
  "Dépendance subvention gouvernementale" + description text-sm gray-300

SECTION 3 — "Conditions pour le succès" (gray-900 border-green-900/30 rounded-xl p-5 margin-top 16px):
  Title "✅ Conditions pour réussir" green-400 font-semibold + "(5 contributions)"
  
  5 bullet points (vertical list):
  - green dot + "ARR > €200K avant levée série A" gray-300 text-sm
  - "Recrutement d'un directeur commercial avec réseau sectoriel" gray-300 text-sm
  - "Partenariat avec coopérative agricole établie dans les 6 premiers mois"
  - ... (more)

RISK HEATMAP (gray-900 border-gray-800 rounded-xl p-5 margin-top 16px):
  Title "Cartographie des risques" white font-semibold
  
  Simple 2-axis grid (Impact vs Probabilité):
  - Axis X: "Probabilité →" gray-400 text-xs (Faible | Modéré | Élevé)
  - Axis Y: "Impact ↑" gray-400 text-xs (Faible | Modéré | Élevé)
  - 9 cells with color: red (high impact+prob), yellow (medium), green (low)
  - Risk dots placed on grid with labels

DESIGN SYSTEM:
- Dark theme with red/yellow/green accents per section
- Anonymous contributions without attribution
- Argument strength tags (Fort/Modéré/Faible)
- Risk heatmap for visual impact
- French language
```
