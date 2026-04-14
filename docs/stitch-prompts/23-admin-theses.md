# Stitch Prompt — Admin — Thèses macro du portefeuille

**Page :** `/admin/theses`
**Mode Stitch :** Web
**Type :** Admin uniquement

---

## Prompt

```
Dark-themed portfolio macro theses management admin page for "Veille Élite" investment committee. Strategic conviction library that projects are aligned against.

GLOBAL LAYOUT:
- Left sidebar 240px gray-900, "Administration" section, "Thèses" active
- Main content: gray-950, padding 32px

HEADER:
- Title "Thèses macro du portefeuille" white text-2xl font-bold
- Subtitle "Convictions stratégiques collectives guidant les décisions d'investissement" gray-400 text-sm

CREATE THESIS CARD (gray-900 border-gray-800 rounded-xl p-5 margin-top 24px):
  Title "Créer une nouvelle thèse" white font-semibold

  FIELD "Titre de la thèse" *:
  - Input bg-gray-800 border-gray-700 rounded-lg px-4 py-2.5 text-white w-full
  - Placeholder "Ex: La digitalisation de l'agriculture africaine est inévitable"

  FIELD "Description" *:
  - Textarea bg-gray-800 border-gray-700 rounded-lg px-4 py-3 text-white w-full h-24
  - Placeholder "Décrivez la conviction, les mécanismes et le contexte macro"

  FIELD "Horizon" *:
  - 3 radio option cards (same row):
    "H1 Court terme (< 1 an)" | "H2 Moyen terme (1-3 ans)" | "H3 Long terme (> 3 ans)"
    Active: border-blue-500 bg-blue-600/10 text-blue-300
    Inactive: border-gray-700 text-gray-400

  Submit: "Créer la thèse" bg-blue-600 text-white rounded-lg px-4 py-2.5 font-medium full-width margin-top 8px

THESES LIST (margin-top 24px, space-y-4):
  Header: "Thèses actives (4)" white font-semibold + "Inactives (2)" gray-500 text-sm (tab)

  THESIS CARD 1 — Active:
  - bg-gray-900 border border-gray-800 rounded-xl p-5
  - TOP ROW: Badge "H2" gray-800 font-mono text-xs + Badge "Active" green-600/20 text-green-400 rounded-full text-xs + toggle switch ON right
  - Title "La digitalisation de l'agriculture africaine est inévitable" white font-semibold text-base
  - Description: "2.4 milliards d'agriculteurs sous-équipés en Afrique subsaharienne et Maghreb représentent un marché sous-digitalisé de premier ordre. Les solutions AgriTech locales ont un avantage compétitif structurel…" gray-300 text-sm leading-relaxed line-clamp-2
  - Footer: "Créée le 1 jan. 2026" gray-500 text-xs + "Utilisée par 3 projets" blue-400 text-xs
  - Actions (top-right icons): edit pencil gray-600 hover:white | delete trash gray-600 hover:red-400

  THESIS CARD 2 — Active, H3:
  - Badge "H3" + "Active"
  - Title "L'énergie solaire décentralisée est la seule solution scalable pour l'Afrique"
  - "Utilisée par 1 projet"

  THESIS CARD 3 — Active, H1:
  - Badge "H1"
  - Title "La réglementation fintech africaine s'assouplit — fenêtre d'opportunité 18 mois"

  THESIS CARD 4 — INACTIVE (dimmed):
  - bg-gray-900/50 border border-gray-800/50 (dimmed)
  - Badge "H2" + "Inactive" gray-600 badge
  - Toggle OFF (gray)
  - Title dimmed gray-400
  - "Non utilisée" gray-500 text-xs

EDIT MODAL (overlay when pencil clicked):
  - Modal: gray-900 rounded-2xl p-6 border-gray-800 max-w-lg
  - Title "Modifier la thèse"
  - Same fields as create form, pre-filled
  - Buttons: "Annuler" gray | "Enregistrer" blue-600

DESIGN SYSTEM:
- Dark theme
- Active theses vibrant, inactive theses dimmed/low opacity
- Toggle switch to activate/deactivate directly on card
- French language
```
