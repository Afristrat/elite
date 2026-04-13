'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type ActionResult<T = undefined> = {
  success: boolean
  error?: string
  data?: T
}

export type AARResponseData = {
  what_intended: string      // Ce qui était prévu
  what_happened: string      // Ce qui s'est passé
  why_the_difference: string // Pourquoi la différence
  what_to_do_differently: string // Ce que nous ferions différemment
}

export async function submitAARResponse(
  projectId: string,
  data: AARResponseData,
): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Non authentifié' }

  // Validation minimale
  for (const [key, value] of Object.entries(data)) {
    if (value.trim().length < 10) {
      return { success: false, error: `Le champ "${key}" est trop court (min. 10 caractères)` }
    }
  }

  // Vérifier que le projet est décidé
  const { data: project } = await supabase
    .from('projects')
    .select('id, status')
    .eq('id', projectId)
    .single()

  if (!project) return { success: false, error: 'Projet introuvable' }
  if (!['decided', 'archived'].includes(project.status)) {
    return { success: false, error: 'L\'AAR est disponible uniquement après la décision du comité' }
  }

  // Vérifier si déjà soumis
  const { data: existing } = await supabase
    .from('aar_responses')
    .select('id')
    .eq('project_id', projectId)
    .eq('filled_by', user.id)
    .single()

  if (existing) {
    // Mettre à jour la réponse existante
    const { error } = await supabase
      .from('aar_responses')
      .update({ responses: data })
      .eq('id', existing.id)

    if (error) return { success: false, error: 'Impossible de mettre à jour l\'AAR' }
  } else {
    // Créer une nouvelle réponse
    const { error } = await supabase
      .from('aar_responses')
      .insert({
        project_id: projectId,
        filled_by: user.id,
        responses: data,
      })

    if (error) return { success: false, error: 'Impossible de soumettre l\'AAR' }
  }

  revalidatePath(`/projects/${projectId}/aar`)
  return { success: true }
}
