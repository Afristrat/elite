'use client'

import { useState, useTransition } from 'react'
import { submitAARResponse } from '@/actions/aar'
import type { AARResponseData } from '@/actions/aar'

type Props = {
  projectId: string
  initialData?: AARResponseData
}

const FIELDS: { key: keyof AARResponseData; label: string; icon: string; description: string }[] = [
  {
    key: 'what_intended',
    label: 'Ce qui était prévu',
    icon: '🎯',
    description: 'Qu\'espérions-nous obtenir ? Quels étaient nos objectifs initiaux ?',
  },
  {
    key: 'what_happened',
    label: 'Ce qui s\'est passé',
    icon: '📊',
    description: 'Qu\'avons-nous réellement obtenu ? Quels ont été les résultats ?',
  },
  {
    key: 'why_the_difference',
    label: 'Pourquoi la différence',
    icon: '🔍',
    description: 'Qu\'est-ce qui explique l\'écart ? Qu\'avons-nous mal anticipé ou appris ?',
  },
  {
    key: 'what_to_do_differently',
    label: 'Ce que nous ferions différemment',
    icon: '💡',
    description: 'Quels ajustements pour les prochains projets similaires ?',
  },
]

export function AARForm({ projectId, initialData }: Props): React.JSX.Element {
  const [form, setForm] = useState<AARResponseData>(initialData ?? {
    what_intended: '',
    what_happened: '',
    why_the_difference: '',
    what_to_do_differently: '',
  })
  const [saved, setSaved] = useState(!!initialData)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleChange(key: keyof AARResponseData, value: string): void {
    setForm((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await submitAARResponse(projectId, form)
      if (result.success) {
        setSaved(true)
      } else {
        setError(result.error ?? 'Erreur inconnue')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {FIELDS.map((field) => (
        <div key={field.key} className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{field.icon}</span>
            <label className="text-sm font-semibold text-gray-200">{field.label}</label>
          </div>
          <p className="text-xs text-gray-500 pl-7">{field.description}</p>
          <textarea
            value={form[field.key]}
            onChange={(e) => { handleChange(field.key, e.target.value) }}
            rows={3}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none resize-none mt-2"
            placeholder="Votre réponse…"
            required
            minLength={10}
          />
        </div>
      ))}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
        >
          {isPending ? 'Enregistrement…' : initialData ? 'Mettre à jour l\'AAR' : 'Soumettre l\'AAR'}
        </button>
        {saved && <p className="text-sm text-green-400">AAR enregistrée ✓</p>}
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    </form>
  )
}
