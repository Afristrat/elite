'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type ActionResult<T = undefined> = {
  success: boolean
  error?: string
  data?: T
}

// ─── Ajouter un critère personnalisé ─────────────────────────────────────────

export async function addProjectCriterion(
  projectId: string,
  data: { label: string; weight: number; description?: string },
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Non authentifié' }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { success: false, error: 'Accès réservé aux administrateurs' }

  if (!data.label.trim()) return { success: false, error: 'Le libellé est requis' }
  if (data.weight <= 0 || data.weight > 100) return { success: false, error: 'Le poids doit être entre 1 et 100' }

  // Calculer l'order_index suivant
  const { data: existing } = await supabase
    .from('evaluation_criteria')
    .select('order_index')
    .eq('project_id', projectId)
    .order('order_index', { ascending: false })
    .limit(1)

  const nextIndex = (existing?.[0]?.order_index ?? 0) + 1

  const { data: inserted, error } = await supabase
    .from('evaluation_criteria')
    .insert({
      project_id: projectId,
      label: data.label.trim(),
      weight: data.weight,
      description: data.description?.trim() || null,
      order_index: nextIndex,
    })
    .select('id')
    .single()

  if (error) return { success: false, error: 'Impossible d\'ajouter le critère' }

  revalidatePath(`/projects/${projectId}/criteria`)
  return { success: true, data: { id: inserted.id } }
}

// ─── Mettre à jour un critère ─────────────────────────────────────────────────

export async function updateProjectCriterion(
  criterionId: string,
  projectId: string,
  data: { label?: string; weight?: number; description?: string },
): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Non authentifié' }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { success: false, error: 'Accès réservé aux administrateurs' }

  if (data.weight !== undefined && (data.weight <= 0 || data.weight > 100)) {
    return { success: false, error: 'Le poids doit être entre 1 et 100' }
  }

  const { error } = await supabase
    .from('evaluation_criteria')
    .update({
      label: data.label?.trim(),
      weight: data.weight,
      description: data.description?.trim() ?? null,
    })
    .eq('id', criterionId)
    .eq('project_id', projectId)

  if (error) return { success: false, error: 'Impossible de mettre à jour le critère' }

  revalidatePath(`/projects/${projectId}/criteria`)
  return { success: true }
}

// ─── Supprimer un critère personnalisé ────────────────────────────────────────

export async function deleteProjectCriterion(
  criterionId: string,
  projectId: string,
): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Non authentifié' }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { success: false, error: 'Accès réservé aux administrateurs' }

  // S'assurer de ne supprimer que des critères spécifiques au projet (pas les defaults)
  const { error } = await supabase
    .from('evaluation_criteria')
    .delete()
    .eq('id', criterionId)
    .eq('project_id', projectId)

  if (error) return { success: false, error: 'Impossible de supprimer le critère' }

  revalidatePath(`/projects/${projectId}/criteria`)
  return { success: true }
}
