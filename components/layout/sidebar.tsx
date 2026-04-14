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
  tourId?: string
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard',           label: 'Tableau de bord', icon: 'dashboard',         roles: ['admin', 'evaluateur', 'contributeur'] },
  { href: '/projects',            label: 'Projets',          icon: 'folder_special',    roles: ['admin', 'evaluateur', 'contributeur'], tourId: 'nav-projects' },
  { href: '/decisions',           label: 'Décisions',        icon: 'gavel',             roles: ['admin', 'evaluateur', 'contributeur'], tourId: 'nav-decisions' },
  { href: '/committee-charter',   label: 'Charte',           icon: 'menu_book',         roles: ['admin', 'evaluateur', 'contributeur'], tourId: 'nav-charter' },
  { href: '/analytics',           label: 'Analytiques',      icon: 'analytics',         roles: ['admin'], tourId: 'nav-analytics' },
]

const ADMIN_ITEMS: NavItem[] = [
  { href: '/admin/members',     label: 'Membres',      icon: 'group',               roles: ['admin'], tourId: 'nav-admin-members' },
  { href: '/admin/invitations', label: 'Invitations',  icon: 'mail',                roles: ['admin'] },
  { href: '/admin/theses',      label: 'Thèses',       icon: 'lightbulb',           roles: ['admin'] },
  { href: '/admin/settings',    label: 'Paramètres',   icon: 'settings',            roles: ['admin'] },
]

const SETTINGS_ITEMS: NavItem[] = [
  { href: '/settings/api-keys',      label: 'Clés API',       icon: 'key',           roles: ['admin', 'evaluateur', 'contributeur'] },
  { href: '/settings/notifications', label: 'Notifications',  icon: 'notifications', roles: ['admin', 'evaluateur', 'contributeur'] },
  { href: '/settings/preferences',   label: 'Préférences',    icon: 'tune',          roles: ['admin', 'evaluateur', 'contributeur'] },
]

type SidebarProps = {
  role: UserRole
}

export function Sidebar({ role }: SidebarProps): React.JSX.Element {
  const pathname = usePathname()

  const visibleNav = NAV_ITEMS.filter((item) => item.roles.includes(role))
  const visibleAdmin = ADMIN_ITEMS.filter((item) => item.roles.includes(role))
  const visibleSettings = SETTINGS_ITEMS.filter((item) => item.roles.includes(role))

  return (
    <aside className="hidden md:flex flex-col w-[240px] min-h-screen bg-surface-container-low border-r border-border/10 py-6 px-4 z-50">
      {/* Logo */}
      <div className="mb-8 px-2">
        <h1 className="text-xl font-bold tracking-[0.05em] text-on-surface">Veille Élite</h1>
        <p className="text-[0.6875rem] uppercase tracking-widest text-on-surface-variant mt-1 opacity-60">
          Comité d&apos;Investissement
        </p>
      </div>

      {/* Navigation principale */}
      <nav className="flex-1 space-y-1">
        {visibleNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            {...(item.tourId ? { 'data-tour': item.tourId } : {})}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all',
              pathname.startsWith(item.href)
                ? 'bg-surface-container-highest text-na-primary font-semibold'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            )}
          >
            <span className="material-symbols-outlined text-[1.25rem] leading-none">{item.icon}</span>
            {item.label}
          </Link>
        ))}

        {/* Section admin */}
        {visibleAdmin.length > 0 && (
          <div className="pt-4">
            <p className="px-3 text-[0.6rem] font-bold text-on-surface-variant uppercase tracking-widest mb-1 opacity-60">
              Administration
            </p>
            {visibleAdmin.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                {...(item.tourId ? { 'data-tour': item.tourId } : {})}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all',
                  pathname.startsWith(item.href)
                    ? 'bg-surface-container-highest text-na-primary font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                )}
              >
                <span className="material-symbols-outlined text-[1.25rem] leading-none">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        )}

        {/* Section paramètres */}
        {visibleSettings.length > 0 && (
          <div className="pt-4">
            <p className="px-3 text-[0.6rem] font-bold text-on-surface-variant uppercase tracking-widest mb-1 opacity-60">
              Paramètres
            </p>
            {visibleSettings.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all',
                  pathname.startsWith(item.href)
                    ? 'bg-surface-container-highest text-na-primary font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                )}
              >
                <span className="material-symbols-outlined text-[1.25rem] leading-none">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Pied de sidebar */}
      <div className="mt-auto pt-4 border-t border-border/10">
        <p className="px-3 text-[0.55rem] text-on-surface-variant uppercase tracking-widest opacity-40 select-none">
          v0.1.0 — Veille Élite
        </p>
      </div>
    </aside>
  )
}
