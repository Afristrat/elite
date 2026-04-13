'use client'

import { useState } from 'react'
import { OnboardingChecklist } from './onboarding-checklist'

type OnboardingStep = {
  id: string
  title: string
  description: string
  href: string
  completed: boolean
}

type OnboardingWrapperProps = {
  steps: OnboardingStep[]
  userId: string
}

const DISMISSED_KEY = 'onboarding_dismissed'

function isDismissed(storageKey: string): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(storageKey) === 'true'
}

export function OnboardingWrapper({ steps, userId }: OnboardingWrapperProps): React.JSX.Element | null {
  const storageKey = `${DISMISSED_KEY}_${userId}`
  // Initialiser depuis localStorage directement — pas de useEffect pour éviter le flash
  const [dismissed, setDismissed] = useState(() => isDismissed(storageKey))

  function handleDismiss(): void {
    localStorage.setItem(storageKey, 'true')
    setDismissed(true)
  }

  if (dismissed) return null

  return <OnboardingChecklist steps={steps} onDismiss={handleDismiss} />
}
