'use client'

import { useState, useTransition } from 'react'
import { addProjectCriterion, updateProjectCriterion, deleteProjectCriterion } from '@/actions/criteria'
import { cn } from '@/lib/utils'

type Criterion = {
  id: string
  label: string
  weight: number
  description: string | null
  order_index: number
}

type Props = {
  projectId: string
  projectCriteria: Criterion[]
  defaultCriteria: Criterion[]
}

export function CriteriaManager({ projectId, projectCriteria, defaultCriteria }: Props): React.JSX.Element {
  const [addLabel, setAddLabel] = useState('')
  const [addWeight, setAddWeight] = useState(20)
  const [addDescription, setAddDescription] = useState('')
  const [addError, setAddError] = useState<string | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState('')
  const [editWeight, setEditWeight] = useState(0)
  const [editError, setEditError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const criteria = projectCriteria.length > 0 ? projectCriteria : defaultCriteria
  const usingDefaults = projectCriteria.length === 0
  const totalWeight = criteria.reduce((s, c) => s + c.weight, 0)

  function handleAdd(e: React.FormEvent): void {
    e.preventDefault()
    setAddError(null)
    startTransition(async () => {
      const result = await addProjectCriterion(projectId, { label: addLabel, weight: addWeight, description: addDescription })
      if (result.success) {
        setAddLabel('')
        setAddWeight(20)
        setAddDescription('')
      } else {
        setAddError(result.error ?? 'Erreur')
      }
    })
  }

  function handleEdit(c: Criterion): void {
    setEditId(c.id)
    setEditLabel(c.label)
    setEditWeight(c.weight)
    setEditError(null)
  }

  function handleSaveEdit(c: Criterion): void {
    setEditError(null)
    startTransition(async () => {
      const result = await updateProjectCriterion(c.id, projectId, { label: editLabel, weight: editWeight })
      if (result.success) {
        setEditId(null)
      } else {
        setEditError(result.error ?? 'Erreur')
      }
    })
  }

  function handleDelete(criterionId: string): void {
    startTransition(async () => {
      await deleteProjectCriterion(criterionId, projectId)
    })
  }

  return (
    <div className="space-y-4">
      {/* Statut */}
      {usingDefaults ? (
        <div className="bg-blue-950/20 border border-blue-800/40 rounded-xl p-4">
          <p className="text-sm text-blue-300 font-medium">Critères par défaut actifs</p>
          <p className="text-xs text-gray-400 mt-1">
            Ce projet utilise les critères globaux. Ajoutez un critère spécifique pour personnaliser l&apos;évaluation.
          </p>
        </div>
      ) : (
        <div className="bg-green-950/20 border border-green-800/40 rounded-xl p-3">
          <p className="text-xs text-green-400 font-medium">
            {projectCriteria.length} critère{projectCriteria.length > 1 ? 's' : ''} personnalisé{projectCriteria.length > 1 ? 's' : ''} ·{' '}
            <span className={totalWeight === 100 ? 'text-green-400' : 'text-yellow-400'}>
              Poids total : {totalWeight}% {totalWeight === 100 ? '✓' : '(doit être 100%)'}
            </span>
          </p>
        </div>
      )}

      {/* Liste critères */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl divide-y divide-gray-800">
        {criteria.map((c) => (
          <div key={c.id} className="px-4 py-3">
            {editId === c.id ? (
              <div className="flex items-center gap-2">
                <input
                  value={editLabel}
                  onChange={(e) => { setEditLabel(e.target.value) }}
                  className="flex-1 text-sm bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white focus:border-blue-500 focus:outline-none"
                />
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={editWeight}
                    onChange={(e) => { setEditWeight(parseInt(e.target.value) || 0) }}
                    className="w-16 text-sm bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white focus:border-blue-500 focus:outline-none"
                  />
                  <span className="text-xs text-gray-500">%</span>
                </div>
                <button
                  type="button"
                  onClick={() => { handleSaveEdit(c) }}
                  disabled={isPending}
                  className="text-xs text-green-400 hover:text-green-300"
                >
                  ✓
                </button>
                <button
                  type="button"
                  onClick={() => { setEditId(null) }}
                  className="text-xs text-gray-500 hover:text-gray-300"
                >
                  ✕
                </button>
                {editError && <span className="text-xs text-red-400">{editError}</span>}
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <p className="text-sm text-white">{c.label}</p>
                  {c.description && <p className="text-xs text-gray-500 mt-0.5">{c.description}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn('text-xs font-semibold', totalWeight === 100 ? 'text-gray-400' : 'text-yellow-400')}>
                    {c.weight}%
                  </span>
                  {!usingDefaults && (
                    <>
                      <button type="button" onClick={() => { handleEdit(c) }} className="text-xs text-gray-500 hover:text-blue-400">
                        Modifier
                      </button>
                      <button
                        type="button"
                        onClick={() => { handleDelete(c.id) }}
                        disabled={isPending}
                        className="text-xs text-gray-500 hover:text-red-400"
                      >
                        Supprimer
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Ajouter un critère */}
      <form onSubmit={handleAdd} className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-medium text-gray-300">
          {usingDefaults ? 'Ajouter un critère personnalisé' : 'Ajouter un critère'}
        </h3>
        <div className="flex gap-2">
          <input
            value={addLabel}
            onChange={(e) => { setAddLabel(e.target.value) }}
            placeholder="Libellé du critère"
            required
            className="flex-1 text-sm bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          />
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={1}
              max={100}
              value={addWeight}
              onChange={(e) => { setAddWeight(parseInt(e.target.value) || 20) }}
              className="w-16 text-sm bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-white focus:border-blue-500 focus:outline-none"
            />
            <span className="text-xs text-gray-500">%</span>
          </div>
        </div>
        <input
          value={addDescription}
          onChange={(e) => { setAddDescription(e.target.value) }}
          placeholder="Description (optionnelle)"
          className="w-full text-sm bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
        />
        {addError && <p className="text-sm text-red-400">{addError}</p>}
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
        >
          {isPending ? 'Ajout…' : 'Ajouter'}
        </button>
      </form>
    </div>
  )
}
