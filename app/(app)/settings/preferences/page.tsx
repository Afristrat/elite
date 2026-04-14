import Link from 'next/link'
import { ExpertModeToggle } from './expert-mode-toggle'

export default function PreferencesPage(): React.JSX.Element {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link href="/dashboard" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
          ← Tableau de bord
        </Link>
        <h1 className="text-xl font-bold text-white mt-2">Préférences</h1>
        <p className="text-gray-400 text-sm mt-1">
          Personnalisez votre expérience sur la plateforme Projets Elite
        </p>
      </div>

      <ExpertModeToggle />

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
        <p className="text-sm font-semibold text-gray-200">Raccourcis</p>
        <div className="grid grid-cols-1 gap-2">
          <Link
            href="/settings/notifications"
            className="flex items-center justify-between px-4 py-3 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors text-sm text-gray-300"
          >
            <span>Préférences de notifications</span>
            <span className="text-gray-600">→</span>
          </Link>
          <Link
            href="/settings/api-keys"
            className="flex items-center justify-between px-4 py-3 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors text-sm text-gray-300"
          >
            <span>Clés API (IA, Perplexity…)</span>
            <span className="text-gray-600">→</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
