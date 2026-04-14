# Stitch Prompt — Admin — Paramètres globaux de la plateforme

**Page :** `/admin/settings`
**Mode Stitch :** Web
**Type :** Admin uniquement

---

## Prompt

```
Dark-themed global platform settings admin page for "Veille Élite" investment committee. Configuration panel for platform-wide settings.

GLOBAL LAYOUT:
- Left sidebar 240px gray-900, "Administration" section, "Paramètres" active
- Main content: gray-950, padding 32px

HEADER:
- Title "Paramètres globaux" white text-2xl font-bold
- Subtitle "Configuration de la plateforme Veille Élite" gray-400 text-sm
- Badge "⚠️ Modifications appliquées à tous les membres" yellow-400 bg-yellow-950/20 border-yellow-900/50 rounded-lg px-3 py-1.5 text-xs margin-top 8px

GENERAL SETTINGS CARD (gray-900 border-gray-800 rounded-xl p-6 margin-top 24px):
  Title "Général" white font-semibold

  FIELD "Nom de la plateforme":
  - Label gray-500 text-xs uppercase
  - Input: "Veille Élite" — bg-gray-800 border-gray-700 rounded-lg px-4 py-2.5 text-white w-full

  FIELD "Membres maximum":
  - Input number: "12" — bg-gray-800 border-gray-700 rounded-lg px-4 py-2.5 text-white w-32
  - Note: "Nombre maximum de membres actifs simultanément" gray-500 text-xs margin-top 4px

EVALUATION SETTINGS CARD (gray-900 border-gray-800 rounded-xl p-6 margin-top 16px):
  Title "Évaluation" white font-semibold

  2-column grid:
  FIELD "Quorum par défaut":
  - Input number "5" bg-gray-800 border-gray-700 rounded-lg px-4 py-2.5 text-white
  - Note: "Nombre d'évaluateurs requis" gray-500 text-xs

  FIELD "Type de quorum":
  - Select: "Absolu (nb fixe)" — bg-gray-800 border-gray-700 rounded-lg
  - Options: Absolu (nb fixe) | Pourcentage des membres actifs

  FIELD "Délai d'évaluation (jours)":
  - Input number "14" bg-gray-800
  - Note: "Deadline par défaut après soumission d'un projet" gray-500 text-xs

GOVERNANCE SETTINGS CARD (gray-900 border-gray-800 rounded-xl p-6 margin-top 16px):
  Title "Gouvernance" white font-semibold

  TOGGLE ROW — "Pré-mortem activé":
  - Label + description "Étape collective pré-mortem avant ouverture des évaluations" gray-500 text-xs
  - Toggle: ON (blue-600)

  FIELD "Vitesse de gouvernance" — version V1:
  - Select: "Standard (5 évaluateurs requis)" bg-gray-800
  - Options: Légère (3 requis) | Standard (5 requis) | Renforcée (7 requis)

DANGER ZONE CARD (bg-red-950/10 border border-red-900/30 rounded-xl p-6 margin-top 24px):
  Title "Zone dangereuse" red-400 font-semibold
  
  Action: "Réinitialiser les statistiques analytics" 
  - Description "Supprime toutes les données PROMETHEE et recalcule à partir de zéro" gray-500 text-xs
  - Button: "Réinitialiser" border border-red-800 text-red-400 rounded-lg px-4 py-2 text-sm

SAVE BUTTON AREA (margin-top 24px, flex justify-between items-center):
  Left: "Modifications non sauvegardées" yellow-400 text-xs (if dirty state)
  Right: "Enregistrer les modifications" bg-blue-600 text-white rounded-lg px-5 py-2.5 font-medium

DESIGN SYSTEM:
- Dark theme, form layout
- Danger zone has distinct red accent
- Warning banner at top emphasizes impact
- Toggle switches consistent with other settings pages
- French language
```
