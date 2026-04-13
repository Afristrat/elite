'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProjectDraftSchema, ProjectSubmitSchema } from '@/lib/validators/project'
import type { ProjectDraftInput, ProjectSubmitInput } from '@/lib/validators/project'

type ActionResult<T = undefined> = {
  success: boolean
  error?: string
  data?: T
}

// ─── Sauvegarder brouillon ───────────────────────────────────────────────────

export async function saveDraft(
  projectId: string | null,
  input: ProjectDraftInput,
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Non authentifié' }

  const parsed = ProjectDraftSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Données invalides',
    }
  }

  const payload = {
    title: parsed.data.title,
    sector: parsed.data.sector ?? null,
    tags: parsed.data.tags ?? null,
    horizon: parsed.data.horizon ?? null,
    barbell_category: parsed.data.barbell_category ?? null,
    description: parsed.data.description ?? null,
    market_research: parsed.data.market_research ?? null,
    scenarios: parsed.data.scenarios ?? null,
    moic_target: parsed.data.moic_target ?? null,
    investment_thesis: parsed.data.investment_thesis ?? null,
    evaluation_deadline: parsed.data.evaluation_deadline ?? null,
    thesis_ids: parsed.data.thesis_ids ?? null,
    proposant_id: user.id,
    status: 'draft' as const,
  }

  if (projectId) {
    // Vérifier que le projet appartient bien à l'utilisateur courant (RLS le fera aussi)
    const { data, error } = await supabase
      .from('projects')
      .update(payload)
      .eq('id', projectId)
      .eq('proposant_id', user.id)
      .eq('status', 'draft')
      .select('id')
      .single()

    if (error || !data) {
      return { success: false, error: 'Impossible de sauvegarder le brouillon' }
    }

    return { success: true, data: { id: data.id } }
  } else {
    // Nouveau projet
    const { data, error } = await supabase
      .from('projects')
      .insert(payload)
      .select('id')
      .single()

    if (error || !data) {
      return { success: false, error: 'Impossible de créer le brouillon' }
    }

    return { success: true, data: { id: data.id } }
  }
}

// ─── Soumettre le projet pour évaluation ─────────────────────────────────────

export async function submitProject(
  projectId: string,
  input: ProjectSubmitInput,
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Non authentifié' }

  const parsed = ProjectSubmitSchema.safeParse(input)
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]
    return {
      success: false,
      error: firstError?.message ?? 'Formulaire invalide — vérifiez tous les champs',
    }
  }

  // Récupérer le paramètre de prémortem depuis les settings
  const { data: premortemSetting } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'premortem_enabled')
    .single()

  const premortemEnabled = premortemSetting?.value === true

  const newStatus = premortemEnabled ? 'pre-mortem' : 'open'

  const { data, error } = await supabase
    .from('projects')
    .update({
      title: parsed.data.title,
      sector: parsed.data.sector,
      tags: parsed.data.tags ?? null,
      horizon: parsed.data.horizon,
      barbell_category: parsed.data.barbell_category,
      description: parsed.data.description ?? null,
      market_research: parsed.data.market_research,
      scenarios: parsed.data.scenarios,
      moic_target: parsed.data.moic_target,
      investment_thesis: parsed.data.investment_thesis,
      evaluation_deadline: parsed.data.evaluation_deadline,
      thesis_ids: parsed.data.thesis_ids ?? null,
      status: newStatus,
    })
    .eq('id', projectId)
    .eq('proposant_id', user.id)
    .eq('status', 'draft')
    .select('id')
    .single()

  if (error || !data) {
    return {
      success: false,
      error: 'Impossible de soumettre le projet. Vérifiez qu\'il est bien en brouillon.',
    }
  }

  revalidatePath('/projects')

  redirect(`/projects/${data.id}`)
}

// ─── Archiver un projet ───────────────────────────────────────────────────────

export async function archiveProject(
  projectId: string,
): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Non authentifié' }

  // Vérifier le rôle admin (la décision d'archiver est réservée à l'admin)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { success: false, error: 'Action réservée aux administrateurs' }
  }

  const { error } = await supabase
    .from('projects')
    .update({ status: 'archived' })
    .eq('id', projectId)
    .in('status', ['decided'])

  if (error) {
    return { success: false, error: 'Impossible d\'archiver ce projet' }
  }

  revalidatePath('/projects')
  return { success: true }
}
