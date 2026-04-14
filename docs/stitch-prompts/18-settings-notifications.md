# Stitch Prompt — Préférences de notifications

**Page :** `/settings/notifications`
**Mode Stitch :** Web
**Type :** Tous les utilisateurs

---

## Prompt

```
Dark-themed notification preferences settings page for "Veille Élite" platform. Users configure which notifications they receive via email and WhatsApp.

GLOBAL LAYOUT:
- Left sidebar 240px gray-900
- Main content: gray-950, padding 32px

HEADER:
- Title "Préférences de notifications" white text-2xl font-bold
- Subtitle "Choisissez quand être alerté par email et WhatsApp" gray-400 text-sm

WHATSAPP WARNING BANNER (if no phone number):
  bg-yellow-950/20 border border-yellow-900/50 rounded-xl p-4 margin-top 24px
  ⚠️ "Notifications WhatsApp désactivées — Renseignez votre numéro dans votre profil pour les activer." yellow-400 text-sm
  Link "Mettre à jour le profil →" blue-400 text-sm

NOTIFICATION SETTINGS CARD (gray-900 border-gray-800 rounded-xl p-5 margin-top 24px):
  Title "Événements" white font-semibold

  TOGGLE ROW 1 (border-b border-gray-800 py-4):
  - Icon 📊 + Label "Rappel d'évaluation" white text-sm font-medium
  - Description: "Notifié quand un projet ouvert attend votre évaluation" gray-500 text-xs
  - Toggle switch right: ON state (bg-blue-600 with white circle)

  TOGGLE ROW 2 (border-b border-gray-800 py-4):
  - Icon ✅ + Label "Quorum atteint"
  - Description: "Notifié quand un projet a reçu suffisamment d'évaluations"
  - Toggle: ON (blue)

  TOGGLE ROW 3 (border-b border-gray-800 py-4):
  - Icon 🎯 + Label "Décision enregistrée"
  - Description: "Notifié dès qu'une décision est prise sur un projet"
  - Toggle: ON (blue)

  TOGGLE ROW 4 (py-4, admin only, slightly different styling):
  - Icon 📨 + Label "Nouveau projet soumis"
  - Description: "Notifié quand un membre soumet un nouveau projet (admin uniquement)"
  - Toggle: OFF state (bg-gray-700 with white circle left)
  - Badge "Admin" blue-600/20 text-blue-400 text-xs rounded-full px-2 ml-2 next to label

CHANNELS SECTION (gray-900 border-gray-800 rounded-xl p-5 margin-top 16px):
  Title "Canaux de notification" white font-semibold
  
  2-column row:
  - "Email" icon + label white text-sm + "✓ Actif" green-400 text-xs
  - "WhatsApp" icon + label white text-sm + "✗ Inactif" gray-500 text-xs (if no number)
  Each: border border-gray-700 rounded-lg p-3

SAVE BUTTON (margin-top 24px):
  "Enregistrer les préférences" bg-blue-600 text-white rounded-lg px-5 py-2.5 font-medium

SUCCESS TOAST (floating bottom-right):
  bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 shadow-lg
  "✓ Préférences enregistrées" green-400 text-sm

DESIGN SYSTEM:
- Dark theme
- Toggle switches: blue when ON, gray-700 when OFF
- Row hover: subtle bg-gray-800/30
- French language
```
