'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type ActionResult<T = undefined> = {
  success: boolean
  error?: string
  data?: T
}

export type PreMortemResponse = {
  user_id: string
  failure_scenario: string
  major_risks: string
  submitted_at: string
}

// ─── Soumettre une réponse Pre-Mortem ─────────────────────────────────────────

export async function submitPreMortemResponse(
  projectId: string,
  data: { failure_scenario: string; major_risks: string },
): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Non authentifié' }

  if (data.failure_scenario.trim().length < 20) {
    return { success: false, error: 'Scénario d\'échec trop court (min. 20 caractères)' }
  }
  if (data.major_risks.trim().length < 20) {
    return { success: false, error: 'Risques majeurs trop courts (min. 20 caractères)' }
  }

  // Vérifier que le projet est en phase pre-mortem
  const { data: project } = await supabase
    .from('projects')
    .select('id, status')
    .eq('id', projectId)
    .single()

  if (!project) return { success: false, error: 'Projet introuvable' }
  if (project.status !== 'pre-mortem') {
    return { success: false, error: 'Ce projet n\'est pas en phase Pre-Mortem' }
  }

  // Récupérer ou créer l'entrée pre-mortem
  const { data: existing } = await supabase
    .from('project_premortems')
    .select('id, responses')
    .eq('project_id', projectId)
    .single()

  const newResponse: PreMortemResponse = {
    user_id: user.id,
    failure_scenario: data.failure_scenario.trim(),
    major_risks: data.major_risks.trim(),
    submitted_at: new Date().toISOString(),
  }

  if (existing) {
    // Vérifier si l'utilisateur a déjà soumis
    const responses = existing.responses as PreMortemResponse[] ?? []
    if (responses.some((r) => r.user_id === user.id)) {
      return { success: false, error: 'Vous avez déjà soumis une réponse Pre-Mortem pour ce projet' }
    }

    // Ajouter la réponse
    const { error } = await supabase
      .from('project_premortems')
      .update({ responses: [...responses, newResponse] })
      .eq('id', existing.id)

    if (error) return { success: false, error: 'Impossible de sauvegarder la réponse' }
  } else {
    // Créer l'entrée
    const { error } = await supabase
      .from('project_premortems')
      .insert({
        project_id: projectId,
        responses: [newResponse],
      })

    if (error) return { success: false, error: 'Impossible de créer la session Pre-Mortem' }
  }

  revalidatePath(`/projects/${projectId}/pre-mortem`)
  return { success: true }
}

// ─── Clôturer le Pre-Mortem et ouvrir l'évaluation (admin uniquement) ─────────

export async function closePreMortem(projectId: string): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Non authentifié' }

  // Vérifier rôle admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { success: false, error: 'Seul un administrateur peut clôturer le Pre-Mortem' }
  }

  // Vérifier état du projet
  const { data: project } = await supabase
    .from('projects')
    .select('id, status')
    .eq('id', projectId)
    .single()

  if (!project) return { success: false, error: 'Projet introuvable' }
  if (project.status !== 'pre-mortem') {
    return { success: false, error: 'Le projet n\'est pas en phase Pre-Mortem' }
  }

  // Construire l'agrégation des réponses
  const { data: preMortem } = await supabase
    .from('project_premortems')
    .select('id, responses')
    .eq('project_id', projectId)
    .single()

  const responses = (preMortem?.responses as PreMortemResponse[] ?? [])
  const aggregation = {
    total_responses: responses.length,
    failure_scenarios: responses.map((r) => r.failure_scenario),
    major_risks: responses.map((r) => r.major_risks),
    aggregated_at: new Date().toISOString(),
  }

  // Mettre à jour le pre-mortem
  if (preMortem) {
    await supabase
      .from('project_premortems')
      .update({ closed_at: new Date().toISOString(), aggregation })
      .eq('id', preMortem.id)
  }

  // Ouvrir le projet à l'évaluation
  const { error } = await supabase
    .from('projects')
    .update({ status: 'open' })
    .eq('id', projectId)

  if (error) return { success: false, error: 'Impossible d\'ouvrir l\'évaluation' }

  revalidatePath(`/projects/${projectId}`)
  revalidatePath(`/projects/${projectId}/pre-mortem`)
  return { success: true }
}
