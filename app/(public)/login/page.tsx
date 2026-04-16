import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LoginButton } from './login-button'

export default async function LoginPage(): Promise<React.JSX.Element> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 selection:bg-na-primary/30">
      {/* Décorations d'arrière-plan */}
      <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-na-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#004883]/10 blur-[120px]" />
      </div>

      <main className="w-full max-w-[400px] px-6">
        <div className="glass-panel p-10 rounded-[2rem] shadow-2xl flex flex-col items-center">
          {/* Badge identité */}
          <div className="mb-8 flex items-center justify-center">
            <div className="w-12 h-12 bg-na-primary flex items-center justify-center rounded-xl shadow-[0_0_20px_rgba(164,201,255,0.3)]">
              <span className="text-[#004178] font-extrabold text-2xl leading-none">V</span>
            </div>
          </div>

          {/* Titre */}
          <div className="text-center mb-10 space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-on-surface">Projets Elite</h1>
            <p className="text-sm text-on-surface-variant font-medium leading-relaxed max-w-[240px] mx-auto">
              Plateforme privée du comité d&apos;investissement
            </p>
          </div>

          {/* Zone d'authentification */}
          <div className="w-full space-y-6">
            <LoginButton />

            {/* Séparateur */}
            <div className="relative flex items-center justify-center py-2">
              <div className="w-full h-[1px] bg-border/20" />
              <span className="absolute px-4 bg-[#0e192f] text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/60">
                Sécurisé
              </span>
            </div>

            {/* Note légale */}
            <div className="pt-2">
              <p className="text-center text-[10px] text-on-surface-variant leading-relaxed px-4">
                En continuant, vous acceptez les conditions de confidentialité réservées aux membres du cercle Veille Élite.
              </p>
            </div>
          </div>

          {/* Note d'accès */}
          <footer className="mt-12 flex items-center gap-2">
            <span
              className="material-symbols-outlined text-[14px] text-on-surface-variant/60"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              lock
            </span>
            <span className="text-[10px] uppercase tracking-[0.1em] font-bold text-on-surface-variant/60">
              Accès sur invitation uniquement
            </span>
          </footer>
        </div>

        {/* Mention branding */}
        <div className="mt-8 text-center">
          <span className="text-[10px] text-on-surface-variant/40 font-medium tracking-[0.2em] uppercase">
            The Nocturnal Architect © 2026
          </span>
        </div>
      </main>
    </div>
  )
}
