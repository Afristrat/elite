'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { Database } from '@/types/database'

type UserRole = Database['public']['Enums']['user_role']

type MobileNavProps = {
  role: UserRole
}

export function MobileNav({ role }: MobileNavProps): React.JSX.Element {
  const pathname = usePathname()

  const items = [
    { href: '/dashboard', label: 'Dashboard', icon: '◉', roles: ['admin', 'evaluateur', 'contributeur'] as UserRole[] },
    { href: '/projects',  label: 'Projets',   icon: '◈', roles: ['admin', 'evaluateur', 'contributeur'] as UserRole[] },
    { href: '/decisions', label: 'Décisions', icon: '◆', roles: ['admin', 'evaluateur', 'contributeur'] as UserRole[] },
    { href: '/analytics', label: 'Analytics', icon: '◑', roles: ['admin'] as UserRole[] },
  ].filter((item) => item.roles.includes(role))

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 flex z-50">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'flex-1 flex flex-col items-center py-3 gap-1 text-xs transition-colors',
            pathname.startsWith(item.href)
              ? 'text-blue-400'
              : 'text-gray-500 hover:text-gray-300'
          )}
        >
          <span>{item.icon}</span>
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  )
}
