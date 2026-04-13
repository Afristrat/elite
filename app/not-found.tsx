import Link from 'next/link'

export default function NotFound(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="text-6xl font-bold text-gray-700">404</div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">Page introuvable</h1>
          <p className="text-gray-400">Cette page n&apos;existe pas ou a été déplacée.</p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center px-4 py-2 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors text-sm font-medium"
        >
          Retour au dashboard
        </Link>
      </div>
    </div>
  )
}
