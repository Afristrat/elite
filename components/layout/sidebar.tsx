'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { NAV_ITEMS, ADMIN_ITEMS, SETTINGS_ITEMS } from '@/lib/navigation'
import type { Database } from '@/types/database'

type UserRole = Database['public']['Enums']['user_role']

type SidebarProps = {
  role: UserRole
}

function isActive(pathname: string, href: string, exact?: boolean): boolean {
  return exact ? pathname === href : pathname.startsWith(href)
}

export function Sidebar({ role }: SidebarProps): React.JSX.Element {
  const pathname = usePathname()

  const visibleNav      = NAV_ITEMS.filter((item) => item.roles.includes(role))
  const visibleAdmin    = ADMIN_ITEMS.filter((item) => item.roles.includes(role))
  const visibleSettings = SETTINGS_ITEMS.filter((item) => item.roles.includes(role))

  const linkClass = (href: string, exact?: boolean) =>
    cn(
      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all',
      isActive(pathname, href, exact)
        ? 'bg-surface-container-highest text-na-primary font-semibold'
        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
    )

  return (
    <aside
      aria-label="Barre de navigation latérale"
      className="hidden md:flex flex-col w-[240px] min-h-screen bg-surface-container-low border-r border-border/10 py-6 px-4 z-50"
    >
      {/* Logo */}
      <div className="mb-8 px-2">
        <h1 className="text-xl font-bold tracking-[0.05em] text-on-surface">Veille Élite</h1>
        <p className="text-[0.6875rem] uppercase tracking-widest text-on-surface-variant mt-1 opacity-60">
          Comité d&apos;Investissement
        </p>
      </div>

      {/* Navigation principale */}
      <nav aria-label="Navigation principale" className="flex-1 space-y-1">
        {visibleNav.map((item) => {
          const active = isActive(pathname, item.href, item.exact)
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              {...(item.tourId ? { 'data-tour': item.tourId } : {})}
              className={linkClass(item.href, item.exact)}
            >
              <span className="material-symbols-outlined text-[1.25rem] leading-none" aria-hidden="true">
                {item.icon}
              </span>
              {item.label}
            </Link>
          )
        })}

        {/* Section admin */}
        {visibleAdmin.length > 0 && (
          <div className="pt-4">
            <p className="px-3 text-[0.6rem] font-bold text-on-surface-variant uppercase tracking-widest mb-1 opacity-60">
              Administration
            </p>
            {visibleAdmin.map((item) => {
              const active = isActive(pathname, item.href, item.exact)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  {...(item.tourId ? { 'data-tour': item.tourId } : {})}
                  className={linkClass(item.href, item.exact)}
                >
                  <span className="material-symbols-outlined text-[1.25rem] leading-none" aria-hidden="true">
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              )
            })}
          </div>
        )}

        {/* Section paramètres */}
        {visibleSettings.length > 0 && (
          <div className="pt-4">
            <p className="px-3 text-[0.6rem] font-bold text-on-surface-variant uppercase tracking-widest mb-1 opacity-60">
              Paramètres
            </p>
            {visibleSettings.map((item) => {
              const active = isActive(pathname, item.href, item.exact)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={linkClass(item.href, item.exact)}
                >
                  <span className="material-symbols-outlined text-[1.25rem] leading-none" aria-hidden="true">
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              )
            })}
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
