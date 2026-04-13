import Link from 'next/link'

export default function SuspendedPage(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="text-6xl">⛔</div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">Compte suspendu</h1>
          <p className="text-gray-400">
            Votre compte a été suspendu par l&apos;administrateur.
            Contactez-le pour en savoir plus.
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
