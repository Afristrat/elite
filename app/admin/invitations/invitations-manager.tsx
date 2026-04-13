'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { createInvitation, revokeInvitation, resendInvitation } from '@/actions/invitations'
import type { Database } from '@/types/database'

type UserRole = Database['public']['Enums']['user_role']

type InvitationRow = {
  id: string
  email: string
  role: UserRole
  token: string
  created_at: string
  expires_at: string
  accepted_at: string | null
  invited_by: string
  profiles: {
    full_name: string | null
    email: string
  } | null
}

type InvitationsManagerProps = {
  invitations: InvitationRow[]
}

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  evaluateur: 'Évaluateur',
  contributeur: 'Contributeur',
}

const ROLE_COLORS: Record<UserRole, string> = {
  admin: 'bg-purple-600/20 text-purple-300',
  evaluateur: 'bg-blue-600/20 text-blue-300',
  contributeur: 'bg-green-600/20 text-green-300',
}

function getInviteStatus(invitation: InvitationRow): 'accepted' | 'expired' | 'active' {
  if (invitation.accepted_at) return 'accepted'
  if (new Date(invitation.expires_at) < new Date()) return 'expired'
  return 'active'
}

export function InvitationsManager({ invitations }: InvitationsManagerProps): React.JSX.Element {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<UserRole>('evaluateur')
  const [isCreating, setIsCreating] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [localInvitations, setLocalInvitations] = useState(invitations)

  const handleCreate = async () => {
    if (!email.trim()) {
      toast.error('Saisissez une adresse email')
      return
    }

    setIsCreating(true)
    const result = await createInvitation(email.trim().toLowerCase(), role)
    setIsCreating(false)

    if (!result.success) {
      toast.error(result.error ?? 'Erreur lors de la création')
      return
    }

    toast.success('Invitation créée')
    setEmail('')

    // Copier le lien automatiquement
    if (result.data?.inviteUrl) {
      await navigator.clipboard.writeText(result.data.inviteUrl).catch(() => null)
      toast.info('Lien copié dans le presse-papier')
    }
  }

  const handleCopyLink = async (inviteUrl: string, id: string) => {
    await navigator.clipboard.writeText(inviteUrl).catch(() => null)
    setCopiedId(id)
    toast.success('Lien copié')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleRevoke = async (id: string) => {
    const result = await revokeInvitation(id)
    if (!result.success) {
      toast.error(result.error ?? 'Erreur lors de la révocation')
      return
    }
    toast.success('Invitation révoquée')
    setLocalInvitations((prev) =>
      prev.map((inv) =>
        inv.id === id ? { ...inv, expires_at: new Date().toISOString() } : inv,
      ),
    )
  }

  const handleResend = async (id: string) => {
    const result = await resendInvitation(id)
    if (!result.success) {
      toast.error(result.error ?? 'Erreur')
      return
    }
    toast.success('Invitation prolongée (7 jours)')
    if (result.data?.inviteUrl) {
      await navigator.clipboard.writeText(result.data.inviteUrl).catch(() => null)
      toast.info('Nouveau lien copié')
    }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''

  return (
    <div className="space-y-6">
      {/* Formulaire de création */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-200">Inviter un nouveau membre</h2>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') void handleCreate() }}
            placeholder="adresse@email.com"
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />

          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
          >
            <option value="evaluateur">Évaluateur</option>
            <option value="contributeur">Contributeur</option>
            <option value="admin">Admin</option>
          </select>

          <button
            type="button"
            onClick={() => void handleCreate()}
            disabled={isCreating || !email.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {isCreating ? 'Création…' : 'Créer et copier le lien'}
          </button>
        </div>

        <p className="text-xs text-gray-500">
          Le lien d&apos;invitation sera valide 7 jours. La personne devra se connecter avec Google
          en utilisant exactement l&apos;email indiqué.
        </p>
      </div>

      {/* Liste des invitations */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-200">
            Invitations ({localInvitations.length})
          </h2>
        </div>

        {localInvitations.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
            <p className="text-gray-500 text-sm">Aucune invitation pour l&apos;instant</p>
          </div>
        ) : (
          <div className="space-y-2">
            {localInvitations.map((invitation) => {
              const status = getInviteStatus(invitation)
              const inviteUrl = `${appUrl}/invite/${invitation.token}`
              const invitedBy = invitation.profiles?.full_name ?? invitation.profiles?.email ?? 'Admin'
              const expiresAt = new Date(invitation.expires_at)

              return (
                <div
                  key={invitation.id}
                  className={cn(
                    'bg-gray-900 border rounded-xl p-4 flex items-center justify-between gap-4',
                    status === 'active' ? 'border-gray-800' : 'border-gray-800/50 opacity-60',
                  )}
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-gray-200 truncate">{invitation.email}</span>
                      <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', ROLE_COLORS[invitation.role])}>
                        {ROLE_LABELS[invitation.role]}
                      </span>
                      <span
                        className={cn(
                          'text-xs px-2 py-0.5 rounded-full font-medium',
                          status === 'accepted' && 'bg-green-600/20 text-green-300',
                          status === 'active' && 'bg-blue-600/20 text-blue-300',
                          status === 'expired' && 'bg-gray-700 text-gray-400',
                        )}
                      >
                        {status === 'accepted' ? 'Acceptée' : status === 'active' ? 'Active' : 'Expirée'}
                      </span>
                    </div>

                    <div className="text-xs text-gray-500 space-x-3">
                      <span>Invité par {invitedBy}</span>
                      {status === 'active' && (
                        <span>Expire le {expiresAt.toLocaleDateString('fr-FR')}</span>
                      )}
                      {status === 'accepted' && invitation.accepted_at && (
                        <span>
                          Acceptée le{' '}
                          {new Date(invitation.accepted_at).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                    </div>
                  </div>

                  {status === 'active' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => void handleCopyLink(inviteUrl, invitation.id)}
                        className="text-xs px-2.5 py-1.5 border border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-600 rounded-lg transition-colors"
                      >
                        {copiedId === invitation.id ? '✓ Copié' : 'Copier le lien'}
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleResend(invitation.id)}
                        className="text-xs px-2.5 py-1.5 border border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-600 rounded-lg transition-colors"
                      >
                        Prolonger
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleRevoke(invitation.id)}
                        className="text-xs px-2.5 py-1.5 border border-red-900 text-red-500 hover:text-red-400 hover:border-red-700 rounded-lg transition-colors"
                      >
                        Révoquer
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
