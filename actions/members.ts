'use server'

import { revalidatePath } from 'next/cache'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'

type UserRole = Database['public']['Enums']['user_role']

type ActionResult<T = undefined> = {
  success: boolean
  error?: string
  data?: T
}

// ─── Modifier le rôle d'un membre ─────────────────────────────────────────────

export async function updateMemberRole(
  memberId: string,
  newRole: UserRole,
): Promise<ActionResult> {
  const supabase = await createClient()
  const service = await createServiceClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Non authentifié' }

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (adminProfile?.role !== 'admin') {
    return { success: false, error: 'Action réservée aux administrateurs' }
  }

  // L'admin ne peut pas modifier son propre rôle
  if (memberId === user.id) {
    return { success: false, error: 'Vous ne pouvez pas modifier votre propre rôle' }
  }

  if (!['admin', 'evaluateur', 'contributeur'].includes(newRole)) {
    return { success: false, error: 'Rôle invalide' }
  }

  const { error } = await service
    .from('profiles')
    .update({ role: newRole })
    .eq('id', memberId)

  if (error) {
    return { success: false, error: 'Impossible de modifier le rôle' }
  }

  revalidatePath('/admin/members')
  return { success: true }
}

// ─── Suspendre / Réactiver un membre ──────────────────────────────────────────

export async function updateMemberStatus(
  memberId: string,
  newStatus: 'active' | 'suspended',
): Promise<ActionResult> {
  const supabase = await createClient()
  const service = await createServiceClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Non authentifié' }

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (adminProfile?.role !== 'admin') {
    return { success: false, error: 'Action réservée aux administrateurs' }
  }

  if (memberId === user.id) {
    return { success: false, error: 'Vous ne pouvez pas vous suspendre vous-même' }
  }

  const { error } = await service
    .from('profiles')
    .update({ status: newStatus })
    .eq('id', memberId)

  if (error) {
    return { success: false, error: `Impossible de ${newStatus === 'suspended' ? 'suspendre' : 'réactiver'} ce membre` }
  }

  revalidatePath('/admin/members')
  return { success: true }
}

// ─── Anonymiser un membre (RGPD droit à l'effacement) ──────────────────────────

export async function anonymizeMember(
  memberId: string,
  confirmPhrase: string,
): Promise<ActionResult> {
  const supabase = await createClient()
  const service = await createServiceClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Non authentifié' }

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (adminProfile?.role !== 'admin') {
    return { success: false, error: 'Action réservée aux administrateurs' }
  }

  // Phrase de confirmation obligatoire pour éviter les accidents
  if (confirmPhrase !== 'SUPPRIMER DÉFINITIVEMENT') {
    return {
      success: false,
      error: 'Phrase de confirmation incorrecte. Tapez exactement : SUPPRIMER DÉFINITIVEMENT',
    }
  }

  // Anonymisation des évaluations (RGPD Art. 17) — les données agrégées sont préservées
  // Cast nécessaire car les types générés ne reflètent pas la migration 002 (evaluateur_id nullable)
  await service
    .from('evaluations')
    .update({ evaluateur_id: null as unknown as string })
    .eq('evaluateur_id', memberId)

  // Supprimer le profil
  const { error } = await service.from('profiles').delete().eq('id', memberId)

  if (error) {
    return { success: false, error: 'Erreur lors de la suppression du profil' }
  }

  revalidatePath('/admin/members')
  return { success: true }
}
