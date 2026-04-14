# Stitch Prompt — Journal des décisions

**Page :** `/decisions`
**Mode Stitch :** Web
**Type :** Tous les utilisateurs

---

## Prompt

```
Dark-themed immutable decision journal page for "Veille Élite" investment committee. Shows all past investment decisions with full context.

GLOBAL LAYOUT:
- Left sidebar 240px gray-900, active item "Décisions"
- Main content: gray-950, padding 32px

HEADER:
- Title "Journal des décisions immuables" white text-2xl font-bold
- Subtitle "Toutes les décisions du comité, dans l'ordre chronologique" gray-400 text-sm
- Count badge "(12 décisions)" gray-600 inline

DECISIONS LIST (margin-top 24px, space-y-4):

DECISION CARD 1 — Approuvé:
- bg-gray-900 border border-gray-800 rounded-xl p-5
- TOP ROW (flex, justify-between, items-start):
  Left badges: "✓ Approuvé" (green-900/50 border-green-800 text-green-400 rounded-full px-3 py-1 text-sm font-semibold) + "H2" (gray pill) + "Growth" (purple pill)
  Right: date "14 mars 2026" gray-500 text-xs
- Title "Marketplace SaaS B2B pour le secteur agricole" white font-semibold text-base, margin-top 10px, link → project detail
- META ROW: "AgriTech · MOIC cible : 4.2× · Décidé par Amine Soufi" gray-500 text-xs
- RATIONALE: "Positionnement unique sur un marché de 2.4Md€ sous-digitalisé. L'équipe fondatrice dispose d'une expertise sectorielle différenciante. Les hypothèses de croissance sont conservatrices et les scénarios de sortie crédibles." gray-300 text-sm leading-relaxed line-clamp-3
- FOOTER ROW (border-t border-gray-800 pt-3 margin-top 12px, flex justify-between):
  Left: link "🔗 Voir le repo GitHub" blue-400 text-xs
  Right: link "Voir les résultats →" gray-400 text-xs hover:text-white

DECISION CARD 2 — Rejeté:
- Same structure
- Badge "✗ Rejeté" red-900/50 border-red-800 text-red-400
- No repo link
- Different rationale text

DECISION CARD 3 — Différé (Real Option):
- Badge "⏸ Différé" yellow-900/50 border-yellow-800 text-yellow-400
- Extra badge "Real Option" blue-800 text-blue-300 text-xs rounded (if real_option_data)

DECISION CARD 4, 5... (continue pattern)

EMPTY STATE:
- Centered in main area: icon "📋" + "Aucune décision enregistrée pour l'instant" gray-400 text-sm

DESIGN SYSTEM:
- Dark theme
- Decision badges: green (approved), red (rejected), yellow (deferred)
- Card is read-only, immutable — no edit actions
- Rationale text line-clamp-3 with "lire la suite →" if truncated
- French language
```
