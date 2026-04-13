'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { Database } from '@/types/database'

type UserRole = Database['public']['Enums']['user_role']

type NavItem = {
  href: string
  label: string
  icon: string
  roles: UserRole[]
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard',           label: 'Dashboard',    icon: '◉', roles: ['admin', 'evaluateur', 'contributeur'] },
  { href: '/projects',            label: 'Projets',      icon: '◈', roles: ['admin', 'evaluateur', 'contributeur'] },
  { href: '/decisions',           label: 'Décisions',    icon: '◆', roles: ['admin', 'evaluateur', 'contributeur'] },
  { href: '/committee-charter',   label: 'Charte',       icon: '◎', roles: ['admin', 'evaluateur', 'contributeur'] },
  { href: '/analytics',           label: 'Analytics',    icon: '◑', roles: ['admin'] },
]

const ADMIN_ITEMS: NavItem[] = [
  { href: '/admin/members',     label: 'Membres',      icon: '◐', roles: ['admin'] },
  { href: '/admin/invitations', label: 'Invitations',  icon: '◒', roles: ['admin'] },
  { href: '/admin/theses',      label: 'Thèses',       icon: '◓', roles: ['admin'] },
  { href: '/admin/settings',    label: 'Paramètres',   icon: '◔', roles: ['admin'] },
]

type SidebarProps = {
  role: UserRole
}

export function Sidebar({ role }: SidebarProps): React.JSX.Element {
  const pathname = usePathname()

  const visibleNav = NAV_ITEMS.filter((item) => item.roles.includes(role))
  const visibleAdmin = ADMIN_ITEMS.filter((item) => item.roles.includes(role))

  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen bg-gray-900 border-r border-gray-800 px-3 py-4">
      {/* Logo */}
      <div className="flex items-center gap-3 px-3 py-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-sm">V</span>
        </div>
        <span className="text-white font-semibold text-sm">Veille Élite</span>
      </div>

      {/* Navigation principale */}
      <nav className="flex-1 space-y-1">
        {visibleNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
              pathname.startsWith(item.href)
                ? 'bg-blue-600/20 text-blue-400 font-medium'
                : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'
            )}
          >
            <span className="text-xs">{item.icon}</span>
            {item.label}
          </Link>
        ))}

        {/* Section admin */}
        {visibleAdmin.length > 0 && (
          <div className="pt-4">
            <p className="px-3 text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              Administration
            </p>
            {visibleAdmin.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                  pathname.startsWith(item.href)
                    ? 'bg-blue-600/20 text-blue-400 font-medium'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'
                )}
              >
                <span className="text-xs">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </aside>
  )
}
