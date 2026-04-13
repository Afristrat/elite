'use client'

import { useState, useTransition } from 'react'
import { addOutcome } from '@/actions/outcomes'

type FormData = {
  who_changed: string
  what_changed: string
  why_significant: string
  contributed_by: string
}

type Props = { projectId: string }

const FIELDS: { key: keyof FormData; label: string; placeholder: string; icon: string }[] = [
  { key: 'who_changed', label: 'Qui a changé ?', placeholder: 'Ex : Équipe dirigeante, investisseurs, partenaires…', icon: '👤' },
  { key: 'what_changed', label: 'Qu\'est-ce qui a changé ?', placeholder: 'Décrivez la pratique, le comportement ou la décision qui a évolué…', icon: '🔄' },
  { key: 'why_significant', label: 'Pourquoi est-ce significatif ?', placeholder: 'Quel impact sur les objectifs du projet ou du portefeuille ?', icon: '💡' },
  { key: 'contributed_by', label: 'Qu\'est-ce qui y a contribué ?', placeholder: 'Quels facteurs ou actions ont causé ce changement ?', icon: '🎯' },
]

export function OutcomeForm({ projectId }: Props): React.JSX.Element {
  const [form, setForm] = useState<FormData>({ who_changed: '', what_changed: '', why_significant: '', contributed_by: '' })
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await addOutcome(projectId, form)
      if (result.success) {
        setForm({ who_changed: '', what_changed: '', why_significant: '', contributed_by: '' })
        setOpen(false)
      } else {
        setError(result.error ?? 'Erreur inconnue')
      }
    })
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => { setOpen(true) }}
        className="px-4 py-2 text-sm font-medium bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-700"
      >
        + Ajouter un outcome
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-900 border border-blue-800/40 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-200">Nouvel outcome</h3>
        <button type="button" onClick={() => { setOpen(false) }} className="text-gray-500 hover:text-gray-300 text-sm">✕</button>
      </div>

      {FIELDS.map((f) => (
        <div key={f.key} className="space-y-1.5">
          <label className="text-xs font-medium text-gray-400">
            {f.icon} {f.label}
          </label>
          <textarea
            value={form[f.key]}
            onChange={(e) => { setForm((prev) => ({ ...prev, [f.key]: e.target.value })) }}
            rows={2}
            placeholder={f.placeholder}
            required
            minLength={5}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none resize-none"
          />
        </div>
      ))}

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
        >
          {isPending ? 'Enregistrement…' : 'Enregistrer'}
        </button>
        <button type="button" onClick={() => { setOpen(false) }} className="text-sm text-gray-500 hover:text-gray-300">
          Annuler
        </button>
      </div>
    </form>
  )
}
