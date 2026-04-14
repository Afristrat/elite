import Link from 'next/link'

export default function SuspendedPage(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col items-center justify-center p-6 selection:bg-na-primary selection:text-on-primary">
      {/* En-tête fixe */}
      <header className="fixed top-0 w-full flex justify-between items-center px-8 h-16 bg-background text-na-primary tracking-wide z-10">
        <div className="text-lg font-semibold tracking-[0.05em] text-on-surface">Veille Élite</div>
        <span className="material-symbols-outlined text-on-surface-variant hover:text-na-primary transition-colors cursor-pointer">
          help_outline
        </span>
      </header>

      {/* Décorations d'arrière-plan */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-na-primary/5 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#004883]/5 blur-[120px] pointer-events-none" />

      <main className="flex-grow flex items-center justify-center w-full">
        <div className="w-full max-w-[420px] bg-surface-container rounded-2xl p-10 flex flex-col items-center shadow-2xl space-y-8 border border-border/15">
          {/* Icône + titre */}
          <div className="flex flex-col items-center space-y-4">
            <div className="text-5xl leading-none select-none">⛔</div>
            <h1 className="text-2xl font-bold text-on-surface text-center tracking-tight">
              Compte suspendu
            </h1>
          </div>

          {/* Description */}
          <p className="text-on-surface-variant text-sm text-center leading-relaxed font-normal">
            Votre accès a été temporairement suspendu. Si vous pensez qu&apos;il s&apos;agit d&apos;une erreur, veuillez contacter l&apos;administration de Veille Élite.
          </p>

          {/* Action */}
          <div className="w-full pt-4">
            <Link
              href="/login"
              className="group flex items-center justify-center w-full px-6 py-3 bg-surface-container-highest text-na-primary border border-border/30 rounded-lg font-medium transition-all duration-200 hover:bg-surface-container-high hover:border-na-primary/40 active:scale-95"
            >
              <span className="material-symbols-outlined mr-2 text-[18px] leading-none">logout</span>
              Retour à la connexion
            </Link>
          </div>

          {/* Référence d'erreur */}
          <div className="w-full bg-surface-container-low rounded-xl p-4 flex items-center gap-4 opacity-60">
            <div className="bg-surface-container-high p-2 rounded-lg">
              <span className="material-symbols-outlined text-na-primary text-sm leading-none">info</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold tracking-[0.1em] text-on-surface-variant">Réf. Erreur</span>
              <span className="text-xs font-mono text-[#8abbff]">SEC_SUSP_403_VE</span>
            </div>
          </div>
        </div>
      </main>

      {/* Pied de page */}
      <footer className="fixed bottom-0 w-full flex justify-center gap-8 py-6 bg-background text-on-surface-variant text-[11px] font-semibold uppercase tracking-[0.05em]">
        <span className="hover:text-na-primary transition-opacity opacity-80 hover:opacity-100 cursor-pointer">Support</span>
        <span className="hover:text-na-primary transition-opacity opacity-80 hover:opacity-100 cursor-pointer">Conditions d&apos;utilisation</span>
        <span className="opacity-50 lowercase font-normal normal-case">© 2024 Veille Élite. Tous droits réservés.</span>
      </footer>
    </div>
  )
}
