import { createServiceClient, createClient } from '@/lib/supabase/server'
import { MembersManager } from './members-manager'

export default async function AdminMembersPage(): Promise<React.JSX.Element> {
  const supabase = await createClient()
  const service = await createServiceClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: members } = await service
    .from('profiles')
    .select('id, full_name, email, role, status, created_at, avatar_url, whatsapp_number')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Membres</h1>
        <p className="text-gray-400 text-sm mt-1">
          {members?.length ?? 0} membre{(members?.length ?? 0) > 1 ? 's' : ''} dans le groupe
        </p>
      </div>

      <MembersManager members={members ?? []} currentUserId={user!.id} />
    </div>
  )
}
