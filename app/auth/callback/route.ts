import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database'

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=no_code`)
  }

  const cookieStore = await cookies()
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
  }

  const email = data.user.email!

  // Vérifier que l'email est invité
  const { data: invitation } = await supabase
    .from('invitations')
    .select('id, role, accepted_at')
    .eq('email', email)
    .gt('expires_at', new Date().toISOString())
    .is('accepted_at', null)
    .maybeSingle()

  if (!invitation) {
    // Vérifier si le profil existe déjà (membre existant qui se reconnecte)
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, status')
      .eq('id', data.user.id)
      .maybeSingle()

    if (!existingProfile) {
      await supabase.auth.signOut()
      return NextResponse.redirect(`${origin}/access-denied`)
    }

    if (existingProfile.status === 'suspended') {
      return NextResponse.redirect(`${origin}/suspended`)
    }

    return NextResponse.redirect(`${origin}${next}`)
  }

  // Première connexion : mettre à jour le rôle et marquer l'invitation acceptée
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', data.user.id)
    .maybeSingle()

  if (existingProfile) {
    await supabase
      .from('profiles')
      .update({ role: invitation.role })
      .eq('id', data.user.id)
  }

  // Marquer l'invitation comme acceptée
  await supabase
    .from('invitations')
    .update({ accepted_at: new Date().toISOString() })
    .eq('id', invitation.id)

  return NextResponse.redirect(`${origin}${next}`)
}
