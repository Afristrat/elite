# Stitch Prompt — Formulaire d'évaluation d'un projet

**Page :** `/projects/[id]/evaluate`
**Mode Stitch :** Web
**Type :** Évaluateur / Admin

---

## Prompt

```
Dark-themed project evaluation form for "Veille Élite" investment committee. Anonymous scoring of investment projects using weighted criteria.

GLOBAL LAYOUT:
- Left sidebar 240px gray-900
- Main content: gray-950, padding 32px

HEADER:
- Breadcrumb "← Marketplace SaaS B2B…" blue-400 text-sm
- Title "Évaluer ce projet" white text-xl font-bold
- Notice banner: bg-blue-950/30 border border-blue-900/50 rounded-lg px-4 py-3 margin-top 16px
  "🔒 Votre évaluation est anonyme jusqu'à l'atteinte du quorum (5 évaluateurs requis)"
  blue-300 text-sm

EVALUATION CRITERIA SECTION (gray-900 border-gray-800 rounded-xl p-6 margin-top 24px):
  Title "Critères d'évaluation" white font-semibold + subtitle "5 critères pondérés selon l'AHP" gray-400 text-xs

  CRITERION 1 — "Impact marché" (weight: 30%):
  - Label row: "Impact marché" white text-sm font-medium + badge "30%" gray-600 text-xs rounded-full
  - Description: "Taille du marché adressable et potentiel de croissance" gray-500 text-xs italic
  - Score row: label "Score" gray-500 xs left + value "7" blue-400 text-2xl font-bold right
  - Score slider: h-2 bg-gray-800 rounded-full, fill bg-blue-500 at 70%
  - Under slider: "0" left + "10" right gray-600 text-xs
  - Number input: bg-gray-800 border-gray-700 rounded-lg w-16 text-center text-white

  CRITERION 2 — "Solidité de l'équipe" (weight: 25%):
  - Same structure, score "8", fill green-500 at 80%

  CRITERION 3 — "Modèle financier" (weight: 20%):
  - Score "5", fill yellow-500 at 50%

  CRITERION 4 — "Différenciation" (weight: 15%):
  - Score "6", fill blue-500 at 60%

  CRITERION 5 — "Alignement stratégique" (weight: 10%):
  - Score "9", fill green-500 at 90%

  Divider border-gray-800 margin-top 24px

  WEIGHTED SCORE PREVIEW: "Score pondéré estimé: 7.05 / 10" blue-400 text-lg font-bold text-right

RED TEAM SECTION (bg-red-950/20 border border-red-900/40 rounded-xl p-6 margin-top 16px):
  Title "🔴 Red Team — L'avocat du diable" red-400 font-semibold
  Subtitle "Section obligatoire. Ces données sont agrégées et présentées anonymement." gray-500 text-xs

  Field "Meilleur argument contre" *:
  - Label red-300 text-xs uppercase
  - Textarea bg-gray-900 border-gray-700 rounded-lg p-3 text-white text-sm h-24 w-full
  - Placeholder "Quel est le risque principal que les autres pourraient ignorer ?"

  Field "Angles morts potentiels":
  - Same textarea structure

  Field "Conditions pour que ça marche":
  - Same textarea structure

SUBMIT AREA (margin-top 24px, flex justify-between items-center):
- Left: "* Champs obligatoires" gray-500 text-xs
- Right: button "Soumettre mon évaluation" bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-6 py-3 font-medium

DESIGN SYSTEM:
- Dark theme
- Red team section has distinct red accent background
- Slider colors indicate score level (red < 5, yellow 5-7, green > 7)
- French language throughout
```
