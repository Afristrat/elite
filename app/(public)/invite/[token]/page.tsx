import { createServiceClient } from '@/lib/supabase/server'

type InvitePageProps = {
  params: Promise<{ token: string }>
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
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-4xl">⏰</div>
          <h1 className="text-xl font-bold text-white">Invitation expirée</h1>
          <p className="text-gray-400 text-sm">
            Ce lien d&apos;invitation n&apos;est plus valide. Contactez votre administrateur pour
            obtenir un nouveau lien.
          </p>
        </div>
      </div>
    )
  }

  if (isAlreadyAccepted) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-4xl">✅</div>
          <h1 className="text-xl font-bold text-white">Invitation déjà utilisée</h1>
          <p className="text-gray-400 text-sm">
            Ce lien a déjà été utilisé. Si vous avez un compte, connectez-vous directement.
          </p>
          <a
            href="/login"
            className="inline-flex items-center px-4 py-2 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors text-sm font-medium"
          >
            Se connecter
          </a>
        </div>
      </div>
    )
  }

  const expiresAt = new Date(invitation.expires_at)
  const now = new Date()
  const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  const ROLE_LABELS: Record<string, string> = {
    admin: 'Administrateur',
    evaluateur: 'Évaluateur',
    contributeur: 'Contributeur financier',
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md w-full">
        <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto">
          <span className="text-white font-bold text-2xl">V</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">Vous êtes invité</h1>
          <p className="text-gray-400 text-sm">
            Rejoignez <strong className="text-white">Veille Élite</strong> en tant que{' '}
            <strong className="text-blue-400">{ROLE_LABELS[invitation.role] ?? invitation.role}</strong>
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3 text-left">
          <div>
            <p className="text-xs text-gray-500">Email associé</p>
            <p className="text-sm text-white font-medium">{invitation.email}</p>
          </div>
          <p className="text-xs text-gray-500">
            Connectez-vous avec Google en utilisant <strong className="text-gray-300">exactement</strong> cette
            adresse email. L&apos;invitation expire dans {daysLeft} jour{daysLeft > 1 ? 's' : ''}.
          </p>
        </div>

        <a
          href={`/login?token=${token}`}
          className="w-full inline-flex items-center justify-center gap-3 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Rejoindre avec Google
        </a>
      </div>
    </div>
  )
}
