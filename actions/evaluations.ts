'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { EvaluationSchema } from '@/lib/validators/evaluation'
import type { EvaluationInput } from '@/lib/validators/evaluation'

type ActionResult<T = undefined> = {
  success: boolean
  error?: string
  data?: T
}

export async function submitEvaluation(
  projectId: string,
  input: EvaluationInput,
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Non authentifié' }

  // Vérification du rôle côté serveur
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'contributeur') {
    return { success: false, error: 'Les contributeurs ne peuvent pas évaluer les projets' }
  }

  // Vérifier que le projet est ouvert et que l'utilisateur n'est pas le proposant
  const { data: project } = await supabase
    .from('projects')
    .select('status, proposant_id, quorum_required')
    .eq('id', projectId)
    .single()

  if (!project) return { success: false, error: 'Projet introuvable' }

  if (project.status !== 'open') {
    return { success: false, error: 'Ce projet n\'est plus ouvert à l\'évaluation' }
  }

  if (project.proposant_id === user.id) {
    return {
      success: false,
      error: 'Vous ne pouvez pas évaluer votre propre projet (règle d\'indépendance)',
    }
  }

  // Vérifier qu'il n'a pas déjà évalué (double protection — la DB a une contrainte UNIQUE)
  const { data: existing } = await supabase
    .from('evaluations')
    .select('id')
    .eq('project_id', projectId)
    .eq('evaluateur_id', user.id)
    .single()

  if (existing) {
    return { success: false, error: 'Vous avez déjà soumis une évaluation pour ce projet' }
  }

  // Valider le payload
  const parsed = EvaluationSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Données d\'évaluation invalides',
    }
  }

  // Insérer l'évaluation
  const { data: evaluation, error: insertError } = await supabase
    .from('evaluations')
    .insert({
      project_id: projectId,
      evaluateur_id: user.id,
      scores: parsed.data.scores,
      commentary: parsed.data.commentary,
      red_team: parsed.data.red_team ?? null,
    })
    .select('id')
    .single()

  if (insertError || !evaluation) {
    // La contrainte UNIQUE peut déclencher une erreur 23505
    if (insertError?.code === '23505') {
      return { success: false, error: 'Vous avez déjà soumis une évaluation pour ce projet' }
    }
    return { success: false, error: 'Erreur lors de la soumission de l\'évaluation' }
  }

  // Vérifier si le quorum est atteint
  const { count } = await supabase
    .from('evaluations')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', projectId)

  const evaluationCount = count ?? 0
  const quorumReached = evaluationCount >= project.quorum_required

  if (quorumReached) {
    // Fermer le projet
    await supabase
      .from('projects')
      .update({ status: 'closed' })
      .eq('id', projectId)
      .eq('status', 'open')
  }

  revalidatePath(`/projects/${projectId}`)
  revalidatePath(`/projects/${projectId}/results`)

  return { success: true, data: { id: evaluation.id } }
}
