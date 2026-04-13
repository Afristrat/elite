import { createCrypto } from './crypto'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'

type ApiProvider = Database['public']['Enums']['api_provider']

// ─── Hash SHA-256 d'une clé API ───────────────────────────────────────────────

export async function hashApiKey(key: string): Promise<string> {
  const crypto = createCrypto()
  return crypto.sha256(key)
}

// ─── Preview (8 premiers + derniers caractères) ───────────────────────────────

export function buildKeyPreview(key: string): string {
  if (key.length <= 16) return key.slice(0, 4) + '…'
  return `${key.slice(0, 8)}…${key.slice(-4)}`
}

// ─── Récupérer la clé en clair depuis Supabase (impossible — on renvoie null) ─

/**
 * Récupère la clé API effective pour un utilisateur et un provider.
 * Ordre de priorité : clé personnelle → clé globale admin
 * IMPORTANT : les clés sont hashées en DB — elles ne peuvent PAS être récupérées en clair.
 * Cette fonction retourne null si aucune clé n'est configurée.
 * Pour l'usage réel, la clé doit venir de l'environnement ou être soumise par l'utilisateur.
 */
export async function hasApiKey(
  userId: string,
  provider: ApiProvider,
): Promise<boolean> {
  const supabase = await createClient()

  // Vérifier clé personnelle
  const { data: personalKey } = await supabase
    .from('api_keys')
    .select('id')
    .eq('owner_id', userId)
    .eq('provider', provider)
    .eq('is_global', false)
    .limit(1)
    .single()

  if (personalKey) return true

  // Vérifier clé globale
  const { data: globalKey } = await supabase
    .from('api_keys')
    .select('id')
    .eq('provider', provider)
    .eq('is_global', true)
    .limit(1)
    .single()

  return !!globalKey
}
