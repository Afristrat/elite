# Stitch Prompt — Tableau de bord (Dashboard)

**Page :** Tableau de bord principal  
**Mode Stitch :** Web  
**Modèle :** 3.0 Flash (ou supérieur)

---

## Prompt à coller dans Stitch

```
Dark-themed web application dashboard for "Veille Élite", a private investment committee platform used by members to track project evaluations and decisions.

LAYOUT:
- Left sidebar 240px, dark gray-900 background with navigation items: Tableau de bord (active, blue accent), Projets, Décisions, Analytiques, Paramètres. Logo "Veille Élite" at top. Bottom: "Administration" section in muted gray.
- Top header: greeting "Bonjour, Amine" in white large text, role badge "admin" in blue pill, user avatar + name on right, "Démarrer le tour" button with play icon.
- Main content area: dark gray-950 background, generous padding.

ONBOARDING CARD (collapsible, top of main):
- Title "Premiers pas" with progress "3 / 4 complétés"
- 4 checklist rows with checkboxes: ✅ Compléter votre profil, ✅ Soumettre votre premier projet, ✅ Effectuer une évaluation, ⬜ Lire la charte du comité
- Dismiss × button top right, gray-900 bg, subtle border

KPI CARDS GRID (4 cards in a row):
1. "Projets ouverts" — value "7" white text, gray-900 card, gray-800 border
2. "À évaluer" — value "3" blue-400 text, blue-800 border with subtle blue glow
3. "Décisions (30 j)" — value "12" white text, gray-900 card
4. "Score moyen global" — value "7.4 / 10" green-400 text, green-800 border
All cards: rounded-xl, label in xs gray-500 above value in 2xl bold, fully clickable

URGENT ALERT BANNER (below KPIs):
- Yellow-950/20 background, yellow-900/50 border, rounded
- ⚠️ "2 projets arrivent à échéance dans moins de 72 h" in yellow-400 text

TWO-COLUMN SECTION:
Left — "Décisions récentes" card (gray-900, rounded-xl):
  - Header with "Voir toutes →" link
  - 5 rows: project name (white) + date (gray-500 xs) + status badge right-aligned
  - Status badges: "Approuvé" green-400, "Rejeté" red-400, "Différé" yellow-400
  - Thin dividers between rows

Right — "Statut du portefeuille" card (gray-900, rounded-xl):
  - 3 progress rows:
    "Ouverts" 7 → blue-500 bar at 54%
    "Fermés" 3 → yellow-500 bar at 23%
    "Décidés" 3 → green-500 bar at 23%
  - Each: label left, count right, thin h-1.5 progress bar below on gray-800 track

"À ÉVALUER" SECTION (full width, bottom, gray-900 card):
  - Section title "À évaluer" with blue badge count "3"
  - 3 project rows each: project title (white bold) + deadline chip "J-2" yellow-400 + horizon badge "H2" gray pill + "Évaluer →" blue-600 button right

DESIGN SYSTEM:
- Dark theme throughout, no light backgrounds
- Inter font, rounded-xl cards, 1px borders with low opacity
- No drop shadows — depth via border contrast only
- French UI text throughout
- Palette: bg-gray-950 (root), bg-gray-900 (cards), text-white, text-gray-400, text-gray-500, accent blue-400/600, green-400, yellow-400, red-400
```

---

## Instructions

1. Aller sur [stitch.withgoogle.com](https://stitch.withgoogle.com)
2. Se connecter avec le compte Google
3. Sélectionner **Web** (pas Appli)
4. Copier-coller le prompt ci-dessus dans le champ de saisie
5. Cliquer **Générer des designs**

---

## Contexte fonctionnel (référence)

| Zone | Données réelles | Source Supabase |
|------|----------------|-----------------|
| Projets ouverts | Count `projects.status = 'open'` | Table `projects` |
| À évaluer | Projets open non évalués par l'user | Tables `projects` + `evaluations` |
| Décisions (30 j) | Count `decisions` des 30 derniers jours | Table `decisions` |
| Score moyen | `avg(avg_score)` de tous les projets | Vue `project_evaluation_stats` |
| Décisions récentes | 5 dernières décisions avec statut | Tables `decisions` + `projects` |
| Portfolio statut | Count par statut (open/closed/decided) | Table `projects` |
| À évaluer (liste) | Max 5 projets urgents à évaluer | Tables `projects` + `evaluations` |

**Rôles affectant l'affichage :**
- `admin` → tout visible
- `evaluateur` → section "À évaluer" visible
- `contributeur` → section "À évaluer" masquée
