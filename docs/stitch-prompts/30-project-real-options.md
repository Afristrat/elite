# Stitch Prompt — Real Options (décision différée)

**Page :** `/projects/[id]/real-options`
**Mode Stitch :** Web
**Type :** Admin (décision différée uniquement)

---

## Prompt

```
Dark-themed real options management page for "Veille Élite" investment committee. Shown when a project was deferred — tracks the conditions under which the decision should be revisited.

GLOBAL LAYOUT:
- Left sidebar 240px gray-900
- Main content: gray-950, padding 32px
- Project tabs visible, "Real Options" active

STATUS BANNER (full-width, margin-top 0):
  bg-yellow-950/20 border border-yellow-900/50 rounded-xl p-4
  "⏸ Décision différée — Ce projet est en attente de conditions spécifiques"
  yellow-400 text-sm + "Décidé le 14 mars 2026 par Amine Soufi" gray-500 text-xs margin-top 4px

HEADER:
- Title "Real Option — Décision différée" white text-xl font-bold + "Cadrage RCF (Research, Clarify, Flex)" gray-400 text-sm

ORIGINAL DECISION RATIONALE (gray-900 border-gray-800 rounded-xl p-5 margin-top 24px):
  Title "Justification du report" white font-semibold + quote mark icon yellow-400
  
  Quote block: border-l-4 border-yellow-500 pl-4
  "Le modèle financier présente des hypothèses de croissance trop optimistes. Nous différons à une date de revue en attendant les premiers indicateurs de traction réels (ARR > €50K)."
  gray-300 text-sm italic leading-relaxed

CONDITIONS PANEL (gray-900 border-gray-800 rounded-xl p-6 margin-top 16px):
  Title "Conditions de réouverture" white font-semibold

  TRIGGER CONDITION (bg-blue-950/20 border border-blue-900/50 rounded-xl p-4 margin-top 12px):
  - Label "🎯 Déclencheur" blue-400 text-xs font-semibold uppercase
  - Content: "ARR mensuel récurrent > €50 000 confirmé sur 3 mois consécutifs" white text-sm

  DECISION DATE (bg-gray-800 rounded-xl p-4 margin-top 8px):
  - Label "📅 Date de revue" gray-400 text-xs font-semibold uppercase
  - Content: "15 juin 2026 (dans 63 jours)" white text-sm + countdown "J-63" yellow-400 font-mono text-sm ml-2

  INFORMATION VALUE (bg-purple-950/20 border border-purple-900/50 rounded-xl p-4 margin-top 8px):
  - Label "💡 Valeur de l'information" purple-400 text-xs font-semibold uppercase
  - Content: "Traction réelle + données de conversion + feedback 20 early adopters" white text-sm

STATUS TRACKER (gray-900 border-gray-800 rounded-xl p-5 margin-top 16px):
  Title "Suivi du déclencheur" white font-semibold

  CONDITION PROGRESS:
  "ARR actuel : €32 000 / €50 000 requis" blue-400 text-sm font-mono
  Progress bar: h-3 bg-gray-800 rounded-full, fill bg-blue-500 at 64%
  Label: "64%" blue-400 text-xs text-right

  STATUS UPDATES (timeline list):
  - "14 avr. 2026 — ARR : €32K (+€8K ce mois)" blue dot + gray-300 text-xs
  - "1 avr. 2026 — ARR : €24K" gray dot + gray-500 text-xs
  - "14 mars 2026 — Décision de report" yellow dot + gray-500 text-xs

ACTIONS (margin-top 24px, flex gap-3 justify-end):
  "Modifier les conditions" border border-gray-700 text-gray-300 rounded-lg px-4 py-2 text-sm
  "Rouvrir pour décision maintenant" bg-yellow-600 text-white rounded-lg px-4 py-2.5 text-sm font-medium (if conditions met: bg-green-600)

DESIGN SYSTEM:
- Dark theme
- Yellow accent throughout (deferred/pending status)
- Progress tracker with live updates
- RCF framework: Research (blue), Clarify (purple), Flex (green)
- French language
```
