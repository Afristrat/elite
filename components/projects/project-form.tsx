'use client'

import { useState, useCallback } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { saveDraft, submitProject } from '@/actions/projects'
import { ProjectDraftSchema, ProjectSubmitSchema } from '@/lib/validators/project'
import { useAutoSave } from '@/hooks/useAutoSave'
import { AITextArea } from '@/components/ui/ai-textarea'
import type { ProjectDraftInput, ProjectSubmitInput } from '@/lib/validators/project'
import type { Tables } from '@/types/database'

// ─── Types ────────────────────────────────────────────────────────────────────

type PortfolioThesis = Pick<Tables<'portfolio_theses'>, 'id' | 'title' | 'description'>

type ProjectFormProps = {
  theses: PortfolioThesis[]
  initialProjectId?: string
  initialData?: Partial<ProjectDraftInput>
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: 'Identité', description: 'Titre, secteur, horizon' },
  { id: 2, label: 'Description', description: 'Problème, solution, valeur' },
  { id: 3, label: 'Finances', description: 'Montant, scénarios Monte Carlo' },
  { id: 4, label: 'Thèse', description: 'Thèse d\'investissement, risques' },
  { id: 5, label: 'Finalisation', description: 'Deadline, thèse macro, envoi' },
] as const

const HORIZON_OPTIONS = [
  { value: 'H1' as const, label: 'H1 — Court terme', description: '0–18 mois' },
  { value: 'H2' as const, label: 'H2 — Moyen terme', description: '18 mois – 3 ans' },
  { value: 'H3' as const, label: 'H3 — Long terme', description: '3 ans et +' },
]

const BARBELL_OPTIONS = [
  { value: 'core' as const, label: 'Core', description: 'Actif stable, risque faible' },
  { value: 'growth' as const, label: 'Growth', description: 'Croissance modérée' },
  { value: 'moonshot' as const, label: 'Moonshot', description: 'Haut risque / haut rendement' },
]

const SECTOR_OPTIONS = [
  // Agriculture & Agroalimentaire
  'Agriculture & Élevage',
  'Agritech & Agriculture de précision',
  'Agroalimentaire & IAA',
  'Viticulture & Œnologie',
  'Pêche & Aquaculture',
  'Semences & Agrochimie',
  'Circuits courts & Bio',

  // Ressources naturelles & Énergie
  'Pétrole & Gaz',
  'Mines & Métaux',
  'Énergie solaire',
  'Énergie éolienne',
  'Hydraulique & Hydrogène',
  'Nucléaire',
  'Gestion des déchets & Recyclage',
  'Eau & Assainissement',

  // Industrie & Manufacturing
  'Industrie automobile',
  'Aéronautique & Défense',
  'Chimie & Pétrochimie',
  'Pharmaceutique',
  'Biotechnologies',
  'Textile & Habillement',
  'Impression & Packaging',
  'Électronique & Composants',
  'Machines & Équipements industriels',
  'Sidérurgie & Métallurgie',
  'Plasturgie & Caoutchouc',
  'Industrie du bois & Papier',
  'Luxe & Cosmétique',
  'Jouets & Articles de sport',

  // Construction & Immobilier
  'Immobilier résidentiel',
  'Immobilier commercial',
  'Immobilier industriel & Logistique',
  'Promotion immobilière',
  'Construction & BTP',
  'Génie civil & Infrastructure',
  'Architecture & Ingénierie',
  'Property management & Facility',
  'PropTech',

  // Transport & Logistique
  'Transport routier & Fret',
  'Transport ferroviaire',
  'Transport maritime & Shipping',
  'Transport aérien',
  'Logistique & Supply chain',
  'Last-mile & Livraison',
  'Ports, aéroports & Hubs',
  'Mobilité urbaine & Micromobilité',

  // Commerce & Distribution
  'Commerce de détail / Retail',
  'Grande distribution / GMS',
  'E-commerce',
  'Commerce de gros',
  'Franchise',
  'Marketplace B2B',
  'Marketplace B2C',
  'Commerce de luxe',

  // Technologies & Numérique
  'SaaS / Cloud',
  'Intelligence artificielle & ML',
  'Cybersécurité',
  'Blockchain & Web3',
  'IoT & Edge computing',
  'Semiconducteurs & Hardware',
  'Jeux vidéo & Gaming',
  'Réalité augmentée & Virtuelle',
  'Infrastructure IT & DevOps',
  'Data & Analytics',
  'Robotique & Automatisation',
  'Spatial & Satellites',

  // Finance & Assurance
  'Banque de détail',
  'Banque d\'investissement',
  'Gestion d\'actifs & Asset management',
  'Private equity & Venture capital',
  'Assurance vie',
  'Assurance non-vie',
  'Fintech & Néobanque',
  'Microfinance & Inclusion financière',
  'Paiement & Monétique',
  'Retraite & Épargne',
  'Insurtech',
  'Legaltech & Regtech',

  // Santé & Sciences de la vie
  'Hôpitaux & Cliniques',
  'Pharmacie & Parapharmacie',
  'Dispositifs médicaux',
  'Télémédecine & E-santé',
  'Bien-être & Médecines douces',
  'Diagnostics & Laboratoires',
  'Medtech',

  // Services aux entreprises
  'Conseil en stratégie & Management',
  'Audit & Expertise comptable',
  'Ressources humaines & Recrutement',
  'Communication & Publicité',
  'Relations publiques & Influence',
  'Services juridiques & Notariat',
  'Sécurité & Gardiennage',
  'Nettoyage & Services généraux',
  'Coworking & Espaces de travail',

  // Éducation & Formation
  'Enseignement primaire & Secondaire',
  'Enseignement supérieur',
  'Formation professionnelle',
  'E-learning & Edtech',
  'Langues & Centres culturels',

  // Tourisme & Hospitality
  'Hôtellerie',
  'Restauration & Café',
  'Tourisme & Voyages',
  'Loisirs & Parcs d\'attractions',
  'Événementiel & MICE',
  'Bien-être & Spa',

  // Médias & Divertissement
  'Presse & Édition',
  'Radio & Télévision',
  'Streaming & Podcast',
  'Cinéma & Production',
  'Musique & Concerts',
  'Sports & E-sport',
  'Paris sportifs & Jeux',

  // Télécommunications
  'Opérateurs télécom',
  'Équipements réseau & Fibre',

  // Impact & ESG
  'Finance solidaire & Impact investing',
  'Économie circulaire',
  'Économie sociale & Solidaire',
  'ONG & Associations',

  'Autre',
]

// Tags suggérés par secteur — correspondance sur le premier mot significatif
const TAG_SUGGESTIONS_BY_SECTOR: Record<string, string[]> = {
  'Immobilier': ['résidentiel', 'commercial', 'locatif', 'promotion', 'foncier', 'SCPI', 'rénovation', 'mezzanine'],
  'Agritech': ['precision farming', 'agri-data', 'irrigation', 'semences', 'IoT terrain'],
  'Agriculture': ['élevage', 'céréales', 'maraîchage', 'coopérative', 'circuits courts', 'bio'],
  'Agroalimentaire': ['transformation', 'GMS', 'private label', 'export', 'HACCP'],
  'Pétrole': ['upstream', 'midstream', 'downstream', 'GNL', 'raffinage'],
  'Mines': ['extraction', 'phosphate', 'cuivre', 'or', 'lithium', 'ESG minier'],
  'Énergie solaire': ['PV', 'EPC', 'C&I', 'utility-scale', 'BESS', 'PPA'],
  'Énergie éolienne': ['onshore', 'offshore', 'parc éolien', 'PPA'],
  'Automobile': ['OEM', 'équipementier', 'EV', 'mobilité', 'ADAS'],
  'Aéronautique': ['MRO', 'composites', 'défense', 'drones', 'UAV'],
  'Pharmaceutique': ['prescription', 'OTC', 'génériques', 'biosimilaires', 'R&D'],
  'Biotechnologies': ['thérapie génique', 'anticorps', 'diagnostics', 'CDMO', 'pipeline'],
  'Textile': ['fast fashion', 'premium', 'nearshoring', 'RSE', 'B2B'],
  'Luxe': ['maroquinerie', 'horlogerie', 'joaillerie', 'DTC', 'UHNW'],
  'Construction': ['BTP', 'promoteur', 'VEFA', 'contrat clé en main', 'EPC'],
  'Génie civil': ['concession', 'PPP', 'infrastructure', 'route', 'barrage'],
  'PropTech': ['SaaS immobilier', 'gestion locative', 'marketplace', 'iBuyer'],
  'Transport routier': ['TRM', 'FTL', 'LTL', 'flotte', 'dernier kilomètre'],
  'Transport maritime': ['porte-conteneurs', 'vrac', 'croisière', 'ports'],
  'Transport aérien': ['low-cost', 'charter', 'fret aérien', 'MRO'],
  'Logistique': ['3PL', 'entrepôt', 'cross-docking', 'cold chain', 'TMS'],
  'Last-mile': ['livraison', 'drones', 'lockers', 'dark store', 'quick commerce'],
  'Commerce de détail': ['GSS', 'franchise', 'brick & mortar', 'omnicanal'],
  'Grande distribution': ['GMS', 'hard discount', 'drive', 'MDD'],
  'E-commerce': ['marketplace', 'D2C', 'dropshipping', 'cross-border', 'SEA'],
  'Franchise': ['réseau', 'master franchise', 'royalties', 'concept éprouvé'],
  'SaaS': ['ARR', 'MRR', 'churn', 'PLG', 'enterprise', 'API', 'B2B'],
  'Intelligence artificielle': ['LLM', 'computer vision', 'NLP', 'ML ops', 'GenAI'],
  'Cybersécurité': ['SOC', 'EDR', 'SIEM', 'zero trust', 'GRC', 'MSSP'],
  'Blockchain': ['DeFi', 'NFT', 'Layer 2', 'tokenisation', 'stablecoin', 'RWA'],
  'IoT': ['capteurs', 'edge computing', 'protocoles', 'M2M', 'industriel'],
  'Semiconducteurs': ['fabless', 'foundry', 'EDA', 'MEMS', 'RF'],
  'Jeux vidéo': ['mobile gaming', 'PC', 'console', 'free-to-play', 'metaverse'],
  'Data': ['data lake', 'BI', 'analytics', 'ETL', 'gouvernance données'],
  'Robotique': ['cobots', 'AGV', 'RPA', 'pick & place', 'logistique'],
  'Banque': ['retail banking', 'corporate', 'trade finance', 'wealth management'],
  'Gestion d\'actifs': ['actions', 'obligataire', 'alternatif', 'multi-asset', 'ESG'],
  'Private equity': ['LBO', 'growth', 'venture', 'secondary', 'co-investissement'],
  'Assurance': ['vie', 'non-vie', 'santé', 'prévoyance', 'réassurance'],
  'Fintech': ['lending', 'néobanque', 'paiement', 'KYC', 'open banking', 'BaaS'],
  'Insurtech': ['embedded insurance', 'telematics', 'claims automation'],
  'Hôpitaux': ['SSR', 'MCO', 'EHPAD', 'clinique', 'ambulatoire'],
  'Pharmacie': ['officine', 'grossiste', 'spécialités', 'génériques'],
  'Dispositifs médicaux': ['IVD', 'implantable', 'class IIa', 'CE marking'],
  'Télémédecine': ['téléconsultation', 'suivi chronique', 'santé numérique'],
  'Médecine': ['généraliste', 'spécialiste', 'urgences', 'prévention'],
  'Conseil': ['big four', 'boutique', 'stratégie', 'transformation', 'interim'],
  'Ressources humaines': ['recrutement', 'RPO', 'outplacement', 'paie', 'SIRH'],
  'Communication': ['agence 360°', 'digital', 'brand content', 'influence'],
  'Services juridiques': ['cabinet d\'avocats', 'conformité', 'M&A', 'contentieux'],
  'Enseignement': ['K-12', 'supérieur', 'alternance', 'apprentissage'],
  'Formation': ['CPF', 'intra', 'inter', 'certifiant', 'blended learning'],
  'E-learning': ['MOOC', 'LMS', 'micro-learning', 'vidéo', 'simulation'],
  'Hôtellerie': ['palace', '4 étoiles', 'budget', 'lifestyle', 'resort'],
  'Restauration': ['QSR', 'casual dining', 'dark kitchen', 'snacking', 'franchise resto'],
  'Tourisme': ['FIT', 'MICE', 'réceptif', 'OTA', 'expériences locales'],
  'Événementiel': ['incentive', 'congrès', 'salon professionnel', 'team building'],
  'Presse': ['digital first', 'abonnement', 'B2B media', 'newsletters'],
  'Streaming': ['SVOD', 'AVOD', 'live', 'podcast', 'audio'],
  'Cinéma': ['production', 'distribution', 'post-production', 'animation'],
  'Sports': ['club', 'droits TV', 'sponsoring', 'sports tech', 'e-sport'],
  'Finance solidaire': ['impact', 'B Corp', 'obligations sociales', 'blended finance'],
  'Économie circulaire': ['recyclage', 'upcycling', 'économie de fonctionnalité', 'seconde main'],
}

const DEFAULT_TAG_SUGGESTIONS = ['rentable', 'scalable', 'early-stage', 'croissance', 'revenus récurrents', 'B2B', 'international', 'marché émergent']

// ─── Composant principal ──────────────────────────────────────────────────────

export function ProjectForm({ theses, initialProjectId, initialData }: ProjectFormProps): React.JSX.Element {
  const [step, setStep] = useState(1)
  const [projectId, setProjectId] = useState<string | null>(initialProjectId ?? null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tagInput, setTagInput] = useState('')

  const form = useForm<ProjectDraftInput>({
    resolver: zodResolver(ProjectDraftSchema),
    defaultValues: {
      title: '',
      sector: '',
      tags: [],
      horizon: undefined,
      barbell_category: undefined,
      description: '',
      market_research: {
        problem: '',
        solution: '',
        value_proposition: '',
        investment_amount: undefined,
        currency: 'EUR',
        key_risks: '',
        key_hypotheses: '',
      },
      scenarios: {
        pessimistic: { probability: 20, moic: 0, description: '' },
        realistic: { probability: 60, moic: 0, description: '' },
        optimistic: { probability: 20, moic: 0, description: '' },
      },
      moic_target: undefined,
      investment_thesis: {
        statement: '',
        hypotheses: ['', '', ''],
      },
      evaluation_deadline: '',
      thesis_ids: [],
      ...initialData,
    },
  })

  // eslint-disable-next-line react-hooks/incompatible-library -- react-hook-form watch() est l'API recommandée, incompatible avec React Compiler mais sans alternative
  const watchedValues = form.watch()

  // ─── Auto-save ───────────────────────────────────────────────────────────

  const handleAutoSave = useCallback(
    async (data: ProjectDraftInput) => {
      const result = await saveDraft(projectId, data)
      return result
    },
    [projectId],
  )

  const { status: saveStatus, lastSaved, saveNow } = useAutoSave({
    data: watchedValues,
    onSave: handleAutoSave,
    delay: 30_000,
    enabled: step > 1 || (watchedValues.title?.length ?? 0) >= 3,
    onIdReceived: (id) => setProjectId(id),
  })

  // ─── Navigation ──────────────────────────────────────────────────────────

  const canGoNext = (): boolean => {
    const v = watchedValues
    if (step === 1) {
      return (v.title?.length ?? 0) >= 3
    }
    return true
  }

  const handleNext = async () => {
    if (!canGoNext()) {
      await form.trigger()
      return
    }
    // Sauvegarder avant de passer à l'étape suivante
    if ((watchedValues.title?.length ?? 0) >= 3) {
      saveNow()
    }
    setStep((s) => Math.min(s + 1, 5))
  }

  const handleBack = () => {
    setStep((s) => Math.max(s - 1, 1))
  }

  // ─── Soumission finale ───────────────────────────────────────────────────

  const handleSubmit = async () => {
    const values = form.getValues()

    // Validation complète côté client avant envoi
    const parsed = ProjectSubmitSchema.safeParse(values)
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]
      toast.error(`Formulaire incomplet : ${firstError?.message ?? 'Vérifiez tous les champs'}`)
      return
    }

    if (!projectId) {
      toast.error('Erreur : projet non sauvegardé. Attendez l\'auto-save.')
      return
    }

    setIsSubmitting(true)
    try {
      await submitProject(projectId, parsed.data as ProjectSubmitInput)
      // La Server Action redirige → pas besoin de toast ici
    } catch {
      toast.error('Erreur lors de la soumission. Réessayez.')
      setIsSubmitting(false)
    }
  }

  // ─── Gestion des tags ────────────────────────────────────────────────────

  const addTag = () => {
    const tag = tagInput.trim()
    if (!tag) return
    const current = form.getValues('tags') ?? []
    if (current.length >= 10 || current.includes(tag)) return
    form.setValue('tags', [...current, tag])
    setTagInput('')
  }

  const removeTag = (tag: string) => {
    const current = form.getValues('tags') ?? []
    form.setValue('tags', current.filter((t) => t !== tag))
  }

  // ─── Indicateur de sauvegarde ────────────────────────────────────────────

  const SaveIndicator = () => (
    <span className="text-xs text-on-surface-variant flex items-center gap-1">
      {saveStatus === 'saving' && <><span>⟳</span> Sauvegarde…</>}
      {saveStatus === 'saved' && lastSaved && (
        <><span>💾</span> Sauvegardé à {lastSaved.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</>
      )}
      {saveStatus === 'error' && <span className="text-na-error">⚠ Erreur de sauvegarde</span>}
    </span>
  )

  // ─── Rendu ───────────────────────────────────────────────────────────────

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Stepper */}
      <div className="relative flex justify-between items-center">
        {/* Ligne de fond */}
        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-surface-container-high -translate-y-1/2 z-0" />
        {/* Ligne active */}
        <div
          className="absolute top-1/2 h-[2px] bg-na-primary -translate-y-1/2 z-0 transition-all"
          style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
        />
        {STEPS.map((s) => (
          <div key={s.id} className="z-10 flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => { if (s.id < step) setStep(s.id) }}
              disabled={s.id > step}
              className="disabled:cursor-not-allowed"
            >
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all',
                  s.id === step && 'bg-na-primary text-on-primary shadow-[0_0_15px_rgba(164,201,255,0.4)]',
                  s.id < step && 'bg-na-tertiary-dim text-on-surface',
                  s.id > step && 'bg-surface-container-high text-on-surface-variant',
                )}
              >
                {s.id < step ? '✓' : s.id}
              </div>
            </button>
            <span
              className={cn(
                'text-[10px] font-semibold uppercase tracking-widest hidden md:block',
                s.id === step && 'text-na-primary',
                s.id !== step && 'text-on-surface-variant',
              )}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* En-tête étape */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-on-surface">
            Étape {step} — {STEPS[step - 1]?.label}
          </h2>
          <p className="text-sm text-on-surface-variant mt-0.5">{STEPS[step - 1]?.description}</p>
        </div>
        <SaveIndicator />
      </div>

      {/* Contenu de l'étape */}
      <div className="bg-surface-container border border-border/15 rounded-xl p-10 shadow-2xl shadow-black/40 space-y-10">
        {step === 1 && <Step1 form={form} tagInput={tagInput} setTagInput={setTagInput} onAddTag={addTag} onRemoveTag={removeTag} />}
        {step === 2 && <Step2 form={form} />}
        {step === 3 && <Step3 form={form} />}
        {step === 4 && <Step4 form={form} />}
        {step === 5 && <Step5 form={form} theses={theses} />}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleBack}
          disabled={step === 1}
          className="px-5 py-2.5 text-sm text-on-surface-variant hover:text-on-surface disabled:opacity-40 disabled:cursor-not-allowed border border-border/10 rounded-xl hover:border-border/30 transition-colors"
        >
          ← Retour
        </button>

        {step < 5 ? (
          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-2.5 text-sm font-semibold bg-primary-container text-on-primary-container hover:bg-na-primary hover:text-on-primary rounded-xl transition-all disabled:opacity-50"
          >
            Suivant →
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2.5 text-sm font-semibold bg-na-tertiary-container/20 text-na-tertiary-dim border border-na-tertiary-dim/30 hover:bg-na-tertiary-dim hover:text-on-tertiary rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Soumission en cours…' : 'Soumettre pour évaluation'}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Étape 1 — Identité du projet ─────────────────────────────────────────────

function Step1({
  form,
  tagInput,
  setTagInput,
  onAddTag,
  onRemoveTag,
}: {
  form: ReturnType<typeof useForm<ProjectDraftInput>>
  tagInput: string
  setTagInput: (v: string) => void
  onAddTag: () => void
  onRemoveTag: (tag: string) => void
}): React.JSX.Element {
  const tags = form.watch('tags') ?? []
  const sector = form.watch('sector') ?? ''

  // Suggestions de tags — cherche la clé avec le plus long préfixe commun avec le secteur saisi
  const sectorLower = sector.toLowerCase()
  const sectorKey = Object.keys(TAG_SUGGESTIONS_BY_SECTOR).reduce<string | null>((best, k) => {
    const kLower = k.toLowerCase()
    const matches = sectorLower.includes(kLower) || kLower.split(' ').some((w) => w.length > 3 && sectorLower.includes(w))
    if (!matches) return best
    return !best || k.length > best.length ? k : best
  }, null)
  const suggestedTags = (sectorKey ? TAG_SUGGESTIONS_BY_SECTOR[sectorKey] : DEFAULT_TAG_SUGGESTIONS) ?? DEFAULT_TAG_SUGGESTIONS
  const availableSuggestions = suggestedTags.filter((t) => !tags.includes(t))

  const addSuggestedTag = (tag: string) => {
    const current = form.getValues('tags') ?? []
    if (current.length >= 10 || current.includes(tag)) return
    form.setValue('tags', [...current, tag])
  }

  return (
    <>
      <Field label="Titre du projet *" error={form.formState.errors.title?.message}>
        <input
          {...form.register('title')}
          placeholder="Ex : Acquisition immobilière Casablanca Maarif"
          className={inputClass}
          maxLength={120}
        />
      </Field>

      <Field label="Secteur d'activité" error={form.formState.errors.sector?.message}>
        <input
          {...form.register('sector')}
          list="sector-suggestions"
          placeholder="Ex : Immobilier, Tech, Fintech…"
          className={inputClass}
          maxLength={80}
          autoComplete="off"
        />
        <datalist id="sector-suggestions">
          {SECTOR_OPTIONS.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </Field>

      <Field label="Tags" description="Jusqu'à 10 mots-clés (Entrée pour ajouter)">
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onAddTag() } }}
              placeholder="Ajouter un tag…"
              className={cn(inputClass, 'flex-1')}
              maxLength={30}
              disabled={tags.length >= 10}
            />
            <button
              type="button"
              onClick={onAddTag}
              disabled={tags.length >= 10 || !tagInput.trim()}
              className="px-3 py-2 text-sm bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded-lg disabled:opacity-40 transition-colors"
            >
              +
            </button>
          </div>

          {/* Tags recommandés */}
          {availableSuggestions.length > 0 && tags.length < 10 && (
            <div className="flex flex-wrap gap-1.5">
              <span className="text-xs text-on-surface-variant/50 self-center">Suggestions :</span>
              {availableSuggestions.slice(0, 6).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => addSuggestedTag(tag)}
                  className="text-xs px-2 py-0.5 bg-surface-container-highest hover:bg-surface-container-high border border-border/10 hover:border-primary/20 text-on-surface-variant hover:text-on-surface rounded-full transition-colors"
                >
                  + {tag}
                </button>
              ))}
            </div>
          )}

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-primary-container/20 text-na-primary text-xs rounded-full"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => onRemoveTag(tag)}
                    className="hover:text-on-surface transition-colors"
                    aria-label={`Supprimer ${tag}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </Field>

      <Field label="Horizon temporel *" error={form.formState.errors.horizon?.message}>
        <div className="grid grid-cols-3 gap-3">
          {HORIZON_OPTIONS.map((opt) => (
            <SelectCard
              key={opt.value}
              selected={form.watch('horizon') === opt.value}
              onClick={() => form.setValue('horizon', opt.value)}
              label={opt.label}
              description={opt.description}
            />
          ))}
        </div>
      </Field>

      <Field label="Catégorie Barbell *" error={form.formState.errors.barbell_category?.message}>
        <div className="grid grid-cols-3 gap-3">
          {BARBELL_OPTIONS.map((opt) => (
            <SelectCard
              key={opt.value}
              selected={form.watch('barbell_category') === opt.value}
              onClick={() => form.setValue('barbell_category', opt.value)}
              label={opt.label}
              description={opt.description}
            />
          ))}
        </div>
      </Field>
    </>
  )
}

// ─── Étape 2 — Description ────────────────────────────────────────────────────

function Step2({
  form,
}: {
  form: ReturnType<typeof useForm<ProjectDraftInput>>
}): React.JSX.Element {
  const errors = form.formState.errors.market_research
  const title = form.watch('title') ?? ''
  const sector = form.watch('sector') ?? ''
  const generateContext = [title, sector].filter(Boolean).join(' — ')

  return (
    <>
      <Field
        label="Quel problème ce projet résout-il ? *"
        description="Min 50 caractères — soyez précis et factuels"
        error={errors?.problem?.message}
      >
        <Controller
          control={form.control}
          name="market_research.problem"
          render={({ field }) => (
            <AITextArea
              value={field.value ?? ''}
              onChange={field.onChange}
              field="problem"
              rows={4}
              placeholder="Le marché X souffre du problème Y parce que Z…"
              minLength={50}
              generateContext={generateContext}
            />
          )}
        />
      </Field>

      <Field
        label="Quelle est la solution proposée ? *"
        description="Min 50 caractères — approche concrète et différenciante"
        error={errors?.solution?.message}
      >
        <Controller
          control={form.control}
          name="market_research.solution"
          render={({ field }) => (
            <AITextArea
              value={field.value ?? ''}
              onChange={field.onChange}
              field="solution"
              rows={4}
              placeholder="Notre approche consiste à…"
              minLength={50}
              generateContext={generateContext}
            />
          )}
        />
      </Field>

      <Field
        label="Proposition de valeur *"
        description="Min 30 caractères — en quoi est-ce unique ?"
        error={errors?.value_proposition?.message}
      >
        <Controller
          control={form.control}
          name="market_research.value_proposition"
          render={({ field }) => (
            <AITextArea
              value={field.value ?? ''}
              onChange={field.onChange}
              field="value_proposition"
              rows={3}
              placeholder="Ce projet crée de la valeur unique en…"
              minLength={30}
              generateContext={generateContext}
            />
          )}
        />
      </Field>

      <Field label="Notes complémentaires" description="Résumé ou points clés à retenir (optionnel)">
        <Controller
          control={form.control}
          name="description"
          render={({ field }) => (
            <AITextArea
              value={field.value ?? ''}
              onChange={field.onChange}
              field="description"
              rows={3}
              placeholder="Contexte additionnel, sources, liens…"
              maxLength={500}
              generateContext={generateContext}
            />
          )}
        />
      </Field>
    </>
  )
}

// ─── Étape 3 — Finances & Monte Carlo ─────────────────────────────────────────

function Step3({
  form,
}: {
  form: ReturnType<typeof useForm<ProjectDraftInput>>
}): React.JSX.Element {
  const errors = form.formState.errors

  const totalProb =
    (form.watch('scenarios.pessimistic.probability') ?? 0) +
    (form.watch('scenarios.realistic.probability') ?? 0) +
    (form.watch('scenarios.optimistic.probability') ?? 0)

  const probError = Math.abs(totalProb - 100) > 0.01

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Montant d'investissement *" error={errors.market_research?.investment_amount?.message}>
          <input
            {...form.register('market_research.investment_amount', { valueAsNumber: true })}
            type="number"
            min={0}
            step={1000}
            placeholder="500 000"
            className={inputClass}
          />
        </Field>
        <Field label="Devise *">
          <select {...form.register('market_research.currency')} className={inputClass}>
            <option value="EUR">EUR — Euro</option>
            <option value="MAD">MAD — Dirham</option>
            <option value="USD">USD — Dollar</option>
            <option value="GBP">GBP — Livre sterling</option>
          </select>
        </Field>
      </div>

      <Field label="MOIC cible *" description="Multiple On Invested Capital attendu" error={errors.moic_target?.message}>
        <input
          {...form.register('moic_target', { valueAsNumber: true })}
          type="number"
          min={0}
          step={0.1}
          placeholder="Ex : 3.5"
          className={cn(inputClass, 'max-w-xs')}
        />
      </Field>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-on-surface-variant text-[11px] font-semibold uppercase tracking-widest">Scénarios Monte Carlo *</label>
          <span className={cn('text-xs font-mono', probError ? 'text-na-error' : 'text-na-tertiary-dim')}>
            Total : {totalProb.toFixed(0)}% {!probError && '✓'}
          </span>
        </div>
        {probError && (
          <p className="text-xs text-na-error">Les probabilités doivent totaliser 100%</p>
        )}

        <div className="space-y-3">
          {(
            [
              { key: 'pessimistic', label: 'Pessimiste', color: 'border-na-error/30 bg-na-error-container/5' },
              { key: 'realistic', label: 'Réaliste', color: 'border-na-secondary/30 bg-na-secondary-container/10' },
              { key: 'optimistic', label: 'Optimiste', color: 'border-na-tertiary-dim/30 bg-na-tertiary-container/5' },
            ] as const
          ).map(({ key, label, color }) => (
            <div key={key} className={cn('border rounded-xl p-6 space-y-4', color)}>
              <h4 className="text-sm font-medium text-gray-200">{label}</h4>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Probabilité (%)" error={errors.scenarios?.[key]?.probability?.message}>
                  <input
                    {...form.register(`scenarios.${key}.probability`, { valueAsNumber: true })}
                    type="number"
                    min={0}
                    max={100}
                    step={5}
                    placeholder="20"
                    className={inputClass}
                  />
                </Field>
                <Field label="MOIC" error={errors.scenarios?.[key]?.moic?.message}>
                  <input
                    {...form.register(`scenarios.${key}.moic`, { valueAsNumber: true })}
                    type="number"
                    min={0}
                    step={0.1}
                    placeholder="Ex : 1.5"
                    className={inputClass}
                  />
                </Field>
              </div>
              <Field label="Description" error={errors.scenarios?.[key]?.description?.message}>
                <input
                  {...form.register(`scenarios.${key}.description`)}
                  placeholder={`Hypothèses du scénario ${label.toLowerCase()}…`}
                  className={inputClass}
                  maxLength={200}
                />
              </Field>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

// ─── Étape 4 — Thèse d'investissement & Risques ────────────────────────────────

function Step4({
  form,
}: {
  form: ReturnType<typeof useForm<ProjectDraftInput>>
}): React.JSX.Element {
  const errors = form.formState.errors
  const title = form.watch('title') ?? ''
  const sector = form.watch('sector') ?? ''
  const generateContext = [title, sector].filter(Boolean).join(' — ')

  return (
    <>
      <Field
        label="Thèse d'investissement *"
        description="Min 100 caractères — votre conviction structurée en une ou deux phrases"
        error={errors.investment_thesis?.statement?.message}
      >
        <Controller
          control={form.control}
          name="investment_thesis.statement"
          render={({ field }) => (
            <AITextArea
              value={field.value ?? ''}
              onChange={field.onChange}
              field="statement"
              rows={4}
              placeholder="Nous croyons que [marché/secteur] va [évolution] parce que [catalyseurs], ce qui permettra de [retour attendu] via [mécanisme]…"
              minLength={100}
              generateContext={generateContext}
            />
          )}
        />
      </Field>

      <div className="space-y-3">
        <label className="block text-on-surface-variant text-[11px] font-semibold uppercase tracking-widest">
          3 Hypothèses vérifiables *
        </label>
        <p className="text-xs text-on-surface-variant/60">
          Formulations falsifiables — comment saurez-vous que vous aviez tort ou raison ?
        </p>
        {([0, 1, 2] as const).map((i) => (
          <Field
            key={i}
            label={`Hypothèse ${i + 1}`}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- tuple indexing nécessite un cast
            error={(errors.investment_thesis?.hypotheses as any)?.[i]?.message}
          >
            <Controller
              control={form.control}
              name={`investment_thesis.hypotheses.${i}`}
              render={({ field }) => (
                <AITextArea
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  field="hypothesis"
                  rows={2}
                  placeholder={
                    i === 0
                      ? 'Ex : Si le taux d\'occupation atteint 85% à M+6, la thèse est validée'
                      : i === 1
                        ? 'Ex : Si le ticket moyen dépasse 15 000 MAD, le marché premium est confirmé'
                        : 'Ex : Si la réglementation X est adoptée avant M+12, l\'avantage concurrentiel est sécurisé'
                  }
                  generateContext={generateContext}
                />
              )}
            />
          </Field>
        ))}
      </div>

      <Field
        label="Risques principaux *"
        description="Min 30 caractères — les 3 à 5 risques les plus critiques"
        error={errors.market_research?.key_risks?.message}
      >
        <Controller
          control={form.control}
          name="market_research.key_risks"
          render={({ field }) => (
            <AITextArea
              value={field.value ?? ''}
              onChange={field.onChange}
              field="key_risks"
              rows={3}
              placeholder="1. Risque de liquidité — 2. Risque réglementaire — 3. Risque marché…"
              minLength={30}
              generateContext={generateContext}
            />
          )}
        />
      </Field>

      <Field
        label="Hypothèses clés du modèle"
        description="Min 30 caractères — ce qui doit être vrai pour que le modèle tienne"
        error={errors.market_research?.key_hypotheses?.message}
      >
        <Controller
          control={form.control}
          name="market_research.key_hypotheses"
          render={({ field }) => (
            <AITextArea
              value={field.value ?? ''}
              onChange={field.onChange}
              field="key_hypotheses"
              rows={3}
              placeholder="Taux d'occupation : 80%. Prix de sortie : 2M MAD. Durée : 3 ans…"
              minLength={30}
              generateContext={generateContext}
            />
          )}
        />
      </Field>
    </>
  )
}

// ─── Étape 5 — Finalisation ──────────────────────────────────────────────────

function Step5({
  form,
  theses,
}: {
  form: ReturnType<typeof useForm<ProjectDraftInput>>
  theses: PortfolioThesis[]
}): React.JSX.Element {
  const selectedTheses = form.watch('thesis_ids') ?? []

  const toggleThesis = (id: string) => {
    const current = form.getValues('thesis_ids') ?? []
    if (current.includes(id)) {
      form.setValue('thesis_ids', current.filter((t) => t !== id))
    } else {
      form.setValue('thesis_ids', [...current, id])
    }
  }

  return (
    <>
      <Field
        label="Date limite d'évaluation *"
        description="Les évaluateurs ont jusqu'à cette date pour soumettre leur vote"
        error={form.formState.errors.evaluation_deadline?.message}
      >
        <input
          {...form.register('evaluation_deadline')}
          type="date"
          min={new Date().toISOString().split('T')[0]}
          className={cn(inputClass, 'max-w-xs')}
        />
      </Field>

      {theses.length > 0 && (
        <Field
          label="Thèses macro du portefeuille"
          description="Rattachez ce projet à une ou plusieurs thèses (optionnel)"
        >
          <div className="space-y-2">
            {theses.map((thesis) => (
              <button
                key={thesis.id}
                type="button"
                onClick={() => toggleThesis(thesis.id)}
                className={cn(
                  'w-full text-left p-4 rounded-lg border transition-all',
                  selectedTheses.includes(thesis.id)
                    ? 'border-primary/40 bg-primary-container/20 text-na-primary'
                    : 'border-border/10 bg-surface-container-lowest text-on-surface-variant hover:border-primary/20 hover:text-on-surface',
                )}
              >
                <div className="text-sm font-medium">{thesis.title}</div>
                {thesis.description && (
                  <div className="text-xs text-on-surface-variant/60 mt-0.5">{thesis.description}</div>
                )}
              </button>
            ))}
          </div>
        </Field>
      )}

      <div className="bg-primary-container/10 border border-primary-container/30 rounded-xl p-5 space-y-2">
        <h4 className="text-sm font-semibold text-na-primary">Ce qui se passera après la soumission</h4>
        <ul className="text-xs text-on-surface-variant space-y-1">
          <li>• L&apos;équipe sera notifiée (email + WhatsApp) qu&apos;un nouveau projet est disponible</li>
          <li>• Vous ne pourrez plus modifier le projet une fois soumis</li>
          <li>• Vous ne pourrez pas évaluer votre propre projet (règle d&apos;indépendance)</li>
          <li>• Les résultats seront disponibles une fois le quorum atteint</li>
        </ul>
      </div>
    </>
  )
}

// ─── Composants utilitaires ───────────────────────────────────────────────────

function Field({
  label,
  description,
  error,
  children,
}: {
  label: string
  description?: string
  error?: string
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <div className="space-y-3">
      <label className="block text-on-surface-variant text-[11px] font-semibold uppercase tracking-widest">{label}</label>
      {description && <p className="text-xs text-on-surface-variant/60">{description}</p>}
      {children}
      {error && <p className="text-xs text-na-error">{error}</p>}
    </div>
  )
}

function SelectCard({
  selected,
  onClick,
  label,
  description,
}: {
  selected: boolean
  onClick: () => void
  label: string
  description: string
}): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'p-4 rounded-lg border text-left transition-all w-full',
        selected
          ? 'border-primary/40 bg-primary-container/20 text-na-primary'
          : 'border-border/10 bg-surface-container-lowest text-on-surface-variant hover:border-primary/20 hover:text-on-surface',
      )}
    >
      <div className="text-sm font-semibold">{label}</div>
      <div className="text-xs mt-0.5 opacity-70">{description}</div>
    </button>
  )
}

// ─── Classes utilitaires ──────────────────────────────────────────────────────

const inputClass =
  'w-full bg-surface-container-lowest border border-border/10 rounded-lg px-5 py-4 focus:border-primary/40 focus:ring-0 focus:outline-none transition-all placeholder:text-outline/50 text-on-surface'
