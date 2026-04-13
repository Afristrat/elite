'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

type ActionResult<T = undefined> = {
  success: boolean
  error?: string
  data?: T
}

const RealOptionSchema = z.object({
  trigger: z.string().min(10, 'Décrivez le déclencheur (min 10 caractères)'),
  trigger_date: z.string().min(1, 'Date de déclenchement requise'),
  option_value: z.number().positive('La valeur de l\'option doit être positive'),
  description: z.string().min(20, 'Description trop courte'),
})

const DecisionSchema = z.object({
  decision: z.enum(['approved', 'rejected', 'deferred']),
  rationale: z.string().min(100, 'La justification doit faire au moins 100 caractères'),
  repo_url: z.string().url('URL invalide').optional().or(z.literal('')),
  real_option_data: RealOptionSchema.optional(),
})

type DecisionInput = z.infer<typeof DecisionSchema>

export async function recordDecision(
  projectId: string,
  input: DecisionInput,
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Non authentifié' }

  // Vérification rôle admin côté serveur — jamais faire confiance au client
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { success: false, error: 'Action réservée aux administrateurs' }
  }

  // Vérifier que le projet est bien à l'état 'closed'
  const { data: project } = await supabase
    .from('projects')
    .select('status, quorum_required')
    .eq('id', projectId)
    .single()

  if (!project) return { success: false, error: 'Projet introuvable' }

  if (project.status !== 'closed') {
    return {
      success: false,
      error: 'Une décision ne peut être prise que sur un projet fermé (quorum atteint)',
    }
  }

  // Valider le payload
  const parsed = DecisionSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Formulaire invalide',
    }
  }

  // Si décision différée, real_option_data est requis
  if (parsed.data.decision === 'deferred' && !parsed.data.real_option_data) {
    return {
      success: false,
      error: 'Une décision différée nécessite de renseigner les données d\'option réelle',
    }
  }

  // INSERT dans la table decisions (INSERT ONLY — immuable)
  const { data: decision, error: insertError } = await supabase
    .from('decisions')
    .insert({
      project_id: projectId,
      made_by: user.id,
      decision: parsed.data.decision,
      rationale: parsed.data.rationale,
      real_option_data: parsed.data.real_option_data ?? null,
    })
    .select('id')
    .single()

  if (insertError || !decision) {
    return { success: false, error: 'Erreur lors de l\'enregistrement de la décision' }
  }

  // Mettre à jour le statut du projet
  await supabase
    .from('projects')
    .update({
      status: 'decided',
      decided_at: new Date().toISOString(),
      repo_url: parsed.data.repo_url || null,
    })
    .eq('id', projectId)

  revalidatePath(`/projects/${projectId}`)
  revalidatePath('/decisions')

  redirect(`/projects/${projectId}`)
}
