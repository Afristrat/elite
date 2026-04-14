'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { NAV_ITEMS } from '@/lib/navigation'
import type { Database } from '@/types/database'

type UserRole = Database['public']['Enums']['user_role']

type MobileNavProps = {
  role: UserRole
}

function isActive(pathname: string, href: string, exact?: boolean): boolean {
  return exact ? pathname === href : pathname.startsWith(href)
}

export function MobileNav({ role }: MobileNavProps): React.JSX.Element {
  const pathname = usePathname()

  const items = NAV_ITEMS.filter(
    (item) => item.roles.includes(role) && !item.mobileExcluded
  )

  return (
    <nav
      aria-label="Navigation mobile"
      className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-container-low border-t border-border/10 flex z-50"
    >
      {items.map((item) => {
        const active = isActive(pathname, item.href, item.exact)
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex-1 flex flex-col items-center py-3 gap-1 transition-colors min-w-0',
              active
                ? 'text-na-primary'
                : 'text-on-surface-variant hover:text-on-surface'
            )}
          >
            <span
              className="material-symbols-outlined text-[1.25rem] leading-none"
              aria-hidden="true"
            >
              {item.icon}
            </span>
            <span className="text-[0.6rem] truncate max-w-full px-1 text-center leading-tight">
              {item.labelShort ?? item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
