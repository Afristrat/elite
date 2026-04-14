import { createServiceClient } from '@/lib/supabase/server'

type InvitePageProps = {
  params: Promise<{ token: string }>
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrateur',
  evaluateur: 'Évaluateur',
  contributeur: 'Contributeur financier',
}

export default async function InvitePage({ params }: InvitePageProps): Promise<React.JSX.Element> {
  const { token } = await params
  const service = await createServiceClient()

  const { data: invitation } = await service
    .from('invitations')
    .select('email, role, expires_at, accepted_at')
    .eq('token', token)
    .single()

  const isExpired =
    !invitation || new Date(invitation.expires_at) < new Date()
  const isAlreadyAccepted = invitation?.accepted_at !== null

  if (!invitation || isExpired) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 opacity-30">
          <div className="absolute top-[10%] left-[10%] w-[400px] h-[400px] bg-na-primary/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] right-[10%] w-[300px] h-[300px] bg-[#6bffc1]/5 rounded-full blur-[100px]" />
        </div>
        <main className="w-full max-w-[480px] bg-surface-container border border-border/20 rounded-2xl p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-na-primary/10 rounded-full blur-[80px]" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-12 h-12 bg-[#004883] flex items-center justify-center rounded-xl mb-6 shadow-lg shadow-[#004883]/20">
              <span className="text-[#b5d2ff] font-bold text-xl tracking-tighter">V</span>
            </div>
            <div className="text-4xl mb-4 select-none">⏰</div>
            <h1 className="text-on-surface text-2xl font-bold text-center tracking-tight mb-2">Invitation expirée</h1>
            <p className="text-on-surface-variant text-sm text-center mb-8 max-w-[280px] leading-relaxed">
              Ce lien d&apos;invitation n&apos;est plus valide. Contactez votre administrateur pour obtenir un nouveau lien.
            </p>
            <footer className="mt-4">
              <p className="text-on-surface-variant/60 text-[0.6875rem] text-center leading-relaxed max-w-[280px] mx-auto uppercase tracking-[0.05em] font-semibold">
                Cette invitation est personnelle et ne peut être transférée.
              </p>
            </footer>
          </div>
        </main>
      </div>
    )
  }

  if (isAlreadyAccepted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 opacity-30">
          <div className="absolute top-[10%] left-[10%] w-[400px] h-[400px] bg-na-primary/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] right-[10%] w-[300px] h-[300px] bg-[#6bffc1]/5 rounded-full blur-[100px]" />
        </div>
        <main className="w-full max-w-[480px] bg-surface-container border border-border/20 rounded-2xl p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-na-primary/10 rounded-full blur-[80px]" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-12 h-12 bg-[#004883] flex items-center justify-center rounded-xl mb-6 shadow-lg shadow-[#004883]/20">
              <span className="text-[#b5d2ff] font-bold text-xl tracking-tighter">V</span>
            </div>
            <div className="text-4xl mb-4 select-none">✅</div>
            <h1 className="text-on-surface text-2xl font-bold text-center tracking-tight mb-2">Invitation déjà utilisée</h1>
            <p className="text-on-surface-variant text-sm text-center mb-8 max-w-[280px] leading-relaxed">
              Ce lien a déjà été utilisé. Si vous avez un compte, connectez-vous directement.
            </p>
            <div className="w-full space-y-4">
              <a
                href="/login"
                className="w-full h-12 bg-gradient-to-br from-na-primary to-[#004883] text-[#004178] font-semibold rounded-xl flex items-center justify-center gap-3 transition-transform active:scale-[0.98] shadow-lg shadow-na-primary/10"
              >
                Se connecter
              </a>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const expiresAt = new Date(invitation.expires_at)
  const now = new Date()
  const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Décorations d'arrière-plan */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 opacity-30">
        <div className="absolute top-[10%] left-[10%] w-[400px] h-[400px] bg-na-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[300px] h-[300px] bg-[#6bffc1]/5 rounded-full blur-[100px]" />
      </div>

      <main className="w-full max-w-[480px] bg-surface-container border border-border/20 rounded-2xl p-10 shadow-2xl relative overflow-hidden">
        {/* Lueur ambiante */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-na-primary/10 rounded-full blur-[80px]" />

        <div className="relative z-10 flex flex-col items-center">
          {/* Badge branding */}
          <div className="w-12 h-12 bg-[#004883] flex items-center justify-center rounded-xl mb-6 shadow-lg shadow-[#004883]/20">
            <span className="text-[#b5d2ff] font-bold text-xl tracking-tighter">V</span>
          </div>

          {/* Titre */}
          <h1 className="text-on-surface text-2xl font-bold text-center tracking-tight mb-2">Vous êtes invité !</h1>
          <p className="text-on-surface-variant text-sm text-center mb-8">Rejoignez la plateforme Veille Élite</p>

          {/* Détails invitation */}
          <div className="w-full bg-surface-container-low rounded-xl p-5 mb-8 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-on-surface-variant font-medium">E-mail</span>
              <span className="text-on-surface font-semibold">{invitation.email}</span>
            </div>
            <div className="h-px bg-border/30 w-full" />
            <div className="flex justify-between items-center text-sm">
              <span className="text-on-surface-variant font-medium">Rôle</span>
              <span className="px-3 py-1 bg-[#004883] text-[#b5d2ff] text-[0.6875rem] font-bold uppercase tracking-wider rounded-full">
                {ROLE_LABELS[invitation.role] ?? invitation.role}
              </span>
            </div>
            <div className="h-px bg-border/30 w-full" />
            <div className="flex justify-between items-center text-sm">
              <span className="text-on-surface-variant font-medium">Expiration</span>
              <span className="text-na-tertiary font-semibold flex items-center gap-1.5">
                <span
                  className="material-symbols-outlined text-[14px] leading-none"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  timer
                </span>
                Dans {daysLeft} jour{daysLeft > 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="w-full space-y-4">
            <a
              href={`/login?token=${token}`}
              className="w-full h-12 bg-gradient-to-br from-na-primary to-[#004883] text-[#004178] font-semibold rounded-xl flex items-center justify-center gap-3 transition-transform active:scale-[0.98] shadow-lg shadow-na-primary/10"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#fff" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#fff" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff" />
              </svg>
              Rejoindre avec Google
            </a>
            <a
              href="/login"
              className="block text-center text-na-primary text-sm font-medium hover:text-[#b5d2ff] transition-colors tracking-wide underline-offset-4 hover:underline"
            >
              Déjà membre ? Se connecter
            </a>
          </div>

          {/* Note légale */}
          <footer className="mt-10">
            <p className="text-on-surface-variant/60 text-[0.6875rem] text-center leading-relaxed max-w-[280px] mx-auto uppercase tracking-[0.05em] font-semibold">
              Cette invitation est personnelle et ne peut être transférée.
            </p>
          </footer>
        </div>
      </main>
    </div>
  )
}
