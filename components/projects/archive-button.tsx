'use client'

import { useState, useTransition } from 'react'
import { archiveProject } from '@/actions/projects'

type ArchiveButtonProps = {
  projectId: string
  projectTitle: string
}

export function ArchiveButton({ projectId, projectTitle }: ArchiveButtonProps): React.JSX.Element {
  const [isPending, startTransition] = useTransition()
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleArchive(): void {
    startTransition(async () => {
      const result = await archiveProject(projectId)
      if (result.success) {
        setShowConfirm(false)
        // La page sera revalidée par l'action — rechargement automatique
        window.location.reload()
      } else {
        setError(result.error ?? 'Erreur lors de l\'archivage')
      }
    })
  }

  if (!showConfirm) {
    return (
      <button
        onClick={() => { setShowConfirm(true) }}
        className="text-xs text-gray-500 hover:text-gray-300 transition-colors px-3 py-1.5 border border-gray-700 rounded-lg hover:border-gray-600"
      >
        Archiver le projet
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md w-full space-y-4">
        <h3 className="text-base font-semibold text-white">Archiver ce projet ?</h3>
        <p className="text-sm text-gray-400 leading-relaxed">
          Le projet{' '}
          <span className="text-white font-medium">{projectTitle}</span>{' '}
          sera archivé et masqué de la vue principale. Cette action est irréversible sans intervention admin en base.
        </p>

        {error && (
          <p className="text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex gap-3 justify-end">
          <button
            onClick={() => { setShowConfirm(false); setError(null) }}
            disabled={isPending}
            className="text-sm px-4 py-2 text-gray-400 hover:text-gray-200 transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleArchive}
            disabled={isPending}
            className="text-sm px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {isPending ? 'Archivage…' : 'Confirmer l\'archivage'}
          </button>
        </div>
      </div>
    </div>
  )
}
