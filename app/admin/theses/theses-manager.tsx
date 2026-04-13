'use client'

import { useState, useTransition } from 'react'
import { createThesis, archiveThesis } from '@/actions/theses'

type Thesis = {
  id: string
  title: string
  description: string | null
  horizon: string | null
  status: string
  created_at: string
}

type ThesisHorizon = 'H1' | 'H2' | 'H3'

const HORIZON_LABELS: Record<ThesisHorizon, string> = {
  H1: 'H1 — Court terme',
  H2: 'H2 — Moyen terme',
  H3: 'H3 — Long terme',
}

type ThesesManagerProps = {
  theses: Thesis[]
}

export function ThesesManager({ theses }: ThesesManagerProps): React.JSX.Element {
  const [isPending, startTransition] = useTransition()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [horizon, setHorizon] = useState<ThesisHorizon | ''>('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const activeTheses = theses.filter((t) => t.status === 'active')
  const archivedTheses = theses.filter((t) => t.status === 'archived')

  function handleCreate(): void {
    setError(null)
    setSuccess(false)
    startTransition(async () => {
      const result = await createThesis({ title, description, horizon: horizon || null })
      if (result.success) {
        setTitle('')
        setDescription('')
        setHorizon('')
        setSuccess(true)
        setTimeout(() => setSuccess(false), 2000)
      } else {
        setError(result.error ?? 'Erreur inconnue')
      }
    })
  }

  function handleArchive(id: string): void {
    startTransition(async () => {
      await archiveThesis(id)
    })
  }

  return (
    <div className="space-y-6">
      {/* Formulaire création */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-200">Ajouter une thèse macro</h2>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Titre *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value) }}
              placeholder="Ex : IA appliquée à la productivité PME"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-600 placeholder-gray-600"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => { setDescription(e.target.value) }}
              placeholder="Contexte, conviction clé, exemples de projets associés…"
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-600 placeholder-gray-600 resize-none"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">Horizon</label>
            <select
              value={horizon}
              onChange={(e) => { setHorizon(e.target.value as ThesisHorizon | '') }}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-600"
            >
              <option value="">Tous horizons</option>
              <option value="H1">H1 — Court terme</option>
              <option value="H2">H2 — Moyen terme</option>
              <option value="H3">H3 — Long terme</option>
            </select>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={handleCreate}
            disabled={isPending || !title.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {isPending ? 'Enregistrement…' : 'Ajouter la thèse'}
          </button>
          {success && <span className="text-xs text-green-400">Thèse ajoutée ✓</span>}
        </div>
      </div>

      {/* Liste thèses actives */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-200">
          Thèses actives ({activeTheses.length})
        </h2>

        {!activeTheses.length ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
            <p className="text-gray-500 text-sm">Aucune thèse macro définie</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeTheses.map((thesis) => (
              <div
                key={thesis.id}
                className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-start justify-between gap-4"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-white truncate">{thesis.title}</p>
                    {thesis.horizon && (
                      <span className="text-xs text-gray-500 font-mono shrink-0">
                        {HORIZON_LABELS[thesis.horizon as ThesisHorizon] ?? thesis.horizon}
                      </span>
                    )}
                  </div>
                  {thesis.description && (
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                      {thesis.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => { handleArchive(thesis.id) }}
                  disabled={isPending}
                  className="text-xs text-gray-600 hover:text-red-400 transition-colors shrink-0 disabled:opacity-50"
                >
                  Archiver
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Thèses archivées */}
      {archivedTheses.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-600">
            Archivées ({archivedTheses.length})
          </h2>
          <div className="space-y-2">
            {archivedTheses.map((thesis) => (
              <div
                key={thesis.id}
                className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-4"
              >
                <p className="text-sm text-gray-600 line-through">{thesis.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
