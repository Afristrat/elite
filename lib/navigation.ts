import type { Database } from '@/types/database'

type UserRole = Database['public']['Enums']['user_role']

export type NavItem = {
  href: string
  label: string
  /** Label court pour la mobile-nav (espace contraint) */
  labelShort?: string
  icon: string
  roles: UserRole[]
  tourId?: string
  /** Correspondance exacte de pathname (évite les faux positifs startsWith) */
  exact?: boolean
  /** Exclure de la mobile-nav (ex. : items peu prioritaires sur mobile) */
  mobileExcluded?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Tableau de bord',
    labelShort: 'Accueil',
    icon: 'dashboard',
    roles: ['admin', 'evaluateur', 'contributeur'],
    exact: true,
  },
  {
    href: '/projects',
    label: 'Projets',
    icon: 'folder_special',
    roles: ['admin', 'evaluateur', 'contributeur'],
    tourId: 'nav-projects',
  },
  {
    href: '/decisions',
    label: 'Décisions',
    icon: 'gavel',
    roles: ['admin', 'evaluateur', 'contributeur'],
    tourId: 'nav-decisions',
  },
  {
    href: '/committee-charter',
    label: 'Charte',
    icon: 'menu_book',
    roles: ['admin', 'evaluateur', 'contributeur'],
    tourId: 'nav-charter',
    // Exclu de la mobile-nav : 5 onglets dépassent le confort sur petits écrans.
    // Accessible depuis le tableau de bord ou en navigation directe.
    mobileExcluded: true,
  },
  {
    href: '/analytics',
    label: 'Analytiques',
    icon: 'analytics',
    roles: ['admin'],
    tourId: 'nav-analytics',
  },
]

export const ADMIN_ITEMS: NavItem[] = [
  { href: '/admin/members',     label: 'Membres',    icon: 'group',    roles: ['admin'], tourId: 'nav-admin-members' },
  { href: '/admin/invitations', label: 'Invitations',icon: 'mail',     roles: ['admin'] },
  { href: '/admin/theses',      label: 'Thèses',     icon: 'lightbulb',roles: ['admin'] },
  { href: '/admin/settings',    label: 'Paramètres', icon: 'settings', roles: ['admin'] },
]

export const SETTINGS_ITEMS: NavItem[] = [
  { href: '/settings/api-keys',      label: 'Clés API',      icon: 'key',           roles: ['admin', 'evaluateur', 'contributeur'] },
  { href: '/settings/notifications', label: 'Notifications', icon: 'notifications', roles: ['admin', 'evaluateur', 'contributeur'] },
  { href: '/settings/preferences',   label: 'Préférences',   icon: 'tune',          roles: ['admin', 'evaluateur', 'contributeur'] },
]
