# Stitch Prompt — AAR (After Action Review)

**Page :** `/projects/[id]/aar`
**Mode Stitch :** Web
**Type :** Tous les utilisateurs (post-décision)

---

## Prompt

```
Dark-themed After Action Review (AAR) page for "Veille Élite" investment committee. Collective post-decision learning tool embedded in each project.

GLOBAL LAYOUT:
- Left sidebar 240px gray-900
- Main content: gray-950, padding 32px
- Project tabs visible at top (AAR tab active)

HEADER:
- Project title breadcrumb "← Marketplace SaaS B2B Agritech"
- Tab navigation with "AAR" active (blue underline)
- Title "After Action Review" white text-xl font-bold + "Analyse post-décision collective" gray-400 text-sm

MY CONTRIBUTION FORM (gray-900 border-gray-800 rounded-xl p-6 margin-top 24px):
  Title "Ma contribution" white font-semibold + "Votre réponse est anonyme" gray-500 text-xs badge

  QUESTION 1 "Qu'est-ce qui s'est bien passé ?" (border-b border-gray-800 pb-5):
  - Label green-400 text-sm font-medium + "✓" icon
  - Textarea bg-gray-800 border-gray-700 rounded-lg p-3 text-white h-20 w-full
  - Placeholder "Ce qui a fonctionné dans le processus d'évaluation…"

  QUESTION 2 "Qu'est-ce qui aurait pu être amélioré ?" (border-b border-gray-800 py-5):
  - Label yellow-400 text-sm font-medium + "⚡" icon
  - Textarea same styling

  QUESTION 3 "Qu'avez-vous appris de ce projet ?" (border-b border-gray-800 py-5):
  - Label blue-400 text-sm font-medium + "💡" icon
  - Textarea

  QUESTION 4 "Que ferions-nous différemment ?" (pt-5):
  - Label purple-400 text-sm font-medium + "🔄" icon
  - Textarea

  Submit button: "Soumettre mon AAR" bg-blue-600 text-white rounded-lg px-5 py-2.5 full-width margin-top 16px

AGGREGATED RESPONSES (gray-900 border-gray-800 rounded-xl p-6 margin-top 16px):
  Title "Synthèse collective" white font-semibold + badge "5 contributions" gray-600 text-xs

  SECTION "✓ Ce qui a bien fonctionné" (border-b border-gray-800 pb-4 mb-4):
  - green-400 text-sm font-medium label
  - 3-4 bullet points gray-300 text-sm leading-relaxed (anonymized aggregate)

  SECTION "⚡ Points d'amélioration":
  - yellow-400 label
  - bullet points

  SECTION "💡 Apprentissages":
  - blue-400 label
  - bullet points

  SECTION "🔄 Ce que nous ferions différemment":
  - purple-400 label
  - bullet points

ALREADY SUBMITTED STATE (if user already contributed):
  - Form replaced by: "✓ Vous avez déjà soumis votre contribution" green-400 text-sm + date gray-500 text-xs
  - Show aggregate only

DESIGN SYSTEM:
- Dark theme
- Color-coded questions: green/yellow/blue/purple
- Anonymous contributions aggregated
- French language
```
