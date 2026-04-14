# Stitch Prompt — Admin — Gestion des membres

**Page :** `/admin/members`
**Mode Stitch :** Web
**Type :** Admin uniquement

---

## Prompt

```
Dark-themed member management admin page for "Veille Élite" investment committee platform. Full CRUD user management with invitation system.

GLOBAL LAYOUT:
- Left sidebar 240px gray-900, "Administration" section expanded, "Membres" active
- Main content: gray-950, padding 32px

HEADER:
- Title "Membres" white text-2xl font-bold + count badge "(8 membres)" gray-600 text-sm
- Subtitle "Gérez les accès et les rôles de la plateforme" gray-400 text-sm

INVITE FORM CARD (gray-900 border-gray-800 rounded-xl p-5 margin-top 24px):
  Title "Inviter un nouveau membre" white font-semibold
  
  3-column row (gap-4):
  - Field "Adresse email" *: bg-gray-800 border-gray-700 input rounded-lg px-3 py-2.5 text-white, placeholder "prenom@email.com"
  - Field "Rôle" *: Select dropdown bg-gray-800 border-gray-700
    Options: Évaluateur | Contributeur | Admin
  - Submit button: "Envoyer l'invitation" bg-blue-600 text-white rounded-lg px-4 py-2.5 font-medium (aligned bottom)

  Note below: "📧 Un email + 📱 WhatsApp seront envoyés avec le lien d'invitation (valide 7 jours)" gray-500 text-xs

MEMBERS TABLE (gray-900 border-gray-800 rounded-xl overflow-hidden margin-top 24px):
  Title "Membres actifs" white font-semibold px-5 py-4 border-b border-gray-800

  TABLE (w-full):
  Columns: Membre | Rôle | Statut | Membre depuis | Actions
  Column headers: text-xs text-gray-500 uppercase px-5 py-3 border-b border-gray-800

  ROW 1 (current user):
  - Avatar circle 32px bg-blue-600 "A" initial + "Amine Soufi" white text-sm font-medium + email gray-500 text-xs
  - Role badge "Admin" blue-600/20 text-blue-400 rounded-full px-2 py-0.5 text-xs
  - Status "Actif" green dot + "Actif" green-400 text-xs
  - Date "1 jan. 2026" gray-500 text-xs
  - Actions: "(vous)" gray-500 text-xs (no actions on own account)

  ROW 2:
  - Avatar "S" gray + "Sara Benali" white + "sara@mail.com" gray
  - Role badge: Role dropdown select (editable) bg-gray-800 border-gray-700 rounded px-2 py-1 text-xs text-white
    Options: Admin | Évaluateur | Contributeur
  - Status "Actif" green
  - Date "3 jan."
  - Actions: icon buttons — suspend (pause icon) gray-600 hover:yellow-400 | delete (trash) gray-600 hover:red-400

  ROW 3:
  - "Karim Fassi" gray avatar
  - Role: "Évaluateur" green badge
  - Status: "Actif" green
  - Actions: suspend + delete

  ROW 4 — SUSPENDED:
  - "Mohammed Chraibi" gray avatar
  - Role "Contributeur" gray badge
  - Status: orange dot + "Suspendu" orange-400 text-xs
  - Actions: reactivate icon (play icon) green hover | delete icon red hover

  (Rows 5-8 similar)

CONFIRM DELETE MODAL (overlay):
  - Modal: gray-900 rounded-2xl p-6 border border-gray-800 max-w-sm
  - Title "Supprimer ce membre ?" white font-semibold
  - Body: "Sara Benali perdra immédiatement accès à la plateforme. Cette action est irréversible." gray-300 text-sm
  - Buttons: "Annuler" gray border | "Supprimer définitivement" bg-red-600 text-white

DESIGN SYSTEM:
- Dark theme, data table heavy
- Role select inline (editable directly in table)
- Status indicators: green=actif, orange=suspendu
- Action icons visible on row hover only
- French language
```
