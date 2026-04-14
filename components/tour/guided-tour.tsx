'use client'

import { useEffect, useCallback } from 'react'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import type { Database } from '@/types/database'

type UserRole = Database['public']['Enums']['user_role']

type GuidedTourProps = {
  role: UserRole
  onClose?: () => void
}

/**
 * Tour guidé interactif — déclenché uniquement sur action utilisateur.
 * Adapte les étapes selon le rôle (admin voit les étapes d'administration).
 */
export function GuidedTour({ role, onClose }: GuidedTourProps): null {
  const isAdmin = role === 'admin'

  const startTour = useCallback(() => {
    const driverObj = driver({
      showProgress: true,
      animate: true,
      smoothScroll: true,
      allowClose: true,
      overlayColor: 'rgba(0,0,0,0.75)',
      stagePadding: 8,
      stageRadius: 12,
      progressText: '{{current}} / {{total}}',
      nextBtnText: 'Suivant →',
      prevBtnText: '← Retour',
      doneBtnText: 'Terminer ✓',
      onDestroyStarted: () => {
        driverObj.destroy()
        onClose?.()
      },
      steps: [
        // ── 1. Accueil ──────────────────────────────────────────
        {
          element: '[data-tour="dashboard-kpis"]',
          popover: {
            title: '👋 Bienvenue sur Projets Elite',
            description:
              'Cette plateforme centralise l\'évaluation collective des projets d\'investissement de votre groupe. Ce tableau de bord affiche en temps réel les indicateurs clés du portefeuille.',
            side: 'bottom',
            align: 'start',
          },
        },
        // ── 2. Navigation ────────────────────────────────────────
        {
          element: '[data-tour="nav-projects"]',
          popover: {
            title: '📁 Projets',
            description:
              'Accédez à tous les projets du groupe — soumettez les vôtres, suivez leur statut (Brouillon → Évaluation → Quorum → Décision) et évaluez ceux des autres membres.',
            side: 'right',
            align: 'start',
          },
        },
        // ── 3. Soumettre un projet ────────────────────────────────
        {
          element: '[data-tour="new-project-btn"]',
          popover: {
            title: '✍️ Soumettre un projet',
            description:
              'Le formulaire de soumission guide en 5 étapes : identité du projet, description (problème / solution / valeur), finances & Monte Carlo, thèse d\'investissement, finalisation. L\'IA vous aide à rédiger chaque champ.',
            side: 'bottom',
            align: 'end',
          },
        },
        // ── 4. Évaluation ────────────────────────────────────────
        {
          // L'élément est optionnel (absent si aucun projet à évaluer)
          element: document.querySelector('[data-tour="to-evaluate"]')
            ? '[data-tour="to-evaluate"]'
            : '[data-tour="dashboard-kpis"]',
          popover: {
            title: '⭐ Évaluer un projet',
            description:
              'Notez chaque projet sur 5 critères pondérés (0–10), rédigez un commentaire argumenté (min 50 caractères) et activez le Red Team pour challenger la thèse. L\'IA améliore ou génère vos textes en un clic.',
            side: 'top',
            align: 'start',
          },
        },
        // ── 5. Décisions ─────────────────────────────────────────
        {
          element: '[data-tour="nav-decisions"]',
          popover: {
            title: '⚖️ Décisions',
            description:
              'Une fois le quorum atteint, l\'admin enregistre la décision (Approuvé / Rejeté / Différé) avec une justification. Chaque décision est immuable et traçable — c\'est votre audit trail d\'investissement.',
            side: 'right',
            align: 'start',
          },
        },
        // ── 6. Analytics ─────────────────────────────────────────
        ...(isAdmin
          ? [
              {
                element: '[data-tour="nav-analytics"]',
                popover: {
                  title: '📊 Analytics',
                  description:
                    'Visualisez votre portefeuille via la matrice GE-McKinsey (attractivité × force), le ranking PROMETHEE II, et les simulations Monte Carlo. Calibrez les poids des critères via la méthode AHP.',
                  side: 'right' as const,
                  align: 'start' as const,
                },
              },
            ]
          : []),
        // ── 7. Administration ────────────────────────────────────
        ...(isAdmin
          ? [
              {
                element: '[data-tour="nav-admin-members"]',
                popover: {
                  title: '👥 Administration',
                  description:
                    'Gérez les membres (rôles, suspension, anonymisation RGPD), envoyez des invitations par lien, définissez les thèses macro du portefeuille et configurez les paramètres globaux (quorum, governance, pre-mortem…).',
                  side: 'right' as const,
                  align: 'start' as const,
                },
              },
            ]
          : []),
        // ── 8. Charte ────────────────────────────────────────────
        {
          element: '[data-tour="nav-charter"]',
          popover: {
            title: '📋 Charte du Comité',
            description:
              'Les règles de gouvernance du groupe : principes de vote aveugle, seuils de quorum, protocoles de décision et code de conduite. À lire avant d\'évaluer votre premier projet.',
            side: 'right',
            align: 'start',
          },
        },
        // ── 9. Bouton IA ─────────────────────────────────────────
        {
          popover: {
            title: '✨ Assistance IA intégrée',
            description:
              'Chaque champ texte dispose d\'un bouton IA. Sur un champ vide : "✨ Générer" produit un texte complet. Sur un champ rempli : "✨ Améliorer" restructure et renforce votre rédaction. Vous acceptez ou ignorez la suggestion.',
            side: 'over',
            align: 'center',
          },
        },
        // ── 10. Fin ──────────────────────────────────────────────
        {
          element: '[data-tour="dashboard-kpis"]',
          popover: {
            title: '🎯 Vous êtes prêt !',
            description:
              'Commencez par compléter votre profil, puis soumettez votre premier projet ou évaluez un projet ouvert. En cas de question, retrouvez ce tour à tout moment via le bouton "Tour guidé" dans l\'en-tête.',
            side: 'bottom',
            align: 'start',
          },
        },
      ],
    })

    driverObj.drive()
  }, [isAdmin, onClose])

  useEffect(() => {
    // Petit délai pour laisser le DOM se stabiliser
    const t = setTimeout(startTour, 100)
    return () => clearTimeout(t)
  }, [startTour])

  return null
}
