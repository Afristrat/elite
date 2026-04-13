'use client'

import { useExpertMode } from '@/hooks/useExpertMode'
import { cn } from '@/lib/utils'

export function ExpertModeToggle(): React.JSX.Element {
  const { isExpert, toggle } = useExpertMode()

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-gray-200">Mode Expert</p>
          <p className="text-xs text-gray-500">
            Affiche les champs avancés par défaut dans tous les formulaires : Red Team, analyses
            supplémentaires, métriques détaillées. Recommandé pour les membres expérimentés.
          </p>
        </div>
        <button
          type="button"
          onClick={toggle}
          className={cn(
            'relative shrink-0 inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none',
            isExpert ? 'bg-blue-600' : 'bg-gray-700',
          )}
          aria-pressed={isExpert}
        >
          <span
            className={cn(
              'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
              isExpert ? 'translate-x-6' : 'translate-x-1',
            )}
          />
        </button>
      </div>

      <div className={cn(
        'rounded-lg px-4 py-3 text-xs space-y-1',
        isExpert
          ? 'bg-blue-950/20 border border-blue-800/40 text-blue-300'
          : 'bg-gray-800/50 border border-gray-700 text-gray-500'
      )}>
        {isExpert ? (
          <>
            <p className="font-semibold">Mode Expert activé</p>
            <p>
              Les sections Red Team, analyses stratégiques et métriques avancées sont affichées
              par défaut dans tous les formulaires.
            </p>
          </>
        ) : (
          <>
            <p className="font-semibold">Mode Standard</p>
            <p>
              Interface simplifiée — les champs avancés sont disponibles mais repliés.
              Activez le mode expert si vous êtes familier avec les frameworks d&apos;évaluation.
            </p>
          </>
        )}
      </div>

      <div className="pt-2 border-t border-gray-800 space-y-2">
        <p className="text-xs font-semibold text-gray-400">Champs activés en mode expert</p>
        <ul className="space-y-1 text-xs text-gray-500">
          <li className={cn('flex items-center gap-2', isExpert ? 'text-green-400' : '')}>
            <span className={isExpert ? 'text-green-400' : 'text-gray-600'}>●</span>
            Red Team — affiché dès l&apos;ouverture du formulaire d&apos;évaluation
          </li>
          <li className={cn('flex items-center gap-2', isExpert ? 'text-green-400' : '')}>
            <span className={isExpert ? 'text-green-400' : 'text-gray-600'}>●</span>
            Métriques financières détaillées (IRR, sensibilité, Monte Carlo)
          </li>
          <li className={cn('flex items-center gap-2', isExpert ? 'text-green-400' : '')}>
            <span className={isExpert ? 'text-green-400' : 'text-gray-600'}>●</span>
            Indicateurs de poids AHP dans les critères
          </li>
          <li className={cn('flex items-center gap-2', isExpert ? 'text-green-400' : '')}>
            <span className={isExpert ? 'text-green-400' : 'text-gray-600'}>●</span>
            Commentaire de score pondéré en temps réel
          </li>
        </ul>
      </div>

      <p className="text-xs text-gray-700">
        Ce réglage est sauvegardé localement dans votre navigateur.
      </p>
    </div>
  )
}
