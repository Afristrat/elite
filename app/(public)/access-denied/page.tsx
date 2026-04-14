import Link from 'next/link'

export default function AccessDeniedPage(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-background text-on-surface flex items-center justify-center p-6 selection:bg-na-primary selection:text-on-primary">
      {/* Décorations d'arrière-plan */}
      <div className="fixed top-[-10%] right-[-10%] w-[40%] h-[40%] bg-na-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-surface-container-highest/20 blur-[120px] rounded-full pointer-events-none" />

      <main className="w-full max-w-[420px] bg-surface-container border border-border/15 rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-10 flex flex-col items-center">
          {/* Icône */}
          <div className="mb-8 relative">
            <div className="absolute inset-0 bg-na-primary/10 blur-2xl rounded-full scale-150" />
            <div className="relative text-[80px] leading-none select-none">🔒</div>
          </div>

          {/* Contenu */}
          <div className="text-center space-y-4 mb-10">
            <h1 className="text-on-surface text-2xl font-bold tracking-tight">
              Accès refusé
            </h1>
            <p className="text-on-surface-variant text-sm leading-relaxed max-w-[320px] mx-auto">
              Votre adresse email n&apos;est pas sur la liste des membres invités. Contactez un administrateur pour obtenir une invitation.
            </p>
          </div>

          {/* Action */}
          <div className="w-full pt-2">
            <Link
              href="/login"
              className="w-full py-3.5 px-6 rounded-xl border border-border bg-surface-container-high text-na-primary font-medium text-sm transition-all duration-200 hover:bg-surface-container-highest hover:border-na-primary/30 flex items-center justify-center gap-2 group"
            >
              <span className="material-symbols-outlined text-[18px] leading-none">arrow_back</span>
              <span>Retour à la connexion</span>
            </Link>
          </div>
        </div>

        {/* Pied décoratif */}
        <div className="bg-surface-container-low py-4 px-8 flex justify-center">
          <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant/60">
            Veille Élite • Sécurité Système
          </span>
        </div>
      </main>

      {/* Pied de page */}
      <footer className="fixed bottom-0 w-full flex justify-center gap-8 py-6">
        <div className="flex gap-8">
          <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-on-surface-variant/80">
            Support
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-on-surface-variant/80">
            Conditions d&apos;utilisation
          </span>
        </div>
        <div className="absolute inset-x-0 bottom-1 flex justify-center pb-1">
          <p className="text-[9px] text-on-surface-variant/40 uppercase tracking-widest">
            © 2024 Veille Élite. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  )
}
