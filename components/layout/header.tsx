'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { cn } from '@/lib/utils'
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
  admin: 'bg-purple-600/20 text-purple-400',
  evaluateur: 'bg-blue-600/20 text-blue-400',
  contributeur: 'bg-green-600/20 text-green-400',
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

  return (
    <header className="h-14 bg-gray-950 border-b border-gray-800 flex items-center justify-between px-4 shrink-0">
      <div className="md:hidden flex items-center gap-2">
        <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center">
          <span className="text-white font-bold text-xs">V</span>
        </div>
        <span className="text-white font-semibold text-sm">Veille Élite</span>
      </div>

      <div className="flex-1 hidden md:block" />

      <div className="flex items-center gap-3">
        <span className={cn('text-xs px-2 py-1 rounded-full font-medium', ROLE_COLORS[role])}>
          {ROLE_LABELS[role]}
        </span>

        <div className="flex items-center gap-2">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={displayName}
              width={28}
              height={28}
              className="rounded-full"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center">
              <span className="text-gray-300 text-xs font-medium">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <span className="text-gray-300 text-sm hidden sm:block">{displayName}</span>
        </div>

        <button
          onClick={handleSignOut}
          className="text-gray-500 hover:text-gray-300 text-xs px-2 py-1 rounded hover:bg-gray-800 transition-colors"
        >
          Déconnexion
        </button>
      </div>
    </header>
  )
}
