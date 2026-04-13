'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type ActionResult<T = undefined> = { success: boolean; error?: string; data?: T }

export async function createThesis(input: {
  title: string
  description?: string
  horizon?: string | null
}): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Non authentifié' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { success: false, error: 'Action réservée aux administrateurs' }
  }

  const title = input.title.trim()
  if (!title || title.length < 5) {
    return { success: false, error: 'Le titre doit faire au moins 5 caractères' }
  }

  const { data, error } = await supabase
    .from('portfolio_theses')
    .insert({
      title,
      description: input.description?.trim() || null,
      horizon: (input.horizon as 'H1' | 'H2' | 'H3' | null) ?? null,
      created_by: user.id,
      status: 'active',
    })
    .select('id')
    .single()

  if (error || !data) {
    return { success: false, error: 'Impossible de créer la thèse' }
  }

  revalidatePath('/admin/theses')
  return { success: true, data: { id: data.id } }
}

export async function archiveThesis(thesisId: string): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Non authentifié' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { success: false, error: 'Action réservée aux administrateurs' }
  }

  const { error } = await supabase
    .from('portfolio_theses')
    .update({ status: 'archived' })
    .eq('id', thesisId)

  if (error) {
    return { success: false, error: 'Impossible d\'archiver la thèse' }
  }

  revalidatePath('/admin/theses')
  return { success: true }
}
