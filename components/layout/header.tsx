'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { TourStarter } from '@/components/tour/tour-starter'
import type { Database } from '@/types/database'

type UserRole = Database['public']['Enums']['user_role']

type HeaderProps = {
  fullName: string | null
  avatarUrl: string | null
  email: string
  role: UserRole
}

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  evaluateur: 'Évaluateur',
  contributeur: 'Contributeur',
}

const ROLE_COLORS: Record<UserRole, string> = {
  admin: 'bg-[#004883]/30 text-na-primary border border-na-primary/20',
  evaluateur: 'bg-[#004883]/20 text-na-primary border border-na-primary/20',
  contributeur: 'bg-[#006948]/20 text-na-tertiary border border-na-tertiary/20',
}

export function Header({ fullName, avatarUrl, email, role }: HeaderProps): React.JSX.Element {
  const router = useRouter()

  async function handleSignOut(): Promise<void> {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const displayName = fullName ?? email
  const firstLetter = displayName.charAt(0).toUpperCase()

  return (
    <header className="h-16 px-8 flex justify-between items-center sticky top-0 bg-background/80 backdrop-blur-md z-40 border-b border-border/10">
      {/* Logo mobile */}
      <div className="md:hidden flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-na-primary flex items-center justify-center shrink-0">
          <span className="text-[#004178] font-extrabold text-sm">V</span>
        </div>
        <span className="text-on-surface font-semibold text-sm tracking-wide">Veille Élite</span>
      </div>

      {/* Espace gauche desktop */}
      <div className="flex-1 hidden md:block" />

      {/* Zone droite */}
      <div className="flex items-center gap-6">
        {/* Bouton Tour guidé */}
        <TourStarter
          className={cn(
            'hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-colors',
            'border border-border/20 text-on-surface-variant hover:text-na-primary hover:border-na-primary/30'
          )}
        >
          <span className="material-symbols-outlined text-[1rem] leading-none">play_circle</span>
          <span>Tour guidé</span>
        </TourStarter>

        {/* Badge rôle */}
        <span className={cn('text-[0.65rem] px-2 py-0.5 rounded font-bold uppercase tracking-wider', ROLE_COLORS[role])}>
          {ROLE_LABELS[role]}
        </span>

        {/* Avatar + nom */}
        <div className="flex items-center gap-3 pl-6 border-l border-border/20">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-on-surface leading-none">{displayName}</p>
            <p className="text-[0.65rem] text-on-surface-variant uppercase mt-1">{ROLE_LABELS[role]}</p>
          </div>
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={displayName}
              width={40}
              height={40}
              className="rounded-full border-2 border-surface-container-highest object-cover w-10 h-10"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-surface-container-highest border-2 border-surface-container-highest flex items-center justify-center">
              <span className="text-on-surface-variant text-sm font-semibold">
                {firstLetter}
              </span>
            </div>
          )}
        </div>

        {/* Déconnexion */}
        <button
          onClick={() => { void handleSignOut() }}
          className="text-on-surface-variant hover:text-na-error text-xs px-2 py-1 rounded-lg hover:bg-surface-container transition-colors"
        >
          <span className="material-symbols-outlined text-sm leading-none align-middle">logout</span>
        </button>
      </div>
    </header>
  )
}
