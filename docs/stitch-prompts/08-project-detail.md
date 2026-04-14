# Stitch Prompt — Détail d'un projet

**Page :** `/projects/[id]`
**Mode Stitch :** Web
**Type :** Utilisateur authentifié

---

## Prompt

```
Dark-themed project detail page for "Veille Élite" investment committee platform. Shows full investment thesis, market research, Monte Carlo scenarios.

GLOBAL LAYOUT:
- Left sidebar 240px gray-900
- Main content: gray-950, padding 32px

PROJECT HEADER:
- Breadcrumb: "← Projets" blue-400 text-sm
- Badges row: "Ouvert" (blue pill) + "H2" (gray monospace pill) + "Growth" (purple pill)
- Title h1 "Marketplace SaaS B2B pour le secteur agricole marocain" white text-2xl font-bold, margin-top 8px
- Subtitle "AgriTech" gray-400 text-sm
- Right side (absolute or flex justify-between): button "Évaluer ce projet" bg-blue-600 text-white rounded-lg px-4 py-2 text-sm

TAB NAVIGATION (below header, margin-top 24px, border-b border-gray-800):
- Tabs: "Projet" (active, blue-400 border-b-2 border-blue-500) | "Évaluer" | "Résultats" | "AAR" | "Outcomes"
- Tab text: text-sm font-medium, active: text-blue-400, inactive: text-gray-400

KPI MINI CARDS (3 columns, margin-top 24px, margin-bottom 24px):
- Card 1: "Évaluations" label gray-500 xs + value "3 / 5" white text-xl font-bold
- Card 2: "Score moyen" label + value "7.2 / 10" blue-400 text-xl font-bold
- Card 3: "Quorum" label + value "En cours…" yellow-400 text-sm (or "Atteint ✓" green)
Each: bg-gray-900 border-gray-800 rounded-xl p-4

CONTENT SECTIONS (vertical stack, gap-4):

SECTION 1 — "Analyse du marché" (bg-gray-900 border-gray-800 rounded-xl p-5):
  - Sub-label "Problème identifié" gray-500 text-xs uppercase
  - Content paragraph gray-300 text-sm leading-relaxed
  - Sub-label "Solution proposée"
  - Content paragraph
  - Sub-label "Montant d'investissement"
  - Value "350 000 €" white font-semibold

SECTION 2 — "Scénarios Monte Carlo" (gray-900 rounded-xl p-5):
  - Title + description badge
  - 3 scenario cards in a grid:
    - "Pessimiste" card: border-red-900/50 bg-red-950/20 rounded-lg p-4
      Probability "15%" + MOIC "1.5×" red-400 + description text-sm gray-300
    - "Réaliste" card: border-yellow-900/50 bg-yellow-950/20 rounded-lg p-4
      Probability "60%" + MOIC "4.2×" yellow-400
    - "Optimiste" card: border-green-900/50 bg-green-950/20 rounded-lg p-4
      Probability "25%" + MOIC "8.0×" green-400

SECTION 3 — "Thèse d'investissement" (gray-900 rounded-xl p-5):
  - "Conviction" sub-label + statement text white italic text-sm
  - "3 Hypothèses vérifiables" numbered list ol
    1. Hypothesis text gray-300 text-sm
    2. Hypothesis text
    3. Hypothesis text

SECTION 4 — "Risques & Hypothèses clés" (gray-900 rounded-xl p-5):
  - 2 columns: "Principaux risques" + "Hypothèses du modèle"
  - Each: bullet list gray-300 text-sm

FOOTER: "Soumis le 3 mars 2026" gray-500 text-xs

DESIGN SYSTEM:
- Dark theme, content-heavy reading layout
- Scenario cards color-coded red/yellow/green
- Tab navigation stays sticky below project header
- French language
```
