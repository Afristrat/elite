import { createServiceClient } from '@/lib/supabase/server'
import { InvitationsManager } from './invitations-manager'

export default async function AdminInvitationsPage(): Promise<React.JSX.Element> {
  const service = await createServiceClient()

  const { data: invitations } = await service
    .from('invitations')
    .select('*, profiles!invitations_invited_by_fkey(full_name, email)')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Invitations</h1>
        <p className="text-gray-400 text-sm mt-1">
          Gérez les invitations envoyées aux membres du groupe
        </p>
      </div>

      <InvitationsManager invitations={invitations ?? []} />
    </div>
  )
}
