'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createCrypto } from '@/lib/ai/crypto'
import { buildKeyPreview } from '@/lib/ai/keys'
import { encryptApiKey } from '@/lib/ai/encrypt'
import type { Database } from '@/types/database'

type ApiProvider = Database['public']['Enums']['api_provider']

type ActionResult<T = undefined> = {
  success: boolean
  error?: string
  data?: T
}

// ─── Sauvegarder une clé API ─────────────────────────────────────────────────

export async function saveApiKey(
  key: string,
  provider: ApiProvider,
  label: string,
  isGlobal: boolean,
  model?: string,
): Promise<ActionResult<{ preview: string }>> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Non authentifié' }

  // Seul un admin peut créer des clés globales
  if (isGlobal) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return { success: false, error: 'Seul un administrateur peut créer une clé globale' }
    }
  }

  // Validation minimale de la clé
  const trimmedKey = key.trim()
  if (trimmedKey.length < 20) {
    return { success: false, error: 'La clé API semble invalide (trop courte)' }
  }

  const crypto = createCrypto()
  const keyHash = await crypto.sha256(trimmedKey)
  const keyPreview = buildKeyPreview(trimmedKey)
  const keyEncrypted = await encryptApiKey(trimmedKey)

  // Vérifier si une clé existe déjà pour ce provider + user + is_global
  const { data: existing } = await supabase
    .from('api_keys')
    .select('id')
    .eq('owner_id', user.id)
    .eq('provider', provider)
    .eq('is_global', isGlobal)
    .single()

  if (existing) {
    // Mettre à jour la clé existante
    const { error } = await supabase
      .from('api_keys')
      .update({
        key_hash: keyHash,
        key_preview: keyPreview,
        key_encrypted: keyEncrypted,
        label: label.trim() || provider,
        model: model?.trim() || null,
      })
      .eq('id', existing.id)

    if (error) {
      return { success: false, error: 'Impossible de mettre à jour la clé' }
    }
  } else {
    // Créer une nouvelle clé
    const { error } = await supabase.from('api_keys').insert({
      owner_id: user.id,
      provider,
      label: label.trim() || provider,
      key_hash: keyHash,
      key_preview: keyPreview,
      key_encrypted: keyEncrypted,
      is_global: isGlobal,
      model: model?.trim() || null,
    })

    if (error) {
      return { success: false, error: 'Impossible d\'enregistrer la clé' }
    }
  }

  revalidatePath('/settings/api-keys')
  return { success: true, data: { preview: keyPreview } }
}

// ─── Supprimer une clé API ────────────────────────────────────────────────────

export async function deleteApiKey(keyId: string): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Non authentifié' }

  // RLS garantit que l'utilisateur ne peut supprimer que ses propres clés
  const { error } = await supabase
    .from('api_keys')
    .delete()
    .eq('id', keyId)
    .eq('owner_id', user.id)

  if (error) {
    return { success: false, error: 'Impossible de supprimer la clé' }
  }

  revalidatePath('/settings/api-keys')
  return { success: true }
}

// ─── Préférences de notifications ─────────────────────────────────────────────

export type NotificationPrefs = {
  evaluation_reminder: boolean
  quorum_reached: boolean
  decision_made: boolean
  project_submitted: boolean
}

export async function updateNotificationPrefs(
  prefs: NotificationPrefs,
): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Non authentifié' }

  const { error } = await supabase
    .from('profiles')
    .update({ notification_prefs: prefs })
    .eq('id', user.id)

  if (error) {
    return { success: false, error: 'Impossible de sauvegarder les préférences' }
  }

  revalidatePath('/settings/notifications')
  return { success: true }
}

// ─── Mettre à jour le profil utilisateur ─────────────────────────────────────

export async function updateProfile(data: {
  fullName: string
  whatsappNumber: string
}): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Non authentifié' }

  const whatsapp = data.whatsappNumber.trim()

  // Validation basique du numéro WhatsApp (format international)
  if (whatsapp && !/^\+?[\d\s\-()]{8,20}$/.test(whatsapp)) {
    return { success: false, error: 'Format de numéro invalide (ex : +212 6XX XXX XXX)' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: data.fullName.trim() || null,
      whatsapp_number: whatsapp || null,
    })
    .eq('id', user.id)

  if (error) {
    return { success: false, error: 'Impossible de mettre à jour le profil' }
  }

  revalidatePath('/settings')
  return { success: true }
}
