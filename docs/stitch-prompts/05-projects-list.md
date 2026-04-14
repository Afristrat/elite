# Stitch Prompt — Liste des projets

**Page :** `/projects`
**Mode Stitch :** Web
**Type :** Utilisateur authentifié

---

## Prompt

```
Dark-themed project listing page for "Veille Élite" investment committee platform. Shows all projects with filtering by status and investment horizon.

GLOBAL LAYOUT:
- Left sidebar 240px (same as dashboard): dark gray-900, nav items, logo "Veille Élite"
- Active sidebar item: "Projets" with blue accent
- Main content: dark gray-950 background, padding 32px

HEADER SECTION:
- Title "Projets" in white text-2xl font-bold + count badge "(23)" in gray-600 text-sm inline
- Right side: button "+ Soumettre un projet" bg-blue-600 text-white rounded-lg px-4 py-2 text-sm
- Below title: two rows of filter pills

FILTER ROW 1 — Statut:
- Pills: "Tous" | "Brouillons" | "Ouverts" | "Fermés" | "Décidés" | "Archivés"
- Active pill style: border-blue-500 bg-blue-600/10 text-blue-300 rounded-full text-xs px-3 py-1
- Inactive pill: border-gray-700 text-gray-400 rounded-full text-xs px-3 py-1
- "Ouverts" is active in this view

FILTER ROW 2 — Horizon (margin-top 8px):
- Pills: "Tous horizons" | "H1 Court terme" | "H2 Moyen terme" | "H3 Long terme"
- Same pill styling, "Tous horizons" active

PROJECT CARDS GRID (margin-top 24px, single column list, gap-3):
Show 6 project cards:

CARD 1 (open project):
- bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700
- Top row: Badge "Ouvert" (blue-600/20 border-blue-800 text-blue-400) + Badge "H2" (gray-800 text-gray-300 monospace font-mono text-xs) + Badge "Growth" (purple-600/20 text-purple-400)
- Title "Marketplace SaaS B2B pour le secteur agricole marocain" white font-medium text-sm line-clamp-1
- Meta row (gray-500 text-xs): "AgriTech • MOIC cible : 4.2× • ⚠️ J-3 (deadline rouge)"
- Tags row: Pills "marketplace" "B2B" "agritech" "SaaS" +2 — gray-800 text-gray-400 rounded-full text-xs px-2 py-0.5
- Right arrow → gray-600, absolute right

CARD 2 (closed — quorum atteint):
- Badge "Fermé" yellow-900/50 border-yellow-800 text-yellow-400
- Title "Expansion réseau d'énergies renouvelables Afrique subsaharienne"
- Meta: "CleanTech • MOIC cible : 6.0× • Fermé le 12 jan"
- Tags: "energie" "B2C" "impact"

CARD 3 (decided — approved):
- Badge "Décidé" green-900/50 border-green-800 text-green-400
- Title "Fintech de crédit scoring pour PME informelles"
- Meta: "Fintech • MOIC cible : 3.5× • Décidé"

CARD 4, 5, 6: Similar variations with different sectors

EMPTY STATE (when no projects match filter):
- Card centered: icon 📂 + "Aucun projet ne correspond à vos filtres" gray-400 + link "Réinitialiser les filtres" blue-400

DESIGN SYSTEM:
- Dark theme throughout
- STATUS_COLORS: open=blue, closed=yellow, decided=green, draft=gray, archived=gray
- Hover: border transitions, arrow becomes white
- French language
```
