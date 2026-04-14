import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { MobileNav } from '@/components/layout/mobile-nav'
import { Toaster } from '@/components/ui/sonner'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}): Promise<React.JSX.Element> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status, full_name, avatar_url, email')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') redirect('/dashboard')
  if (profile.status === 'suspended') redirect('/suspended')

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      <Sidebar role={profile.role} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          fullName={profile.full_name}
          avatarUrl={profile.avatar_url}
          email={profile.email}
          role={profile.role}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          {children}
        </main>
      </div>

      <MobileNav role={profile.role} />
      <Toaster richColors position="top-right" />
    </div>
  )
}
