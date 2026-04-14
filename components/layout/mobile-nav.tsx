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
    { href: '/dashboard', label: 'Tableau de bord', icon: 'dashboard',      roles: ['admin', 'evaluateur', 'contributeur'] as UserRole[] },
    { href: '/projects',  label: 'Projets',          icon: 'folder_special', roles: ['admin', 'evaluateur', 'contributeur'] as UserRole[] },
    { href: '/decisions', label: 'Décisions',         icon: 'gavel',         roles: ['admin', 'evaluateur', 'contributeur'] as UserRole[] },
    { href: '/analytics', label: 'Analytiques',       icon: 'analytics',     roles: ['admin'] as UserRole[] },
  ].filter((item) => item.roles.includes(role))

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-container-low border-t border-border/10 flex z-50">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'flex-1 flex flex-col items-center py-3 gap-1 text-[0.65rem] transition-colors',
            pathname.startsWith(item.href)
              ? 'text-na-primary'
              : 'text-on-surface-variant hover:text-on-surface'
          )}
        >
          <span className="material-symbols-outlined text-[1.25rem] leading-none">{item.icon}</span>
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  )
}
