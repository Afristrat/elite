# Stitch Prompt — Pré-mortem collectif

**Page :** `/projects/[id]/pre-mortem`
**Mode Stitch :** Web
**Type :** Tous les utilisateurs (phase pré-mortem)

---

## Prompt

```
Dark-themed pre-mortem collective exercise page for "Veille Élite" investment committee. Anonymous collective failure scenario identification before project evaluation opens.

GLOBAL LAYOUT:
- Left sidebar 240px gray-900
- Main content: gray-950, padding 32px
- Project tabs visible (pre-mortem tab active, marked with "Nouveau" badge)

PHASE INDICATOR (top of main, margin-top 0):
  Banner: bg-purple-950/30 border border-purple-900/50 rounded-xl p-4
  "🧠 Phase de pré-mortem active — Cette étape se termine dans 48h"
  purple-300 text-sm + countdown "48:00:00" purple-400 font-mono font-bold

EXPLANATION CARD (gray-900 border-gray-800 rounded-xl p-5 margin-top 16px):
  Title "Qu'est-ce que le pré-mortem ?" white font-semibold text-sm
  Text: "Imaginez que nous sommes 2 ans dans le futur et ce projet a complètement échoué. Identifiez les causes les plus probables de cet échec, avant même d'évaluer le projet." gray-400 text-sm leading-relaxed
  Quote: "— Gary Klein, Performing a Project Pre-Mortem (2007)" gray-600 text-xs italic

MY CONTRIBUTION FORM (bg-red-950/10 border border-red-900/30 rounded-xl p-6 margin-top 16px):
  Title "Mon scénario d'échec" red-300 font-semibold + "🔴" icon

  FIELD "Scénario principal d'échec" *:
  - Label "Décrivez comment et pourquoi ce projet échouerait" gray-500 text-xs uppercase
  - Textarea bg-gray-900 border-gray-700 rounded-lg p-3 text-white h-28 w-full
  - Placeholder "Dans 2 ans, ce projet a échoué parce que…"

  FIELD "Facteur de risque le plus sous-estimé":
  - Textarea h-20

  FIELD "Signal d'alarme précoce à surveiller":
  - Input single-line bg-gray-900 border-gray-700 rounded-lg px-4 py-2.5 text-white w-full
  - Placeholder "Quel indicateur signalerait l'échec en premier ?"

  PROBABILITY SLIDER "Probabilité d'échec selon vous":
  - Label "35%" red-400 font-mono text-xl font-bold
  - Slider: h-2 bg-gray-800 rounded-full, fill bg-red-500 at 35%
  - Labels: "0% (certain succès)" left | "100% (échec inévitable)" right — gray-500 text-xs

  Submit: "Soumettre mon pré-mortem" bg-red-700 hover:bg-red-600 text-white rounded-lg px-5 py-2.5 full-width margin-top 16px

AGGREGATE (visible after submission or to admin):
  Title "Synthèse pré-mortem (4 contributions)" white font-semibold
  
  PROBABILITY GAUGE:
  - "Probabilité d'échec moyenne : 42%" red-400 text-2xl font-bold font-mono
  - Gauge bar: gradient red-500/30 → red-500 at 42%

  TOP RISKS LIST:
  - 3-4 aggregated risk themes, each as gray-900 rounded-lg p-3 with bullet

  SIGNALS IDENTIFIÉS: list of early warning indicators

DESIGN SYSTEM:
- Dark theme with red accent throughout (danger/risk theme)
- Pre-mortem phase uses red-tinted backgrounds
- Probability slider in red
- Fully anonymous contributions
- French language
```
