import Link from 'next/link'
import { ExpertModeToggle } from './expert-mode-toggle'

export default function PreferencesPage(): React.JSX.Element {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link href="/dashboard" className="text-xs text-primary hover:text-primary/80 transition-colors">
          ← Tableau de bord
        </Link>
        <h1 className="text-xl font-bold text-on-surface mt-2">Préférences</h1>
        <p className="text-on-surface-variant text-sm mt-1">
          Personnalisez votre expérience sur la plateforme Projets Elite
        </p>
      </div>

      <ExpertModeToggle />

      <div className="bg-surface-container border border-border/10 rounded-xl p-5 space-y-3">
        <p className="text-sm font-semibold text-on-surface">Raccourcis</p>
        <div className="grid grid-cols-1 gap-2">
          <Link
            href="/settings/notifications"
            className="flex items-center justify-between px-4 py-3 bg-surface-container-high/50 hover:bg-surface-container-high rounded-lg transition-colors text-sm text-on-surface-variant hover:text-on-surface"
          >
            <span>Préférences de notifications</span>
            <span className="text-on-surface-variant/40">→</span>
          </Link>
          <Link
            href="/settings/api-keys"
            className="flex items-center justify-between px-4 py-3 bg-surface-container-high/50 hover:bg-surface-container-high rounded-lg transition-colors text-sm text-on-surface-variant hover:text-on-surface"
          >
            <span>Clés API (IA, Perplexity…)</span>
            <span className="text-on-surface-variant/40">→</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
