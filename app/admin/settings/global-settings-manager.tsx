'use client'

import { useState, useTransition } from 'react'
import { updateSetting } from '@/actions/admin-settings'

type SettingsMap = Record<string, unknown>

type GlobalSettingsManagerProps = {
  settings: SettingsMap
}

export function GlobalSettingsManager({ settings }: GlobalSettingsManagerProps): React.JSX.Element {
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function getBool(key: string, def: boolean): boolean {
    const v = settings[key]
    if (typeof v === 'boolean') return v
    return def
  }

  function getNum(key: string, def: number): number {
    const v = settings[key]
    if (typeof v === 'number') return v
    return def
  }

  function getStr(key: string, def: string): string {
    const v = settings[key]
    if (typeof v === 'string') return v
    return def
  }

  const [premortem, setPremortem] = useState(getBool('premortem_enabled', false))
  const [quorumDefault, setQuorumDefault] = useState(getNum('quorum_default', 3))
  const [deadlineDays, setDeadlineDays] = useState(getNum('evaluation_deadline_days', 7))
  const [maxMembers, setMaxMembers] = useState(getNum('max_members', 50))
  const [platformName, setPlatformName] = useState(getStr('platform_name', 'Projets Elite'))
  // Two-Speed Governance
  const [fastTrackEnabled, setFastTrackEnabled] = useState(getBool('fast_track_enabled', false))
  const [fastTrackThreshold, setFastTrackThreshold] = useState(getNum('fast_track_threshold', 50000))
  const [fastTrackQuorum, setFastTrackQuorum] = useState(getNum('fast_track_quorum', 2))

  function handleSave(key: Parameters<typeof updateSetting>[0], value: boolean | number | string): void {
    startTransition(async () => {
      setError(null)
      const result = await updateSetting(key, value)
      if (result.success) {
        setSaved(key)
        setTimeout(() => setSaved(null), 2000)
      } else {
        setError(result.error ?? 'Erreur inconnue')
      }
    })
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Nom de la plateforme */}
      <SettingCard title="Identité" description="Nom affiché dans les emails et notifications">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={platformName}
            onChange={(e) => { setPlatformName(e.target.value) }}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-600"
          />
          <SaveButton
            onClick={() => { handleSave('platform_name', platformName) }}
            isPending={isPending}
            saved={saved === 'platform_name'}
          />
        </div>
      </SettingCard>

      {/* Quorum par défaut */}
      <SettingCard
        title="Quorum par défaut"
        description="Nombre minimum d'évaluations requis avant la prise de décision"
      >
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={1}
            max={20}
            value={quorumDefault}
            onChange={(e) => { setQuorumDefault(Number(e.target.value)) }}
            className="w-24 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-600"
          />
          <span className="text-sm text-gray-500">évaluations</span>
          <SaveButton
            onClick={() => { handleSave('quorum_default', quorumDefault) }}
            isPending={isPending}
            saved={saved === 'quorum_default'}
          />
        </div>
      </SettingCard>

      {/* Délai d'évaluation par défaut */}
      <SettingCard
        title="Délai d'évaluation par défaut"
        description="Nombre de jours accordés pour évaluer un projet (utilisé si aucune deadline n'est définie)"
      >
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={1}
            max={90}
            value={deadlineDays}
            onChange={(e) => { setDeadlineDays(Number(e.target.value)) }}
            className="w-24 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-600"
          />
          <span className="text-sm text-gray-500">jours</span>
          <SaveButton
            onClick={() => { handleSave('evaluation_deadline_days', deadlineDays) }}
            isPending={isPending}
            saved={saved === 'evaluation_deadline_days'}
          />
        </div>
      </SettingCard>

      {/* Pre-Mortem */}
      <SettingCard
        title="Pre-Mortem collectif"
        description="Si activé, les projets soumis passent d'abord par une phase de pré-mortem avant l'ouverture à l'évaluation"
      >
        <div className="flex items-center gap-3">
          <button
            role="switch"
            aria-checked={premortem}
            onClick={() => {
              const next = !premortem
              setPremortem(next)
              handleSave('premortem_enabled', next)
            }}
            disabled={isPending}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${
              premortem ? 'bg-blue-600' : 'bg-gray-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                premortem ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className="text-sm text-gray-400">
            {premortem ? 'Activé' : 'Désactivé'}
          </span>
          {saved === 'premortem_enabled' && (
            <span className="text-xs text-green-400">Enregistré ✓</span>
          )}
        </div>
      </SettingCard>

      {/* Nombre maximum de membres */}
      <SettingCard
        title="Nombre maximum de membres actifs"
        description="Limite le nombre de profils actifs sur la plateforme"
      >
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={2}
            max={200}
            value={maxMembers}
            onChange={(e) => { setMaxMembers(Number(e.target.value)) }}
            className="w-24 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-600"
          />
          <span className="text-sm text-gray-500">membres</span>
          <SaveButton
            onClick={() => { handleSave('max_members', maxMembers) }}
            isPending={isPending}
            saved={saved === 'max_members'}
          />
        </div>
      </SettingCard>

      {/* Two-Speed Governance */}
      <SettingCard
        title="Two-Speed Governance (V1 / V2)"
        description="Processus rapide pour les projets sous un seuil d'investissement défini — quorum réduit, pas de pré-mortem"
      >
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <button
              role="switch"
              aria-checked={fastTrackEnabled}
              onClick={() => {
                const next = !fastTrackEnabled
                setFastTrackEnabled(next)
                handleSave('fast_track_enabled', next)
              }}
              disabled={isPending}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${
                fastTrackEnabled ? 'bg-blue-600' : 'bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  fastTrackEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="text-sm text-gray-400">{fastTrackEnabled ? 'V1 activé' : 'Désactivé (V2 uniquement)'}</span>
            {saved === 'fast_track_enabled' && <span className="text-xs text-green-400">Enregistré ✓</span>}
          </div>

          {fastTrackEnabled && (
            <div className="space-y-3 pl-2 border-l-2 border-blue-900/50">
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Seuil V1 (montant &lt; ce seuil → processus rapide)</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1000}
                      step={1000}
                      value={fastTrackThreshold}
                      onChange={(e) => { setFastTrackThreshold(Number(e.target.value)) }}
                      className="w-32 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-600"
                    />
                    <span className="text-sm text-gray-500">€</span>
                    <SaveButton
                      onClick={() => { handleSave('fast_track_threshold', fastTrackThreshold) }}
                      isPending={isPending}
                      saved={saved === 'fast_track_threshold'}
                    />
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Quorum V1 (processus rapide)</p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={fastTrackQuorum}
                    onChange={(e) => { setFastTrackQuorum(Number(e.target.value)) }}
                    className="w-24 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-600"
                  />
                  <span className="text-sm text-gray-500">évaluations</span>
                  <SaveButton
                    onClick={() => { handleSave('fast_track_quorum', fastTrackQuorum) }}
                    isPending={isPending}
                    saved={saved === 'fast_track_quorum'}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </SettingCard>
    </div>
  )
}

// ─── Composants utilitaires ───────────────────────────────────────────────────

function SettingCard({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
      <div>
        <p className="text-sm font-medium text-white">{title}</p>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
      {children}
    </div>
  )
}

function SaveButton({
  onClick,
  isPending,
  saved,
}: {
  onClick: () => void
  isPending: boolean
  saved: boolean
}): React.JSX.Element {
  if (saved) {
    return <span className="text-xs text-green-400 shrink-0">Enregistré ✓</span>
  }
  return (
    <button
      onClick={onClick}
      disabled={isPending}
      className="text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50 shrink-0"
    >
      {isPending ? 'Enregistrement…' : 'Enregistrer'}
    </button>
  )
}
