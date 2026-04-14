import { createClient } from '@/lib/supabase/server'
import { NotificationsPrefsManager } from './notifications-prefs-manager'
import type { NotificationPrefs } from '@/actions/settings'

export default async function NotificationsPage(): Promise<React.JSX.Element> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, notification_prefs, whatsapp_number')
    .eq('id', user!.id)
    .single()

  const rawPrefs = profile?.notification_prefs as Partial<NotificationPrefs> | null

  const prefs: NotificationPrefs = {
    evaluation_reminder: rawPrefs?.evaluation_reminder ?? true,
    quorum_reached: rawPrefs?.quorum_reached ?? true,
    decision_made: rawPrefs?.decision_made ?? true,
    project_submitted: rawPrefs?.project_submitted ?? (profile?.role === 'admin'),
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Préférences de notifications</h1>
        <p className="text-on-surface-variant text-sm mt-1">
          Choisissez quand être alerté par email et WhatsApp.
        </p>
      </div>

      {!profile?.whatsapp_number && (
        <div className="p-4 bg-orange-950/20 border border-orange-900/50 rounded-xl flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-orange-900/30 flex items-center justify-center">
            <span className="text-orange-400 text-lg">⚠</span>
          </div>
          <div className="flex-1">
            <p className="text-orange-400 font-medium text-sm">Notifications WhatsApp désactivées</p>
            <p className="text-orange-400/60 text-xs mt-0.5">
              Renseignez votre numéro dans{' '}
              <a href="/settings" className="underline hover:text-orange-400 transition-colors">
                les paramètres du profil
              </a>
              .
            </p>
          </div>
        </div>
      )}

      <NotificationsPrefsManager prefs={prefs} role={profile?.role ?? 'evaluateur'} />
    </div>
  )
}
