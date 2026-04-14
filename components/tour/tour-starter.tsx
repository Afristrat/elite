'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type TourStarterProps = {
  className?: string
  children: React.ReactNode
}

/**
 * Bouton qui démarre le tour cross-pages.
 * Récupère les IDs de projets démo (open + decided) et navigue
 * vers /dashboard?tour=1&open=UUID&decided=UUID.
 */
export function TourStarter({ className, children }: TourStarterProps): React.JSX.Element {
  const router = useRouter()

  async function handleStart(): Promise<void> {
    const supabase = createClient()

    const [{ data: openProject }, { data: decidedProject }] = await Promise.all([
      supabase.from('projects').select('id').eq('status', 'open').limit(1).single(),
      supabase.from('projects').select('id').eq('status', 'decided').limit(1).single(),
    ])

    const params = new URLSearchParams({ tour: '1' })
    if (openProject) params.set('open', openProject.id)
    if (decidedProject) params.set('decided', decidedProject.id)

    router.push(`/dashboard?${params.toString()}`)
  }

  return (
    <button
      type="button"
      onClick={() => {
        void handleStart()
      }}
      className={className}
    >
      {children}
    </button>
  )
}
