# Stitch Prompt — Paramètres Clés API

**Page :** `/settings/api-keys`
**Mode Stitch :** Web
**Type :** Tous les utilisateurs

---

## Prompt

```
Dark-themed API keys management settings page for "Veille Élite" platform. Users manage their personal AI provider keys for platform integrations.

GLOBAL LAYOUT:
- Left sidebar 240px gray-900, "Paramètres" section active at bottom
- Main content: gray-950, padding 32px

HEADER:
- Title "Clés API" white text-2xl font-bold
- Subtitle "Gérez vos clés pour les intégrations IA (Kimi, Anthropic, Perplexity…)" gray-400 text-sm

ADD NEW KEY CARD (gray-900 border-gray-800 rounded-xl p-5 margin-top 24px):
  Title "Ajouter une clé" white font-semibold text-sm

  FORM (space-y-4):
  Row 1 — 2 columns:
    Field "Fournisseur" * :
    - Label gray-500 text-xs uppercase
    - Select: bg-gray-800 border-gray-700 rounded-lg px-3 py-2.5 text-white w-full
    - Options: Kimi (Moonshot), Anthropic, OpenAI, Perplexity, Custom

    Field "Label (optionnel)":
    - Input bg-gray-800 border-gray-700 rounded-lg px-3 py-2.5 text-white w-full
    - Placeholder "Ex: Clé projet Agritech"

  Row 2:
    Field "Clé API" *:
    - Input type="password" full-width bg-gray-800 border-gray-700 rounded-lg px-3 py-2.5
    - Placeholder "sk-..."
    - Eye icon button on right to toggle visibility
    - Security note: "🔒 Chiffrée avant stockage — seuls les 8 premiers caractères sont conservés" gray-500 text-xs margin-top 4px

  Submit button: "Ajouter la clé" bg-blue-600 text-white rounded-lg px-4 py-2 text-sm full-width margin-top 8px

EXISTING KEYS LIST (gray-900 border-gray-800 rounded-xl overflow-hidden margin-top 16px):
  Header: "Mes clés enregistrées" white font-semibold px-5 py-4 border-b border-gray-800 + badge "(3)" gray-600

  KEY ROW 1:
  - Provider badge "Kimi" blue-600/20 text-blue-400 rounded-full px-2 py-0.5 text-xs
  - Label "Clé principale" white text-sm
  - Key preview "mk-****...****xyz3" gray-500 font-mono text-xs
  - Last used "Utilisée il y a 2h" gray-500 text-xs
  - Delete button: trash icon gray-600 hover:text-red-400
  Row: border-b border-gray-800 px-5 py-4 flex items-center gap-4

  KEY ROW 2:
  - Provider "Anthropic" purple-600/20 text-purple-400
  - Label "Research"
  - Key "sk-****...****8mn2" gray-500 font-mono text-xs
  - Last used "il y a 3 jours"

  KEY ROW 3:
  - Provider "Perplexity" green-600/20 text-green-400
  - No label (shows "-")
  - Last used "Jamais utilisée"

EMPTY STATE (if no keys):
  "Aucune clé API enregistrée. Ajoutez votre première clé ci-dessus." gray-500 text-sm text-center py-8

DESIGN SYSTEM:
- Dark theme
- Password fields with toggle visibility
- Provider color-coding: Kimi=blue, Anthropic=purple, OpenAI=green, Perplexity=teal
- Security-focused: never shows full key
- French language
```
