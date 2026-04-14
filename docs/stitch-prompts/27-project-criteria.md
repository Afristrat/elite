# Stitch Prompt — Critères d'évaluation du projet

**Page :** `/projects/[id]/criteria`
**Mode Stitch :** Web
**Type :** Admin uniquement

---

## Prompt

```
Dark-themed evaluation criteria configuration page for "Veille Élite" investment committee. Admin tool to customize evaluation criteria weights per project.

GLOBAL LAYOUT:
- Left sidebar 240px gray-900
- Main content: gray-950, padding 32px
- Project tabs visible, "Criteria" tab active (admin-only analytics tab)

HEADER:
- Tab navigation, "Criteria" tab active
- Title "Critères d'évaluation" white text-xl font-bold + "Configuration par projet" gray-400 text-sm

SOURCE TOGGLE (gray-900 border-gray-800 rounded-xl p-4 margin-top 24px):
  "Source des critères" white font-semibold text-sm
  
  2 radio options:
  - "Critères par défaut (globaux)" — selected: border-blue-500 bg-blue-600/10 text-blue-300 rounded-lg px-4 py-3
    Description: "Utilise les critères définis dans les paramètres globaux AHP" gray-400 text-xs
  - "Critères spécifiques à ce projet" — border-gray-700 text-gray-400 rounded-lg px-4 py-3
    Description: "Personnalisez les critères et leurs poids pour ce projet uniquement" gray-400 text-xs

  Button "Copier les critères globaux comme base" bg-gray-800 text-gray-300 rounded-lg px-4 py-2 text-sm margin-top 12px (visible if "spécifique" selected)

CRITERIA TABLE (gray-900 border-gray-800 rounded-xl overflow-hidden margin-top 16px):
  Header: "5 critères d'évaluation" white font-semibold px-5 py-4 border-b border-gray-800
  Note: "Total des poids : 100% ✓" green-400 text-xs right of header

  TABLE:
  Columns: Ordre | Critère | Description | Poids | Actions
  Column headers: gray-500 text-xs uppercase px-5 py-3 border-b border-gray-800

  ROW 1:
  - Drag handle ⠿ gray-600 + order "1" gray-400 text-sm
  - Criterion name: Input editable "Impact marché" bg-transparent border-b border-gray-700 text-white text-sm px-2 py-1
  - Description: Input "Taille du marché adressable et potentiel de croissance" gray-400 text-xs
  - Weight: Input number "30" bg-gray-800 border-gray-700 rounded px-2 py-1 text-white w-16 + "%" gray-500 text-xs
  - Actions: delete trash icon gray-600 hover:red-400

  ROWS 2-5: Similar (25%, 20%, 15%, 10%)

  ADD ROW button: "+ Ajouter un critère" border-dashed border-gray-700 text-gray-500 text-sm rounded-lg px-4 py-3 w-full margin-top 8px hover:border-gray-500 hover:text-gray-300

WEIGHT VISUALIZATION (gray-900 border-gray-800 rounded-xl p-5 margin-top 16px):
  Title "Répartition des poids" white font-semibold
  
  Horizontal stacked bar (full-width h-6 rounded-full overflow-hidden):
  - "Impact marché" blue-500 30% width
  - "Solidité équipe" purple-500 25%
  - "Modèle financier" green-500 20%
  - "Différenciation" yellow-500 15%
  - "Alignement" orange-500 10%
  
  Legend below: 5 colored dots with labels

SAVE AREA (margin-top 24px, flex justify-end gap-3):
  "Annuler" gray border button
  "Enregistrer les critères" bg-blue-600 text-white rounded-lg px-5 py-2.5

DESIGN SYSTEM:
- Dark theme
- Inline editable table (inputs look like text, editable on focus)
- Drag-and-drop order handles
- Weight total validation: green if 100%, red if not
- Stacked bar weight visualization
- French language
```
