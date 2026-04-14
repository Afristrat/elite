# Stitch Prompt — Soumission de projet (formulaire multi-étapes)

**Page :** `/projects/new`
**Mode Stitch :** Web
**Type :** Utilisateur authentifié

---

## Prompt

```
Dark-themed multi-step project submission form for "Veille Élite" investment committee platform. Investment project intake form with 5 steps.

GLOBAL LAYOUT:
- Left sidebar 240px gray-900
- Main content: gray-950, padding 32px
- Breadcrumb top: "← Retour aux projets" blue-400 text-sm

FORM HEADER:
- Title "Soumettre un projet" white text-2xl font-bold
- Subtitle "Renseignez les informations pour une analyse structurée" gray-400 text-sm
- Auto-save indicator top-right: "💾 Sauvegardé il y a 30s" gray-500 text-xs

STEP PROGRESS BAR (below header, margin-top 24px):
- 5 step indicators in a row:
  Step 1 "Identité" — filled blue circle + label (current step)
  Step 2 "Analyse marché" — empty circle gray
  Step 3 "Scénarios" — empty circle gray
  Step 4 "Thèse" — empty circle gray
  Step 5 "Finalisation" — empty circle gray
- Connecting lines between circles (blue for completed, gray for upcoming)

FORM CARD (gray-900 border-gray-800 rounded-xl padding 32px margin-top 24px):

STEP 1 — "Identité du projet" (show this step active):
  - Field "Titre du projet" *:
    - Label gray-500 text-xs uppercase
    - Input: bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white w-full
    - Placeholder "Ex: Marketplace SaaS pour le secteur agricole"
  - 2-column grid below:
    - Field "Secteur" *: Select dropdown gray-800 border-gray-700
      Options: AgriTech, Fintech, CleanTech, HealthTech, EdTech, Autre
    - Field "Horizon d'investissement" *: Radio buttons inline
      H1 (< 1 an) | H2 (1-3 ans) | H3 (> 3 ans)
      Active radio: bg-blue-600/20 border-blue-500 text-blue-300 rounded-lg px-3 py-2
  - Field "Catégorie Barbell" *: 3 option cards
    - "Core" card: gray-800 border rounded-lg p-3 (selected: border-blue-500 bg-blue-600/10)
      Description "Investissement stable, faible risque"
    - "Growth" card: same structure
    - "Moonshot" card: same structure
  - Field "MOIC cible" *: number input + "×" suffix, gray-800

NAVIGATION BUTTONS (bottom of card):
- Left: empty (step 1, no previous)
- Right: "Étape suivante →" bg-blue-600 text-white rounded-lg px-5 py-2.5

DESIGN SYSTEM:
- Dark theme, form-focused layout
- Required fields marked with *
- Input focus: ring-2 ring-blue-500/50
- French language throughout
- Field validation errors: text-red-400 text-xs below field
```
