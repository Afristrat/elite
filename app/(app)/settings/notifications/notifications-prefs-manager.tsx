'use client'

import { useState, useTransition } from 'react'
import { updateNotificationPrefs } from '@/actions/settings'
import type { NotificationPrefs } from '@/actions/settings'
import { cn } from '@/lib/utils'

type Pref = {
  key: keyof NotificationPrefs
  label: string
  description: string
  adminOnly?: boolean
}

const PREFS: Pref[] = [
  {
    key: 'evaluation_reminder',
    label: 'Rappels d\'évaluation',
    description: 'Recevoir un rappel quand la date limite approche (48h avant)',
  },
  {
    key: 'quorum_reached',
    label: 'Quorum atteint',
    description: 'Être notifié(e) quand un projet atteint son quorum d\'évaluations',
  },
  {
    key: 'decision_made',
    label: 'Décision du comité',
    description: 'Recevoir la décision finale (approuvé, rejeté, différé) avec la justification',
  },
  {
    key: 'project_submitted',
    label: 'Nouveau projet soumis',
    description: 'Être notifié(e) quand un nouveau projet est soumis à évaluation',
    adminOnly: true,
  },
]

type Props = {
  prefs: NotificationPrefs
  role: string
}

export function NotificationsPrefsManager({ prefs: initialPrefs, role }: Props): React.JSX.Element {
  const [prefs, setPrefs] = useState<NotificationPrefs>(initialPrefs)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function toggle(key: keyof NotificationPrefs): void {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }))
    setSaved(false)
  }

  function handleSave(): void {
    setError(null)
    startTransition(async () => {
      const result = await updateNotificationPrefs(prefs)
      if (result.success) {
        setSaved(true)
      } else {
        setError(result.error ?? 'Erreur inconnue')
      }
    })
  }

  const visiblePrefs = PREFS.filter((p) => !p.adminOnly || role === 'admin')

  return (
    <div className="space-y-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl divide-y divide-gray-800">
        {visiblePrefs.map((pref) => (
          <div key={pref.key} className="flex items-center justify-between px-5 py-4">
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-white">{pref.label}</p>
              <p className="text-xs text-gray-500">{pref.description}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={prefs[pref.key]}
              onClick={() => { toggle(pref.key) }}
              className={cn(
                'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
                prefs[pref.key] ? 'bg-blue-600' : 'bg-gray-700',
              )}
            >
              <span
                className={cn(
                  'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform',
                  prefs[pref.key] ? 'translate-x-5' : 'translate-x-0',
                )}
              />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
        >
          {isPending ? 'Enregistrement…' : 'Enregistrer'}
        </button>
        {saved && (
          <p className="text-sm text-green-400">Préférences enregistrées</p>
        )}
        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}
      </div>
    </div>
  )
}
