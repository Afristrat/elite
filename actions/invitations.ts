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

// ─── Créer une invitation ─────────────────────────────────────────────────────

export async function createInvitation(
  email: string,
  role: UserRole,
): Promise<ActionResult<{ token: string; inviteUrl: string }>> {
  const supabase = await createClient()
  const service = await createServiceClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Non authentifié' }

  // Vérifier le rôle admin côté serveur
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { success: false, error: 'Action réservée aux administrateurs' }
  }

  // Valider l'email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { success: false, error: 'Adresse email invalide' }
  }

  if (!['admin', 'evaluateur', 'contributeur'].includes(role)) {
    return { success: false, error: 'Rôle invalide' }
  }

  // Vérifier que l'email n'est pas déjà membre actif
  const { data: existingProfile } = await service
    .from('profiles')
    .select('id, status')
    .eq('email', email)
    .single()

  if (existingProfile?.status === 'active') {
    return { success: false, error: 'Cet email est déjà membre de la plateforme' }
  }

  // Vérifier qu'il n'y a pas déjà une invitation active non acceptée
  const { data: existingInvite } = await service
    .from('invitations')
    .select('id, expires_at, accepted_at')
    .eq('email', email)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (existingInvite) {
    return {
      success: false,
      error: 'Une invitation active existe déjà pour cet email — révoquez-la avant d\'en créer une nouvelle',
    }
  }

  // Créer l'invitation (le token est généré par la DB via gen_random_uuid())
  const { data: invitation, error } = await service
    .from('invitations')
    .insert({
      email,
      role,
      invited_by: user.id,
    })
    .select('token')
    .single()

  if (error || !invitation) {
    return { success: false, error: 'Impossible de créer l\'invitation' }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const inviteUrl = `${appUrl}/invite/${invitation.token}`

  revalidatePath('/admin/invitations')
  return { success: true, data: { token: invitation.token, inviteUrl } }
}

// ─── Révoquer une invitation ──────────────────────────────────────────────────

export async function revokeInvitation(
  invitationId: string,
): Promise<ActionResult> {
  const supabase = await createClient()
  const service = await createServiceClient()

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

  // Marquer l'invitation comme expirée (on ne peut pas DELETE — audit trail)
  const { error } = await service
    .from('invitations')
    .update({ expires_at: new Date().toISOString() })
    .eq('id', invitationId)
    .is('accepted_at', null) // Impossible de révoquer une invitation déjà acceptée

  if (error) {
    return { success: false, error: 'Impossible de révoquer l\'invitation' }
  }

  revalidatePath('/admin/invitations')
  return { success: true }
}

// ─── Renvoyer l'invitation (nouveau lien) ─────────────────────────────────────

export async function resendInvitation(
  invitationId: string,
): Promise<ActionResult<{ inviteUrl: string }>> {
  const supabase = await createClient()
  const service = await createServiceClient()

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

  // Récupérer l'invitation
  const { data: invitation } = await service
    .from('invitations')
    .select('*')
    .eq('id', invitationId)
    .single()

  if (!invitation) {
    return { success: false, error: 'Invitation introuvable' }
  }

  if (invitation.accepted_at) {
    return { success: false, error: 'Cette invitation a déjà été acceptée' }
  }

  // Prolonger l'expiration de 7 jours
  const newExpiry = new Date()
  newExpiry.setDate(newExpiry.getDate() + 7)

  const { error } = await service
    .from('invitations')
    .update({ expires_at: newExpiry.toISOString() })
    .eq('id', invitationId)

  if (error) {
    return { success: false, error: 'Impossible de prolonger l\'invitation' }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const inviteUrl = `${appUrl}/invite/${invitation.token}`

  revalidatePath('/admin/invitations')
  return { success: true, data: { inviteUrl } }
}
