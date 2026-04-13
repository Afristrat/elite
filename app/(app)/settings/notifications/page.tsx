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
        <h1 className="text-2xl font-bold text-white">Préférences de notifications</h1>
        <p className="text-gray-400 text-sm mt-1">
          Choisissez les événements pour lesquels vous souhaitez être notifié(e).
        </p>
      </div>

      {!profile?.whatsapp_number && (
        <div className="bg-yellow-950/20 border border-yellow-800/40 rounded-xl p-4">
          <p className="text-yellow-400 text-sm font-medium">Numéro WhatsApp non renseigné</p>
          <p className="text-yellow-600 text-xs mt-1">
            Les notifications WhatsApp sont désactivées. Ajoutez votre numéro dans{' '}
            <a href="/settings" className="underline hover:text-yellow-400 transition-colors">
              les paramètres du profil
            </a>
            .
          </p>
        </div>
      )}

      <NotificationsPrefsManager prefs={prefs} role={profile?.role ?? 'evaluateur'} />
    </div>
  )
}
