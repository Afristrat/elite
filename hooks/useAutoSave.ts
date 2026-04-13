'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error'

type UseAutoSaveOptions<T> = {
  data: T
  onSave: (data: T) => Promise<{ success: boolean; error?: string; data?: { id: string } }>
  delay?: number
  enabled?: boolean
  onIdReceived?: (id: string) => void
}

type UseAutoSaveReturn = {
  status: AutoSaveStatus
  lastSaved: Date | null
  saveNow: () => void
}

export function useAutoSave<T>({
  data,
  onSave,
  delay = 30_000,
  enabled = true,
  onIdReceived,
}: UseAutoSaveOptions<T>): UseAutoSaveReturn {
  const [status, setStatus] = useState<AutoSaveStatus>('idle')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isSavingRef = useRef(false)
  const dataRef = useRef(data)

  // Garder la référence des données à jour sans relancer l'effet
  useEffect(() => {
    dataRef.current = data
  }, [data])

  const save = useCallback(async () => {
    if (isSavingRef.current) return
    isSavingRef.current = true
    setStatus('saving')

    try {
      const result = await onSave(dataRef.current)
      if (result.success) {
        setStatus('saved')
        setLastSaved(new Date())
        if (result.data?.id) {
          onIdReceived?.(result.data.id)
        }
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    } finally {
      isSavingRef.current = false
    }
  }, [onSave, onIdReceived])

  // Planifier l'auto-save à chaque changement de données
  useEffect(() => {
    if (!enabled) return

    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(() => {
      void save()
    }, delay)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [data, delay, enabled, save])

  // Sauvegarder avant de quitter la page
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (enabled) void save()
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [enabled, save])

  return {
    status,
    lastSaved,
    saveNow: save,
  }
}
