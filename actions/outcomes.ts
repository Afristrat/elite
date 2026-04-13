'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type ActionResult<T = undefined> = {
  success: boolean
  error?: string
  data?: T
}

export type OutcomeEntry = {
  id: string
  who_changed: string         // Quel acteur a changé
  what_changed: string        // Quelle pratique/comportement a changé
  why_significant: string     // Pourquoi c'est important
  contributed_by: string      // Ce qui y a contribué
  captured_at: string
  captured_by: string
}

export async function addOutcome(
  projectId: string,
  data: Pick<OutcomeEntry, 'who_changed' | 'what_changed' | 'why_significant' | 'contributed_by'>,
): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Non authentifié' }

  for (const [key, value] of Object.entries(data)) {
    if (value.trim().length < 5) {
      return { success: false, error: `Le champ "${key}" est trop court` }
    }
  }

  // Vérifier que le projet est décidé et accessible
  const { data: project } = await supabase
    .from('projects')
    .select('id, status, outcomes')
    .eq('id', projectId)
    .single()

  if (!project) return { success: false, error: 'Projet introuvable' }
  if (!['decided', 'archived'].includes(project.status)) {
    return { success: false, error: 'L\'Outcome Harvesting est disponible après la décision' }
  }

  const existing = (project.outcomes as OutcomeEntry[] | null) ?? []
  const newEntry: OutcomeEntry = {
    id: crypto.randomUUID(),
    ...data,
    captured_at: new Date().toISOString(),
    captured_by: user.id,
  }

  const { error } = await supabase
    .from('projects')
    .update({ outcomes: [...existing, newEntry] })
    .eq('id', projectId)

  if (error) return { success: false, error: 'Impossible d\'enregistrer l\'outcome' }

  revalidatePath(`/projects/${projectId}/outcomes`)
  return { success: true }
}
