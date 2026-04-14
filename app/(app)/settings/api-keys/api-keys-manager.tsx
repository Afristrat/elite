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
  model: string | null
  last_used_at: string | null
  created_at: string
}

type ApiKeysManagerProps = {
  apiKeys: ApiKeyRow[]
  isAdmin: boolean
}

type TestStatus = 'idle' | 'testing' | 'valid' | 'invalid'

// ─── Labels & couleurs ────────────────────────────────────────────────────────

const PROVIDER_LABELS: Record<ApiProvider, string> = {
  groq:        'Groq',
  siliconflow: 'SiliconFlow',
  together:    'Together AI',
  fireworks:   'Fireworks AI',
  deepseek:    'DeepSeek (深度求索)',
  kimi:        'Kimi / Moonshot AI',
  qwen:        'Qwen / Alibaba (通义千问)',
  zhipu:       'Zhipu AI / GLM (智谱)',
  yi:          '01.AI / Yi (零一万物)',
  stepfun:     'Stepfun (阶跃星辰)',
  baichuan:    'Baichuan AI (百川)',
  minimax:     'MiniMax (海螺)',
  hunyuan:     'Hunyuan / Tencent (混元)',
  spark:       'Spark / iFlytek (讯飞星火)',
  doubao:      'Doubao / ByteDance (豆包)',
  mistral:     'Mistral AI',
  perplexity:  'Perplexity',
  cohere:      'Cohere',
  xai:         'xAI (Grok)',
  google:      'Google (Gemini)',
  openai:      'OpenAI',
  anthropic:   'Anthropic (Claude)',
  other:       'Autre / Custom',
}

const PROVIDER_COLORS: Record<ApiProvider, string> = {
  groq:        'text-yellow-400',
  siliconflow: 'text-emerald-300',
  together:    'text-pink-400',
  fireworks:   'text-red-400',
  deepseek:    'text-blue-300',
  kimi:        'text-cyan-400',
  qwen:        'text-orange-300',
  zhipu:       'text-violet-400',
  yi:          'text-lime-400',
  stepfun:     'text-rose-400',
  baichuan:    'text-amber-400',
  minimax:     'text-fuchsia-400',
  hunyuan:     'text-green-400',
  spark:       'text-blue-500',
  doubao:      'text-sky-400',
  mistral:     'text-indigo-400',
  perplexity:  'text-purple-400',
  cohere:      'text-teal-400',
  xai:         'text-gray-300',
  google:      'text-blue-400',
  openai:      'text-emerald-400',
  anthropic:   'text-orange-400',
  other:       'text-gray-400',
}

// ─── Modèles par provider (du moins cher au plus cher) ────────────────────────

type ModelOption = { value: string; label: string }

const MODELS_BY_PROVIDER: Record<ApiProvider, ModelOption[]> = {
  // ── Gratuit / Très bon marché ─────────────────────────────────────────────
  groq: [
    { value: 'llama-3.1-8b-instant',                         label: 'Llama 3.1 8B Instant (gratuit)' },
    { value: 'llama-3.3-70b-versatile',                      label: 'Llama 3.3 70B Versatile' },
    { value: 'meta-llama/llama-4-scout-17b-16e-instruct',    label: 'Llama 4 Scout 17B (preview)' },
    { value: 'openai/gpt-oss-20b',                           label: 'GPT OSS 20B' },
    { value: 'openai/gpt-oss-120b',                          label: 'GPT OSS 120B' },
  ],
  siliconflow: [
    { value: 'Qwen/Qwen3-8B',                                label: 'Qwen3 8B (gratuit)' },
    { value: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-7B',     label: 'DeepSeek R1 Distill 7B (gratuit)' },
    { value: 'THUDM/glm-4-9b-chat',                         label: 'GLM-4 9B' },
    { value: 'deepseek-ai/DeepSeek-V3',                      label: 'DeepSeek V3' },
    { value: 'Qwen/Qwen2.5-72B-Instruct',                    label: 'Qwen2.5 72B' },
    { value: 'deepseek-ai/DeepSeek-R1',                      label: 'DeepSeek R1' },
  ],
  together: [
    { value: 'meta-llama/Llama-3.2-3B-Instruct-Turbo',            label: 'Llama 3.2 3B Turbo' },
    { value: 'meta-llama/Llama-3.1-8B-Instruct-Turbo',            label: 'Llama 3.1 8B Turbo' },
    { value: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',           label: 'Llama 3.3 70B Turbo' },
    { value: 'meta-llama/Llama-4-Scout-17B-16E-Instruct',         label: 'Llama 4 Scout 17B' },
    { value: 'meta-llama/Llama-4-Maverick-17B-128E-Instruct',     label: 'Llama 4 Maverick 17B' },
  ],
  deepseek: [
    { value: 'deepseek-chat',     label: 'DeepSeek V3 (deepseek-chat)' },
    { value: 'deepseek-reasoner', label: 'DeepSeek R1 (deepseek-reasoner)' },
  ],
  // ── Chinois ───────────────────────────────────────────────────────────────
  fireworks: [
    { value: 'accounts/fireworks/models/llama-v3p1-8b-instruct',  label: 'Llama 3.1 8B' },
    { value: 'accounts/fireworks/models/qwen3-8b',                label: 'Qwen3 8B' },
    { value: 'accounts/fireworks/models/llama-v3p3-70b-instruct', label: 'Llama 3.3 70B' },
    { value: 'accounts/fireworks/models/deepseek-v3',             label: 'DeepSeek V3' },
  ],
  kimi: [
    { value: 'moonshot-v1-8k',   label: 'Moonshot V1 8K (le moins cher)' },
    { value: 'moonshot-v1-32k',  label: 'Moonshot V1 32K' },
    { value: 'moonshot-v1-128k', label: 'Moonshot V1 128K' },
    { value: 'kimi-latest',      label: 'Kimi Latest' },
  ],
  qwen: [
    { value: 'qwen-turbo', label: 'Qwen Turbo (le moins cher)' },
    { value: 'qwen3-8b',   label: 'Qwen3 8B' },
    { value: 'qwen-plus',  label: 'Qwen Plus' },
    { value: 'qwen3-32b',  label: 'Qwen3 32B' },
    { value: 'qwen3-72b',  label: 'Qwen3 72B' },
    { value: 'qwen-max',   label: 'Qwen Max' },
  ],
  zhipu: [
    { value: 'glm-4-flash',   label: 'GLM-4 Flash (gratuit)' },
    { value: 'glm-4.7-flash', label: 'GLM-4.7 Flash (gratuit)' },
    { value: 'glm-4.7',       label: 'GLM-4.7' },
    { value: 'glm-4-plus',    label: 'GLM-4 Plus' },
    { value: 'glm-5',         label: 'GLM-5 (dernier)' },
  ],
  yi: [
    { value: 'yi-lightning',   label: 'Yi Lightning (le moins cher)' },
    { value: 'yi-medium',      label: 'Yi Medium' },
    { value: 'yi-large-turbo', label: 'Yi Large Turbo' },
    { value: 'yi-large',       label: 'Yi Large' },
  ],
  stepfun: [
    { value: 'step-1-flash', label: 'Step-1 Flash (le moins cher)' },
    { value: 'step-1',       label: 'Step-1' },
    { value: 'step-2',       label: 'Step-2' },
  ],
  baichuan: [
    { value: 'Baichuan4-Turbo', label: 'Baichuan4 Turbo' },
    { value: 'Baichuan4-Air',   label: 'Baichuan4 Air' },
    { value: 'Baichuan4',       label: 'Baichuan4' },
  ],
  minimax: [
    { value: 'abab5.5s-chat',  label: 'ABAB 5.5s (compatible anciens)' },
    { value: 'MiniMax-M2',     label: 'MiniMax M2' },
    { value: 'MiniMax-M2.1',   label: 'MiniMax M2.1' },
    { value: 'MiniMax-M2.5',   label: 'MiniMax M2.5 (dernier)' },
  ],
  hunyuan: [
    { value: 'hunyuan-lite',    label: 'Hunyuan Lite (le moins cher)' },
    { value: 'hunyuan-turbo-s', label: 'Hunyuan Turbo S' },
    { value: 'hunyuan-t1',      label: 'Hunyuan T1 (raisonnement)' },
  ],
  spark: [
    { value: 'lite',      label: 'Spark Lite (gratuit)' },
    { value: '4.0Ultra',  label: 'Spark 4.0 Ultra' },
    { value: 'x1',        label: 'Xinghuo X1' },
  ],
  doubao: [
    { value: 'doubao-lite-4k',            label: 'Doubao Lite 4K (compatible)' },
    { value: 'doubao-seed-2-0-lite-260215', label: 'Doubao Seed 2.0 Lite' },
    { value: 'doubao-seed-2-0-pro-260215',  label: 'Doubao Seed 2.0 Pro' },
  ],
  // ── Américains / Européens ────────────────────────────────────────────────
  mistral: [
    { value: 'mistral-small-2503',    label: 'Mistral Small 2503 (le moins cher)' },
    { value: 'magistral-small-2506',  label: 'Magistral Small 2506' },
    { value: 'mistral-medium-2505',   label: 'Mistral Medium 2505' },
    { value: 'magistral-medium-2506', label: 'Magistral Medium 2506' },
    { value: 'mistral-large-2512',    label: 'Mistral Large 2512' },
  ],
  perplexity: [
    { value: 'sonar',                label: 'Sonar (le moins cher)' },
    { value: 'sonar-pro',            label: 'Sonar Pro' },
    { value: 'sonar-reasoning',      label: 'Sonar Reasoning' },
    { value: 'sonar-reasoning-pro',  label: 'Sonar Reasoning Pro' },
    { value: 'sonar-deep-research',  label: 'Sonar Deep Research' },
  ],
  cohere: [
    { value: 'command-r-08-2024',      label: 'Command R 08-2024' },
    { value: 'command-r-plus-08-2024', label: 'Command R+ 08-2024' },
    { value: 'command-a-03-2025',      label: 'Command A 03-2025 (le plus performant)' },
  ],
  xai: [
    { value: 'grok-3-mini-beta', label: 'Grok 3 Mini Beta (le moins cher)' },
    { value: 'grok-3-beta',      label: 'Grok 3 Beta' },
    { value: 'grok-2-1212',      label: 'Grok 2' },
  ],
  google: [
    { value: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite (le moins cher)' },
    { value: 'gemini-2.5-flash',      label: 'Gemini 2.5 Flash' },
    { value: 'gemini-2.0-flash',      label: 'Gemini 2.0 Flash' },
    { value: 'gemini-2.5-pro',        label: 'Gemini 2.5 Pro' },
  ],
  openai: [
    { value: 'gpt-4o-mini',  label: 'GPT-4o Mini (le moins cher)' },
    { value: 'gpt-4.1-nano', label: 'GPT-4.1 Nano' },
    { value: 'gpt-4.1-mini', label: 'GPT-4.1 Mini' },
    { value: 'gpt-4o',       label: 'GPT-4o' },
    { value: 'gpt-4.1',      label: 'GPT-4.1' },
  ],
  anthropic: [
    { value: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5 (le moins cher)' },
    { value: 'claude-sonnet-4-6',         label: 'Claude Sonnet 4.6' },
    { value: 'claude-opus-4-6',           label: 'Claude Opus 4.6 (le plus cher)' },
  ],
  other: [],
}

const TESTABLE_PROVIDERS: Set<ApiProvider> = new Set([
  'openai', 'anthropic', 'google', 'mistral', 'groq', 'cohere', 'perplexity',
  'xai', 'together', 'fireworks', 'kimi', 'deepseek', 'qwen', 'zhipu',
  'doubao', 'yi', 'minimax', 'baichuan', 'stepfun', 'siliconflow', 'hunyuan', 'spark',
])

// ─── Composant principal ──────────────────────────────────────────────────────

export function ApiKeysManager({ apiKeys, isAdmin }: ApiKeysManagerProps): React.JSX.Element {
  const [localKeys, setLocalKeys] = useState(apiKeys)
  const [provider, setProvider] = useState<ApiProvider>('kimi')
  const [model, setModel] = useState<string>(MODELS_BY_PROVIDER['kimi'][0]?.value ?? '')
  const [label, setLabel] = useState('')
  const [keyValue, setKeyValue] = useState('')
  const [isGlobal, setIsGlobal] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [testStatus, setTestStatus] = useState<TestStatus>('idle')
  const [testMessage, setTestMessage] = useState<string | null>(null)

  const handleKeyChange = (value: string) => {
    setKeyValue(value)
    setTestStatus('idle')
    setTestMessage(null)
  }

  const handleProviderChange = (value: ApiProvider) => {
    setProvider(value)
    setModel(MODELS_BY_PROVIDER[value][0]?.value ?? '')
    setTestStatus('idle')
    setTestMessage(null)
  }

  const handleTest = async () => {
    if (!keyValue.trim()) {
      toast.error('Saisissez une clé avant de tester')
      return
    }

    if (!TESTABLE_PROVIDERS.has(provider)) {
      setTestStatus('invalid')
      setTestMessage('Test automatique non disponible pour "Autre" — vérifiez manuellement')
      return
    }

    setTestStatus('testing')
    setTestMessage(null)

    try {
      const res = await fetch('/api/ai/test-key', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ provider, keyValue: keyValue.trim(), model }),
      })

      const data = await res.json() as { success: boolean; error?: string; warning?: string }

      if (data.success) {
        setTestStatus('valid')
        setTestMessage(data.warning ?? null)
      } else {
        setTestStatus('invalid')
        setTestMessage(data.error ?? 'Clé invalide')
      }
    } catch {
      setTestStatus('invalid')
      setTestMessage('Impossible de contacter le serveur de test')
    }
  }

  const handleSave = async () => {
    if (!keyValue.trim()) {
      toast.error('Saisissez une clé API')
      return
    }

    setIsSaving(true)
    const result = await saveApiKey(keyValue, provider, label || PROVIDER_LABELS[provider], isGlobal, model || undefined)
    setIsSaving(false)

    if (!result.success) {
      toast.error(result.error ?? 'Erreur lors de la sauvegarde')
      return
    }

    toast.success('Clé API sauvegardée')
    setKeyValue('')
    setLabel('')
    setTestStatus('idle')
    setTestMessage(null)

    const newKey: ApiKeyRow = {
      id: `temp-${Date.now()}`,
      provider,
      label: label || PROVIDER_LABELS[provider],
      key_preview: result.data?.preview ?? '…',
      is_global: isGlobal,
      model: model || null,
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

  const availableModels = MODELS_BY_PROVIDER[provider] ?? []

  return (
    <div className="space-y-6">
      {/* Avertissement sécurité */}
      <div className="bg-yellow-950/30 border border-yellow-900 rounded-lg p-4 text-xs text-yellow-300 space-y-1">
        <p className="font-semibold">Sécurité des clés API</p>
        <p>
          Les clés sont hashées (SHA-256) avant d&apos;être stockées — elles ne peuvent jamais être récupérées
          en clair. Seule une prévisualisation est conservée.
          Testez votre clé <strong>avant</strong> de la sauvegarder.
        </p>
      </div>

      {/* Formulaire */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-200">Ajouter une clé API</h2>

        {/* Provider + Modèle */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs text-gray-500">Provider</label>
            <select
              value={provider}
              onChange={(e) => handleProviderChange(e.target.value as ApiProvider)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <optgroup label="⚡ Gratuit / Très bon marché">
                <option value="groq">Groq</option>
                <option value="siliconflow">SiliconFlow</option>
                <option value="together">Together AI</option>
                <option value="deepseek">DeepSeek (深度求索)</option>
              </optgroup>
              <optgroup label="🇨🇳 Chinois">
                <option value="kimi">Kimi / Moonshot AI</option>
                <option value="qwen">Qwen / Alibaba (通义千问)</option>
                <option value="zhipu">Zhipu AI / GLM (智谱)</option>
                <option value="yi">01.AI / Yi (零一万物)</option>
                <option value="stepfun">Stepfun (阶跃星辰)</option>
                <option value="baichuan">Baichuan AI (百川)</option>
                <option value="minimax">MiniMax (海螺)</option>
                <option value="hunyuan">Hunyuan / Tencent (混元)</option>
                <option value="spark">Spark / iFlytek (讯飞星火)</option>
                <option value="doubao">Doubao / ByteDance (豆包)</option>
              </optgroup>
              <optgroup label="🌍 Américains / Européens">
                <option value="fireworks">Fireworks AI</option>
                <option value="mistral">Mistral AI</option>
                <option value="perplexity">Perplexity</option>
                <option value="cohere">Cohere</option>
                <option value="xai">xAI (Grok)</option>
                <option value="google">Google (Gemini)</option>
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic (Claude)</option>
              </optgroup>
              <optgroup label="Autre">
                <option value="other">Autre / Custom</option>
              </optgroup>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-gray-500">Modèle</label>
            {availableModels.length > 0 ? (
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {availableModels.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Identifiant du modèle…"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
              />
            )}
          </div>
        </div>

        {/* Libellé */}
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

        {/* Clé API */}
        <div className="space-y-1.5">
          <label className="text-xs text-gray-500">Clé API</label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={keyValue}
              onChange={(e) => handleKeyChange(e.target.value)}
              placeholder="sk-… ou votre clé API"
              className={cn(
                'w-full bg-gray-800 border rounded-lg px-3 py-2 pr-20 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-1 transition-colors font-mono',
                testStatus === 'valid'
                  ? 'border-green-600 focus:ring-green-500'
                  : testStatus === 'invalid'
                    ? 'border-red-700 focus:ring-red-500'
                    : 'border-gray-700 focus:ring-blue-500',
              )}
            />
            <button
              type="button"
              onClick={() => setShowKey((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors text-xs"
            >
              {showKey ? 'Masquer' : 'Afficher'}
            </button>
          </div>

          {testStatus === 'testing' && (
            <p className="text-xs text-blue-400 flex items-center gap-1.5">
              <span className="animate-spin inline-block">⟳</span>
              Test en cours avec <code className="font-mono">{model}</code>…
            </p>
          )}
          {testStatus === 'valid' && (
            <p className="text-xs text-green-400">✓ Clé valide {testMessage && `— ${testMessage}`}</p>
          )}
          {testStatus === 'invalid' && (
            <p className="text-xs text-red-400">✗ {testMessage ?? 'Clé invalide'}</p>
          )}
        </div>

        {isAdmin && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isGlobal}
              onChange={(e) => setIsGlobal(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-gray-300">Clé globale (partagée avec tous les membres)</span>
          </label>
        )}

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => void handleTest()}
            disabled={testStatus === 'testing' || !keyValue.trim()}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
              testStatus === 'valid'
                ? 'border-green-700 text-green-400 hover:border-green-500'
                : testStatus === 'invalid'
                  ? 'border-red-800 text-red-400 hover:border-red-600'
                  : 'border-gray-700 text-gray-300 hover:border-gray-500 hover:text-gray-100',
            )}
          >
            {testStatus === 'testing' ? 'Test…' : testStatus === 'valid' ? '✓ Re-tester' : testStatus === 'invalid' ? '✗ Re-tester' : 'Tester la clé'}
          </button>

          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={isSaving || !keyValue.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Sauvegarde…' : 'Sauvegarder'}
          </button>

          {testStatus === 'idle' && keyValue.trim() && (
            <p className="text-xs text-gray-600">Testez d&apos;abord pour valider</p>
          )}
        </div>
      </div>

      {/* Liste des clés */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-gray-200">Mes clés ({localKeys.length})</h2>

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
                      <span className="text-xs px-2 py-0.5 bg-purple-600/20 text-purple-300 rounded-full">Globale</span>
                    )}
                    <span className="text-sm text-gray-400">{key.label}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <code className="font-mono">{key.key_preview}</code>
                    {key.model && <code className="font-mono text-gray-500">{key.model}</code>}
                    {key.last_used_at && (
                      <span>Dernière utilisation : {new Date(key.last_used_at).toLocaleDateString('fr-FR')}</span>
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
