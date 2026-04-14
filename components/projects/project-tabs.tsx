'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

type ProjectTabsProps = {
  id: string
}

const TABS = [
  { label: 'Aperçu', suffix: '' },
  { label: 'Évaluation', suffix: '/evaluate' },
  { label: 'Résultats', suffix: '/results' },
  { label: 'AAR', suffix: '/aar' },
]

export function ProjectTabs({ id }: ProjectTabsProps): React.JSX.Element {
  const pathname = usePathname()
  const base = `/projects/${id}`

  return (
    <div className="flex gap-1 border-b border-gray-800 pb-0">
      {TABS.map((tab) => {
        const href = `${base}${tab.suffix}`
        // Exact match pour l'aperçu, startsWith pour les sous-routes (ex: /evaluate?tour=4)
        const isActive =
          tab.suffix === ''
            ? pathname === href
            : pathname.startsWith(href)

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              isActive
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-300',
            )}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
