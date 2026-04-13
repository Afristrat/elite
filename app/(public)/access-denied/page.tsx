import Link from 'next/link'

export default function AccessDeniedPage(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="text-6xl">🔒</div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">Accès refusé</h1>
          <p className="text-gray-400">
            Votre adresse email n&apos;est pas associée à une invitation active.
            Contactez l&apos;administrateur pour obtenir accès.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center px-4 py-2 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors text-sm font-medium"
        >
          Retour à la connexion
        </Link>
      </div>
    </div>
  )
}
