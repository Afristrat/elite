import { createClient } from '@/lib/supabase/server'
import { GlobalSettingsManager } from './global-settings-manager'

export default async function AdminSettingsPage(): Promise<React.JSX.Element> {
  const supabase = await createClient()

  const { data: settings } = await supabase
    .from('settings')
    .select('key, value')

  const settingsMap = Object.fromEntries((settings ?? []).map((s) => [s.key, s.value]))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Paramètres globaux</h1>
        <p className="text-on-surface-variant text-sm mt-1">
          Configuration générale de la plateforme Projets Elite
        </p>
      </div>

      <GlobalSettingsManager settings={settingsMap} />
    </div>
  )
}
