import { createClient } from '@/lib/supabase/server'
import { ApiKeysManager } from './api-keys-manager'

export default async function ApiKeysPage(): Promise<React.JSX.Element> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user!.id)
    .single()

  const { data: apiKeys } = await supabase
    .from('api_keys')
    .select('id, provider, label, key_preview, is_global, last_used_at, created_at')
    .eq('owner_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Clés API</h1>
        <p className="text-gray-400 text-sm mt-1">
          Gérez vos clés pour les intégrations IA (OpenAI, Anthropic, Perplexity)
        </p>
      </div>

      <ApiKeysManager
        apiKeys={apiKeys ?? []}
        isAdmin={profile?.role === 'admin'}
      />
    </div>
  )
}
