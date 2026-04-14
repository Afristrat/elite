# Stitch Prompt — Kanban des projets

**Page :** `/projects/kanban`
**Mode Stitch :** Web
**Type :** Évaluateur / Admin

---

## Prompt

```
Dark-themed Kanban board view for "Veille Élite" investment committee portfolio management. 4-column board showing projects at different pipeline stages.

GLOBAL LAYOUT:
- Left sidebar 240px dark gray-900, active item "Projets" with blue accent
- Top header with title "Portfolio Kanban" + subtitle "Vue pipeline de tous les projets"
- Main content: dark gray-950 background, padding 24px
- Toggle buttons top-right: "Vue liste" (inactive, gray) | "Kanban" (active, blue)
- Button "+ Nouveau projet" next to toggle (admin only)

4-COLUMN KANBAN GRID (grid-cols-4, gap-4, items-start):

COLUMN 1 — "En évaluation" (status: open):
- Header: dot blue-500 + label "En évaluation" font-semibold text-sm + count badge "7" blue-600/20 text-blue-400
- Border-top: 2px solid blue-500
- Background: bg-gray-950/50 rounded-xl
- 3-4 project cards inside

COLUMN 2 — "Quorum atteint" (status: closed):
- Header: dot yellow-500 + label "Quorum atteint" + count "3" yellow
- Border-top: 2px solid yellow-500

COLUMN 3 — "Décidés" (status: decided):
- Header: dot green-500 + label "Décidés" + count "3" green
- Border-top: 2px solid green-500

COLUMN 4 — "Archivés" (status: archived):
- Header: dot gray-500 + label "Archivés" + count "5" gray
- Border-top: 2px solid gray-600

KANBAN CARD (inside each column):
- bg-gray-900 border border-gray-800 rounded-lg p-3 hover:border-gray-600 cursor-pointer
- margin-bottom 8px
- Title: white text-sm font-medium line-clamp-2
- Sector: gray-500 text-xs
- Meta row: "H2" gray pill + "MOIC: 4.2×" gray-400 text-xs
- Progress row (for open cards): "3/5 éval." gray-500 text-xs + score "7.2" green-400 text-xs font-mono
- Overdue badge: "En retard" red-500/20 text-red-400 text-xs rounded (if deadline passed)

EMPTY COLUMN STATE:
- Dashed border border-gray-800 border-dashed, rounded-xl, height 120px
- "Aucun projet" gray-600 text-sm centered

DESIGN SYSTEM:
- Dark theme, 4-column grid
- Column color coding: blue/yellow/green/gray
- French language
- Subtle card hover effects
```
