# Stitch Prompt — Résultats d'évaluation d'un projet

**Page :** `/projects/[id]/results`
**Mode Stitch :** Web
**Type :** Admin / Évaluateur (post-quorum)

---

## Prompt

```
Dark-themed project evaluation results page for "Veille Élite" investment committee. Shows aggregated scores, Red Team synthesis, and individual evaluator comments.

GLOBAL LAYOUT:
- Left sidebar 240px gray-900
- Main content: gray-950, padding 32px

HEADER:
- Breadcrumb "← Marketplace SaaS B2B…"
- Badge "Quorum atteint ✓" green-600/20 border-green-800 text-green-400 rounded-full
- Title "Résultats" white text-xl font-bold
- Right: button "Enregistrer la décision" bg-green-600 text-white rounded-lg px-4 py-2 (admin only)

KPI CARDS (3 columns, margin-top 24px):
- "Score global" label + "7.24 / 10" white text-2xl font-bold, border-blue-800
- "Évaluations" label + "5 / 5" green-400 text-2xl font-bold, border-green-800
- "Quorum" label + "Atteint ✓" green-400 text-xl font-bold

SCORES PAR CRITÈRE (gray-900 border-gray-800 rounded-xl p-5 margin-top 24px):
  Title "Scores par critère" + description "Moyennes pondérées de toutes les évaluations"

  TABLE (5 rows):
  Row 1: "Impact marché" + "(30%)" gray-500 text-xs | Score "7.6 / 10" white | Bar: bg-green-500 76% width on gray-800 track h-2
  Row 2: "Solidité de l'équipe (25%)" | "8.2 / 10" green-400 | Bar 82% green
  Row 3: "Modèle financier (20%)" | "5.8 / 10" yellow-400 | Bar 58% yellow
  Row 4: "Différenciation (15%)" | "7.0 / 10" white | Bar 70% blue
  Row 5: "Alignement stratégique (10%)" | "8.0 / 10" green | Bar 80% green
  Divider
  TOTAL ROW: "Score pondéré" bold | "7.24 / 10" blue-400 text-lg font-bold

RED TEAM AGRÉGÉ (bg-red-950/20 border-red-900/50 rounded-xl p-5 margin-top 16px):
  Title "🔴 Red Team — Synthèse collective" red-400 font-semibold + "5 contributions" gray-500 text-xs
  
  Sub-section "Arguments contre":
  - 3-4 bullet points gray-300 text-sm (anonymized contributions concatenated)
  
  Sub-section "Angles morts":
  - 2-3 bullet points
  
  Sub-section "Conditions pour le succès":
  - 2-3 bullet points

COMMENTAIRES ÉVALUATEURS (gray-900 border-gray-800 rounded-xl p-5 margin-top 16px):
  Title "Commentaires" + badge "5"
  
  5 evaluator rows (border-t border-gray-800 pt-4 space-y-4):
  Row 1:
  - "Évaluateur 1" gray-300 text-sm font-medium (anonymized, or real name if admin)
  - Score "7.8 / 10" blue-400 text-sm
  - Date "14 mars 2026" gray-500 text-xs
  - Comment text gray-300 text-sm leading-relaxed line-clamp-3

DECISION MODAL (visible as overlay on button click):
  - Overlay bg-black/60
  - Modal: gray-900 rounded-2xl p-6 max-w-lg border border-gray-800
  - Title "Enregistrer la décision"
  - Radio group: ✅ "Approuver" | ❌ "Rejeter" | ⏸ "Différer"
  - "Approuver" selected: green-600/20 border-green-600 rounded-lg
  - Textarea "Justification" (min 100 chars) gray-800 border-gray-700
  - Buttons: "Annuler" gray + "Confirmer la décision" green-600

DESIGN SYSTEM:
- Dark theme
- Score bars: color based on score (red < 5, yellow 5-7, green > 7)
- Red Team section distinct red bg
- French language
```
