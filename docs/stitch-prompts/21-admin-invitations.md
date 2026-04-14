# Stitch Prompt — Admin — Gestion des invitations

**Page :** `/admin/invitations`
**Mode Stitch :** Web
**Type :** Admin uniquement

---

## Prompt

```
Dark-themed invitation management admin page for "Veille Élite" platform. Shows all pending, accepted, and expired invitations with management actions.

GLOBAL LAYOUT:
- Left sidebar 240px gray-900, "Administration" section, "Invitations" active
- Main content: gray-950, padding 32px

HEADER:
- Title "Invitations" white text-2xl font-bold
- Subtitle "Suivi de toutes les invitations envoyées" gray-400 text-sm

STATS ROW (3 cards, margin-top 24px):
- "En attente" — "4" yellow-400 text-2xl font-bold — border-yellow-900/50
- "Acceptées" — "8" green-400 text-2xl font-bold — border-green-900/50
- "Expirées" — "2" gray-500 text-2xl font-bold — border-gray-800
Each: bg-gray-900 rounded-xl p-4

INVITATIONS TABLE (gray-900 border-gray-800 rounded-xl overflow-hidden margin-top 16px):
  Header row: filter pills "Toutes" (active) | "En attente" | "Acceptées" | "Expirées" — px-5 py-4 border-b border-gray-800

  TABLE (w-full):
  Columns: Email | Rôle | Statut | Invité par | Expire le | Actions
  Column headers: text-xs text-gray-500 uppercase px-5 py-3 border-b border-gray-800

  ROW 1 — Pending:
  - "karim.alaoui@email.com" white text-sm
  - Role "Évaluateur" green-600/20 text-green-400 rounded-full px-2 py-0.5 text-xs
  - Status: yellow dot + "En attente" yellow-400 text-xs
  - Invited by: "Amine S." gray-400 text-xs
  - Expiry: "Dans 5 jours" green-400 text-xs
  - Actions: copy link icon (gray-600) | resend icon (WhatsApp green) | revoke icon (red X)

  ROW 2 — Pending (urgent):
  - "sara.idrissi@company.ma" white
  - "Admin" blue badge
  - Status: "En attente" yellow
  - Expiry: "Dans 1 jour" red-400 text-xs (urgent color)
  - Same actions

  ROW 3 — Accepted:
  - "mounia.benali@email.com" gray-400 text-sm
  - "Contributeur" gray badge
  - Status: green dot + "Acceptée" green-400 text-xs
  - Invited by: "Amine S."
  - Expiry: "Acceptée le 10 mars" gray-500 text-xs
  - Actions: no actions (read-only) — just "—"

  ROW 4 — Expired:
  - "old.email@example.com" gray-500 text-sm (dimmed)
  - "Évaluateur" gray dimmed badge
  - Status: gray dot + "Expirée" gray-500 text-xs
  - Expiry: "Expirée le 1 mars" gray-500 text-xs
  - Actions: resend icon only (renvoi possible)

RESEND CONFIRMATION (inline tooltip/popover on resend click):
  Small popover: "Renvoyer par : 📧 Email | 📱 WhatsApp | Les deux"
  3 small buttons gray-800 border-gray-700 rounded px-2 py-1 text-xs

DESIGN SYSTEM:
- Dark theme, table-heavy
- Status colors: pending=yellow, accepted=green, expired=gray
- Expiry urgency: < 2 days = red-400
- Action icons on hover
- French language
```
