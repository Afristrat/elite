import { createServiceClient, createClient } from '@/lib/supabase/server'
import { TourWidget } from '@/components/tour/tour-widget'
import { MembersManager } from './members-manager'
import type { TourStep } from '@/components/tour/tour-segment'

type AdminMembersPageProps = {
  searchParams: Promise<{ tour?: string; open?: string; decided?: string }>
}

export default async function AdminMembersPage({ searchParams }: AdminMembersPageProps): Promise<React.JSX.Element> {
  const sp = await searchParams
  const supabase = await createClient()
  const service = await createServiceClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: members } = await service
    .from('profiles')
    .select('id, full_name, email, role, status, created_at, avatar_url, whatsapp_number')
    .order('created_at', { ascending: false })

  // ── Tour guidé — segment 8 (Membres) ──────────────────────────────────────
  const isTour8 = sp.tour === '8'

  const tour8Steps: TourStep[] = [
    {
      element: '[data-tour="members-list"]',
      popover: {
        title: '👥 Gouvernance des membres',
        description:
          'Gérez les rôles (Admin / Évaluateur / Contributeur), suspendez l\'accès si nécessaire, envoyez des invitations par lien sécurisé. Le groupe est fermé — seul l\'admin peut inviter. Chaque vote est identifié et traçable, mais anonyme pour les autres membres.',
        side: 'top',
        align: 'start',
      },
    },
    {
      popover: {
        title: '🎯 Vous êtes prêt !',
        description:
          'Vous avez vu toute la plateforme : pipeline de décision, vote aveugle, quorum structuré, résultats agrégés, décisions immuables, analytics PROMETHEE II, et gouvernance des membres. Commencez par évaluer un projet ouvert — votre vote compte.',
        side: 'over',
        align: 'center',
      },
    },
  ]

  return (
    <div className="space-y-6">
      {/* Tour guidé — segment 8 (dernier) */}
      {isTour8 && (
        <TourWidget
          steps={tour8Steps}
          nextUrl={null}
          currentSegment={8}
          totalSegments={8}
        />
      )}

      <div>
        <h1 className="text-2xl font-bold text-white">Membres</h1>
        <p className="text-gray-400 text-sm mt-1">
          {members?.length ?? 0} membre{(members?.length ?? 0) > 1 ? 's' : ''} dans le groupe
        </p>
      </div>

      <div data-tour="members-list">
        <MembersManager members={members ?? []} currentUserId={user!.id} />
      </div>
    </div>
  )
}
