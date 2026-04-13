'use client'

import { useState } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { updateMemberRole, updateMemberStatus, anonymizeMember } from '@/actions/members'
import type { Database } from '@/types/database'

type UserRole = Database['public']['Enums']['user_role']
type UserStatus = Database['public']['Enums']['user_status']

type MemberRow = {
  id: string
  full_name: string | null
  email: string
  role: UserRole
  status: UserStatus
  created_at: string
  avatar_url: string | null
  whatsapp_number: string | null
}

type MembersManagerProps = {
  members: MemberRow[]
  currentUserId: string
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

export function MembersManager({ members, currentUserId }: MembersManagerProps): React.JSX.Element {
  const [localMembers, setLocalMembers] = useState(members)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState<MemberRow | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState('')

  const handleRoleChange = async (memberId: string, newRole: UserRole) => {
    setLoadingId(memberId)
    const result = await updateMemberRole(memberId, newRole)
    setLoadingId(null)

    if (!result.success) {
      toast.error(result.error ?? 'Erreur lors du changement de rôle')
      return
    }

    setLocalMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m)),
    )
    toast.success('Rôle mis à jour')
  }

  const handleStatusToggle = async (member: MemberRow) => {
    const newStatus: UserStatus = member.status === 'active' ? 'suspended' : 'active'
    setLoadingId(member.id)
    const result = await updateMemberStatus(member.id, newStatus)
    setLoadingId(null)

    if (!result.success) {
      toast.error(result.error ?? 'Erreur')
      return
    }

    setLocalMembers((prev) =>
      prev.map((m) => (m.id === member.id ? { ...m, status: newStatus } : m)),
    )
    toast.success(newStatus === 'suspended' ? 'Membre suspendu' : 'Membre réactivé')
  }

  const handleAnonymize = async () => {
    if (!showDeleteModal) return

    const result = await anonymizeMember(showDeleteModal.id, deleteConfirm)
    if (!result.success) {
      toast.error(result.error ?? 'Erreur')
      return
    }

    setLocalMembers((prev) => prev.filter((m) => m.id !== showDeleteModal.id))
    setShowDeleteModal(null)
    setDeleteConfirm('')
    toast.success('Membre anonymisé et supprimé (RGPD)')
  }

  return (
    <>
      <div className="space-y-2">
        {localMembers.map((member) => {
          const isCurrentUser = member.id === currentUserId
          const displayName = member.full_name ?? member.email
          const initials = displayName.charAt(0).toUpperCase()

          return (
            <div
              key={member.id}
              className={cn(
                'bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-4',
                member.status === 'suspended' && 'opacity-60',
              )}
            >
              {/* Avatar */}
              <div className="shrink-0">
                {member.avatar_url ? (
                  <Image
                    src={member.avatar_url}
                    alt={displayName}
                    width={36}
                    height={36}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center">
                    <span className="text-gray-300 text-sm font-medium">{initials}</span>
                  </div>
                )}
              </div>

              {/* Infos */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-gray-200 truncate">{displayName}</span>
                  {isCurrentUser && (
                    <span className="text-xs text-gray-600">(vous)</span>
                  )}
                  {member.status === 'suspended' && (
                    <span className="text-xs px-2 py-0.5 bg-red-900/30 text-red-400 rounded-full">
                      Suspendu
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate">{member.email}</p>
                {member.whatsapp_number && (
                  <p className="text-xs text-gray-600">{member.whatsapp_number}</p>
                )}
              </div>

              {/* Rôle */}
              {isCurrentUser ? (
                <span className={cn('text-xs px-2 py-1 rounded-full font-medium shrink-0', ROLE_COLORS[member.role])}>
                  {ROLE_LABELS[member.role]}
                </span>
              ) : (
                <select
                  value={member.role}
                  onChange={(e) => void handleRoleChange(member.id, e.target.value as UserRole)}
                  disabled={loadingId === member.id}
                  className="text-xs bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 shrink-0"
                >
                  <option value="evaluateur">Évaluateur</option>
                  <option value="contributeur">Contributeur</option>
                  <option value="admin">Admin</option>
                </select>
              )}

              {/* Actions */}
              {!isCurrentUser && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => void handleStatusToggle(member)}
                    disabled={loadingId === member.id}
                    className={cn(
                      'text-xs px-2.5 py-1.5 border rounded-lg transition-colors disabled:opacity-50',
                      member.status === 'active'
                        ? 'border-yellow-900 text-yellow-500 hover:text-yellow-400 hover:border-yellow-700'
                        : 'border-green-900 text-green-500 hover:text-green-400 hover:border-green-700',
                    )}
                  >
                    {member.status === 'active' ? 'Suspendre' : 'Réactiver'}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setShowDeleteModal(member); setDeleteConfirm('') }}
                    className="text-xs px-2.5 py-1.5 border border-red-900 text-red-500 hover:text-red-400 hover:border-red-700 rounded-lg transition-colors"
                  >
                    RGPD
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Modal suppression RGPD */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 border border-red-900 rounded-xl p-6 max-w-md w-full space-y-4">
            <h2 className="text-lg font-bold text-white">Anonymisation RGPD</h2>
            <p className="text-sm text-gray-400">
              Cette action <strong className="text-red-400">anonymisera définitivement</strong> les
              données de <strong className="text-white">{showDeleteModal.full_name ?? showDeleteModal.email}</strong>.
              Les évaluations seront préservées mais le lien avec cet utilisateur sera supprimé.
            </p>
            <div className="space-y-2">
              <label className="text-xs text-gray-500 block">
                Tapez <strong className="text-red-400">SUPPRIMER DÉFINITIVEMENT</strong> pour confirmer :
              </label>
              <input
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="SUPPRIMER DÉFINITIVEMENT"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setShowDeleteModal(null); setDeleteConfirm('') }}
                className="flex-1 px-4 py-2 border border-gray-700 text-gray-400 hover:text-gray-200 rounded-lg text-sm transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => void handleAnonymize()}
                disabled={deleteConfirm !== 'SUPPRIMER DÉFINITIVEMENT'}
                className="flex-1 px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-lg text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
