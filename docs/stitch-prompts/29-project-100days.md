# Stitch Prompt — Plan 100 jours

**Page :** `/projects/[id]/plan-100-days`
**Mode Stitch :** Web
**Type :** Admin (post-approbation)

---

## Prompt

```
Dark-themed 100-day post-investment action plan page for "Veille Élite" investment committee. Structured timeline of milestones after project approval.

GLOBAL LAYOUT:
- Left sidebar 240px gray-900
- Main content: gray-950, padding 32px
- Project tabs visible, "100-Day Plan" active

HEADER:
- Tab navigation, "100-Day Plan" active
- Title "Plan 100 jours" white text-xl font-bold + "Roadmap post-investissement" gray-400 text-sm
- Badge "Approuvé le 14 mars 2026" green-600/20 text-green-400 text-xs rounded-full + "J+32 aujourd'hui" blue-400 text-xs

PROGRESS BAR (margin-top 24px):
  "Progression : 32 / 100 jours" gray-400 text-sm
  Full-width h-3 bg-gray-800 rounded-full
  Fill: bg-blue-500 at 32%
  Marker "Aujourd'hui" above 32% position

3-PHASE TIMELINE (margin-top 24px, space-y-4):

PHASE 1 — "Semaines 1-4 : Fondations" (gray-900 border-blue-900/50 rounded-xl p-5):
  Phase header: "Phase 1" blue-400 font-semibold + "Semaines 1-4" gray-500 text-xs + badge "✓ En cours" blue-600/20 text-blue-300

  4 MILESTONE ROWS (space-y-3):
  ✅ ROW 1 (completed):
  - Checkbox green filled + strikethrough "Réunion kick-off avec l'équipe fondatrice" text-gray-400 line-through text-sm
  - Date "J+5 — 19 mars 2026" gray-500 text-xs + "Complété" green-400 text-xs

  ✅ ROW 2 (completed):
  - "Due diligence technique terminée" completed styling
  - Date "J+14"

  🔵 ROW 3 (in progress):
  - Circle blue outline + "Ouverture du compte bancaire dédié" white text-sm font-medium
  - Date "J+21 — 4 avr." + "En cours" blue-400 text-xs

  ⬜ ROW 4 (upcoming):
  - Empty checkbox + "Premier versement (tranche 1 : €150K)" gray-300 text-sm
  - Date "J+28 — 11 avr." gray-500 text-xs

PHASE 2 — "Semaines 5-8 : Déploiement" (gray-900 border-gray-800 rounded-xl p-5):
  Phase header: "Phase 2" gray-400 font-semibold + "Semaines 5-8" gray-500 + "À venir" gray-600 badge
  
  3 upcoming milestones (all empty checkboxes, gray text)

PHASE 3 — "Semaines 9-14 : Premiers résultats" (gray-900 border-gray-800 rounded-xl p-5):
  Phase header: "Phase 3" + "Semaines 9-14" + "À venir"
  
  3 milestones

ADD MILESTONE BUTTON (below each phase):
  "+ Ajouter un jalon" border-dashed border-gray-700 text-gray-500 rounded-lg px-4 py-2 text-sm full-width

KEY DELIVERABLES (gray-900 border-gray-800 rounded-xl p-5 margin-top 16px):
  Title "Livrables clés à J+100" white font-semibold
  
  3 deliverable cards (grid 3 cols):
  - "Rapport de traction" white text-sm + "J+90" deadline gray-500 text-xs
  - "Première revue investisseur" + "J+100"
  - "Rapport financier Q1" + "J+90"

DESIGN SYSTEM:
- Dark theme
- Phase color coding: Phase 1 blue (active), Phase 2-3 gray (upcoming)
- Milestone states: completed (green check, strikethrough), in-progress (blue circle), upcoming (empty)
- Progress bar with "Aujourd'hui" marker
- French language
```
