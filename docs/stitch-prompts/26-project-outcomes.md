# Stitch Prompt — Outcomes Harvesting

**Page :** `/projects/[id]/outcomes`
**Mode Stitch :** Web
**Type :** Tous les utilisateurs (post-décision J+90)

---

## Prompt

```
Dark-themed Outcome Harvesting long-term learning page for "Veille Élite" investment committee. Track actual outcomes vs predicted scenarios after investment decisions.

GLOBAL LAYOUT:
- Left sidebar 240px gray-900
- Main content: gray-950, padding 32px
- Project tabs visible, "Outcomes" tab active

HEADER:
- Tab navigation, "Outcomes" active
- Title "Outcome Harvesting" white text-xl font-bold + "Capitalisation sur les résultats réels" gray-400 text-sm

TIMELINE STATUS (gray-900 border-gray-800 rounded-xl p-5 margin-top 24px):
  "Prochains jalons d'observation" white font-semibold
  
  3 milestone dots (horizontal timeline):
  DOT 1 — "J+90" (completed):
    - Green circle dot + label "J+90 — 14 juin 2026" white text-sm
    - Status "✓ Complété" green-400 text-xs
  
  DOT 2 — "J+180" (upcoming):
    - Blue circle outline dot + label "J+180 — 12 sept. 2026"
    - Status "Dans 91 jours" blue-400 text-xs
    - Button "Saisir observation" bg-blue-600 text-white rounded text-xs px-2 py-1
  
  DOT 3 — "J+365" (future):
    - Gray circle dot + label "J+365 — 14 mars 2027"
    - Status "Dans 276 jours" gray-500 text-xs

SCENARIOS VS REALITY (gray-900 border-gray-800 rounded-xl p-5 margin-top 16px):
  Title "Scénarios prévus vs réalité observée" white font-semibold

  3 scenario comparison rows:
  ROW "Pessimiste (15%)":
  - Left: scenario description + MOIC "1.5×" red-400
  - Right: actual "Non atteint" badge gray
  
  ROW "Réaliste (60%)":
  - Left: scenario + MOIC "4.2×" yellow-400
  - Right: actual "En cours — tracking positif 🟡" yellow-400 text-sm
  
  ROW "Optimiste (25%)":
  - Left: scenario + MOIC "8.0×" green-400
  - Right: actual "Trop tôt pour évaluer" gray-500

OBSERVATION FORM (gray-900 border-gray-800 rounded-xl p-6 margin-top 16px):
  Title "Saisir une observation — J+180" white font-semibold

  FIELD "Indicateur de performance observé":
  - Textarea bg-gray-800 border-gray-700 rounded-lg p-3 text-white h-20 w-full

  FIELD "MOIC observé (si applicable)":
  - Input number + "×" suffix — bg-gray-800 border-gray-700 rounded-lg px-4 py-2.5 text-white w-40

  FIELD "Hypothèses confirmées ou infirmées":
  - Textarea h-20

  FIELD "Surprises et apprentissages":
  - Textarea h-20

  Submit: "Enregistrer l'observation" bg-blue-600 text-white rounded-lg px-5 py-2.5 full-width

PAST OBSERVATIONS (margin-top 16px, if any):
  Title "Observations passées" white font-semibold
  
  OBSERVATION CARD "J+90 — 14 juin 2026":
  - gray-900 border-gray-800 rounded-xl p-4
  - "Bon traction initiale : 150 agriculteurs onboardés, ARR €45K" gray-300 text-sm
  - "Amine Soufi — 14 juin 2026" gray-500 text-xs

DESIGN SYSTEM:
- Dark theme
- Timeline milestones: green (done), blue (next), gray (future)
- Scenario comparison: actual vs predicted color coding
- French language
```
