'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type ActionResult = { success: boolean; error?: string }

/**
 * Sauvegarde les poids AHP calculés sur les critères par défaut (project_id IS NULL).
 * weights: Record<criterionId, percentage (entier)>
 * La somme des poids doit être exactement 100.
 */
export async function saveAHPWeights(weights: Record<string, number>): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Non authentifié' }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { success: false, error: 'Accès réservé aux administrateurs' }

  // Vérifier que la somme = 100
  const total = Object.values(weights).reduce((a, b) => a + b, 0)
  if (Math.abs(total - 100) > 1) {
    return { success: false, error: `La somme des poids doit être 100 (actuelle : ${total})` }
  }

  // Mettre à jour chaque critère par défaut
  const updates = Object.entries(weights)
  for (const [criterionId, weight] of updates) {
    const { error } = await supabase
      .from('evaluation_criteria')
      .update({ weight })
      .eq('id', criterionId)
      .is('project_id', null)

    if (error) {
      return { success: false, error: `Impossible de mettre à jour le critère ${criterionId}` }
    }
  }

  revalidatePath('/analytics/ahp')
  revalidatePath('/settings')
  return { success: true }
}
