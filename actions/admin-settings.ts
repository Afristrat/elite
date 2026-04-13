'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type ActionResult = { success: boolean; error?: string }

type SettingKey =
  | 'premortem_enabled'
  | 'quorum_default'
  | 'quorum_type_default'
  | 'max_members'
  | 'evaluation_deadline_days'
  | 'platform_name'
  | 'fast_track_enabled'
  | 'fast_track_threshold'
  | 'fast_track_quorum'

export async function updateSetting(
  key: SettingKey,
  value: boolean | number | string,
): Promise<ActionResult> {
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
    .from('settings')
    .upsert({ key, value, updated_by: user.id, updated_at: new Date().toISOString() })

  if (error) {
    return { success: false, error: 'Impossible de mettre à jour le paramètre' }
  }

  revalidatePath('/admin/settings')
  return { success: true }
}
