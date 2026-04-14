import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LoginButton } from './login-button'

export default async function LoginPage(): Promise<React.JSX.Element> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 mb-4">
            <span className="text-white font-bold text-2xl">V</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Projets Elite</h1>
          <p className="text-gray-400 text-sm">
            Plateforme de décision stratégique
          </p>
        </div>

        {/* Card connexion */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-white">Connexion</h2>
            <p className="text-sm text-gray-400">
              Accès réservé aux membres invités
            </p>
          </div>

          <LoginButton />

          <p className="text-xs text-gray-500 text-center">
            Vous n&apos;êtes pas encore membre ?{' '}
            <span className="text-gray-400">
              Contactez l&apos;administrateur pour recevoir une invitation.
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
