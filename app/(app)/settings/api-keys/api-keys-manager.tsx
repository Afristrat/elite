'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { saveApiKey, deleteApiKey } from '@/actions/settings'
import type { Database } from '@/types/database'

type ApiProvider = Database['public']['Enums']['api_provider']

type ApiKeyRow = {
  id: string
  provider: ApiProvider
  label: string
  key_preview: string
  is_global: boolean
  last_used_at: string | null
  created_at: string
}

type ApiKeysManagerProps = {
  apiKeys: ApiKeyRow[]
  isAdmin: boolean
}

const PROVIDER_LABELS: Record<ApiProvider, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic (Claude)',
  perplexity: 'Perplexity',
  other: 'Autre',
}

const PROVIDER_COLORS: Record<ApiProvider, string> = {
  openai: 'text-emerald-400',
  anthropic: 'text-orange-400',
  perplexity: 'text-purple-400',
  other: 'text-gray-400',
}

export function ApiKeysManager({ apiKeys, isAdmin }: ApiKeysManagerProps): React.JSX.Element {
  const [localKeys, setLocalKeys] = useState(apiKeys)
  const [provider, setProvider] = useState<ApiProvider>('anthropic')
  const [label, setLabel] = useState('')
  const [keyValue, setKeyValue] = useState('')
  const [isGlobal, setIsGlobal] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!keyValue.trim()) {
      toast.error('Saisissez une clé API')
      return
    }

    setIsSaving(true)
    const result = await saveApiKey(keyValue, provider, label || PROVIDER_LABELS[provider], isGlobal)
    setIsSaving(false)

    if (!result.success) {
      toast.error(result.error ?? 'Erreur lors de la sauvegarde')
      return
    }

    toast.success('Clé API sauvegardée — seule la prévisualisation est conservée')
    setKeyValue('')
    setLabel('')

    // Rafraîchir la liste locale
    const newKey: ApiKeyRow = {
      id: `temp-${Date.now()}`,
      provider,
      label: label || PROVIDER_LABELS[provider],
      key_preview: result.data?.preview ?? '…',
      is_global: isGlobal,
      last_used_at: null,
      created_at: new Date().toISOString(),
    }

    setLocalKeys((prev) => {
      const filtered = prev.filter((k) => !(k.provider === provider && k.is_global === isGlobal))
      return [newKey, ...filtered]
    })
  }

  const handleDelete = async (keyId: string) => {
    const result = await deleteApiKey(keyId)
    if (!result.success) {
      toast.error(result.error ?? 'Erreur lors de la suppression')
      return
    }

    setLocalKeys((prev) => prev.filter((k) => k.id !== keyId))
    toast.success('Clé supprimée')
  }

  return (
    <div className="space-y-6">
      {/* Avertissement sécurité */}
      <div className="bg-yellow-950/30 border border-yellow-900 rounded-lg p-4 text-xs text-yellow-300 space-y-1">
        <p className="font-semibold">Sécurité des clés API</p>
        <p>
          Les clés sont hashées (SHA-256) avant d&apos;être stockées — elles ne peuvent jamais être récupérées
          en clair. Seule une prévisualisation (8 premiers + 4 derniers caractères) est conservée.
        </p>
        <p>
          Si vous devez utiliser la clé, vous devrez la re-saisir ou la configurer dans les variables
          d&apos;environnement Coolify.
        </p>
      </div>

      {/* Formulaire d'ajout */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-200">Ajouter une clé API</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs text-gray-500">Provider</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as ApiProvider)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="anthropic">Anthropic (Claude)</option>
              <option value="openai">OpenAI</option>
              <option value="perplexity">Perplexity</option>
              <option value="other">Autre</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-gray-500">Libellé (optionnel)</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={`Ma clé ${PROVIDER_LABELS[provider]}`}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
              maxLength={60}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-gray-500">Clé API</label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={keyValue}
              onChange={(e) => setKeyValue(e.target.value)}
              placeholder="sk-… ou votre clé API"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 pr-10 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
            />
            <button
              type="button"
              onClick={() => setShowKey((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors text-xs"
            >
              {showKey ? 'Masquer' : 'Afficher'}
            </button>
          </div>
        </div>

        {isAdmin && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isGlobal}
              onChange={(e) => setIsGlobal(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-gray-300">
              Clé globale (partagée avec tous les membres)
            </span>
          </label>
        )}

        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={isSaving || !keyValue.trim()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Sauvegarde…' : 'Sauvegarder (hashage SHA-256)'}
        </button>
      </div>

      {/* Liste des clés */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-gray-200">
          Mes clés ({localKeys.length})
        </h2>

        {localKeys.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
            <p className="text-gray-500 text-sm">Aucune clé configurée</p>
          </div>
        ) : (
          <div className="space-y-2">
            {localKeys.map((key) => (
              <div
                key={key.id}
                className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn('text-sm font-medium', PROVIDER_COLORS[key.provider])}>
                      {PROVIDER_LABELS[key.provider]}
                    </span>
                    {key.is_global && (
                      <span className="text-xs px-2 py-0.5 bg-purple-600/20 text-purple-300 rounded-full">
                        Globale
                      </span>
                    )}
                    <span className="text-sm text-gray-400">{key.label}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <code className="font-mono">{key.key_preview}</code>
                    {key.last_used_at && (
                      <span>
                        Dernière utilisation :{' '}
                        {new Date(key.last_used_at).toLocaleDateString('fr-FR')}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => void handleDelete(key.id)}
                  className="text-xs px-2.5 py-1.5 border border-red-900 text-red-500 hover:text-red-400 hover:border-red-700 rounded-lg transition-colors shrink-0"
                >
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
