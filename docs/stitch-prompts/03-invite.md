# Stitch Prompt — Page d'invitation (Invite)

**Page :** `/invite/[token]`
**Mode Stitch :** Web
**Type :** Publique

---

## Prompt

```
Dark-themed invitation acceptance page for "Veille Élite", a private investment committee platform. User arrives via unique invite link sent by email/WhatsApp.

LAYOUT:
- Full viewport height, dark gray-950 background
- Centered card, max-width 480px
- No sidebar, no header

INVITE CARD (gray-900 bg, border-gray-800, rounded-2xl, padding 40px):
- Top: Square badge "V" in blue-600, white bold, 48×48px, centered
- Title "Vous êtes invité !" in white text-2xl font-bold, centered
- Subtitle "Rejoignez la plateforme Veille Élite" in gray-400 text-sm, centered

INVITATION DETAILS SECTION (gray-800 bg, rounded-xl, padding 20px, margin-top 24px):
  - Row: Label "Email" in gray-500 text-xs + Value "amine@example.com" in white text-sm right-aligned
  - Divider line border-gray-700
  - Row: Label "Rôle attribué" in gray-500 text-xs + Badge "Évaluateur" in blue-600/20 text-blue-400 rounded-full px-2.5 py-0.5 text-xs right-aligned
  - Divider line border-gray-700
  - Row: Label "Expiration" in gray-500 text-xs + Value "Dans 5 jours" in green-400 text-sm right-aligned (yellow if < 2 days)

CALL TO ACTION (margin-top 28px):
- Primary button "Rejoindre avec Google" full-width:
  - bg-blue-600, hover:bg-blue-500, text-white, rounded-xl, height 48px
  - Google "G" icon left + text font-medium
- Secondary link "J'ai déjà un compte → Se connecter" in blue-400 text-sm, centered, margin-top 12px

FOOTER NOTE:
- Text "Ce lien est à usage unique et ne peut être utilisé qu'une seule fois."
- gray-500 text-xs, centered, margin-top 20px

EXPIRED STATE (alternative):
- Replace card content with: ⏰ icon large + "Invitation expirée" title + "Ce lien n'est plus valide." + button "Retour à la connexion"

DESIGN SYSTEM:
- Dark theme, no light backgrounds
- French language
- Rounded corners everywhere, subtle borders
```
