'use client'

import { useState } from 'react'

const STORAGE_KEY = 'veille-elite:expert-mode'

function readStoredValue(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

/**
 * Hook persistant en localStorage pour le mode expert.
 * Expert mode = afficher tous les champs avancés par défaut (Red Team, AHP, analyses poussées).
 * Utilise un initialiseur lazy pour lire localStorage sans setState dans useEffect.
 */
export function useExpertMode(): { isExpert: boolean; toggle: () => void } {
  const [isExpert, setIsExpert] = useState<boolean>(readStoredValue)

  function toggle(): void {
    setIsExpert((prev) => {
      const next = !prev
      try {
        localStorage.setItem(STORAGE_KEY, String(next))
      } catch {
        // localStorage inaccessible (mode privé strict)
      }
      return next
    })
  }

  return { isExpert, toggle }
}
