import { z } from 'zod'

// ─── Sous-schémas ────────────────────────────────────────────────────────────

const ScenarioSchema = z.object({
  probability: z.number().min(0).max(100),
  moic: z.number().min(0, 'MOIC doit être positif'),
  description: z.string().min(10, 'Description trop courte (min 10 caractères)'),
})

const MarketResearchSchema = z.object({
  problem: z
    .string()
    .min(50, 'Décrivez le problème en au moins 50 caractères'),
  solution: z
    .string()
    .min(50, 'Décrivez la solution en au moins 50 caractères'),
  value_proposition: z
    .string()
    .min(30, 'Proposition de valeur trop courte (min 30 caractères)'),
  investment_amount: z
    .number()
    .positive('Le montant doit être positif'),
  currency: z.string().min(1).max(5).default('EUR'),
  key_risks: z
    .string()
    .min(30, 'Décrivez les risques principaux (min 30 caractères)'),
  key_hypotheses: z
    .string()
    .min(30, 'Décrivez les hypothèses clés (min 30 caractères)'),
})

const InvestmentThesisSchema = z.object({
  statement: z
    .string()
    .min(100, 'La thèse doit être d\'au moins 100 caractères'),
  hypotheses: z
    .tuple([
      z.string().min(10, 'Hypothèse 1 trop courte'),
      z.string().min(10, 'Hypothèse 2 trop courte'),
      z.string().min(10, 'Hypothèse 3 trop courte'),
    ])
    .describe('3 hypothèses vérifiables'),
})

const ScenariosSchema = z
  .object({
    pessimistic: ScenarioSchema,
    realistic: ScenarioSchema,
    optimistic: ScenarioSchema,
  })
  .refine(
    (s) => {
      const total = s.pessimistic.probability + s.realistic.probability + s.optimistic.probability
      return Math.abs(total - 100) < 0.01
    },
    {
      message: 'Les probabilités des 3 scénarios doivent totaliser 100%',
      path: ['pessimistic', 'probability'],
    },
  )

// ─── Schéma brouillon (validation partielle) ─────────────────────────────────

export const ProjectDraftSchema = z.object({
  title: z.string().min(3, 'Titre trop court (min 3 caractères)').max(120),
  sector: z.string().max(80).optional(),
  tags: z.array(z.string().max(30)).max(10).optional(),
  horizon: z.enum(['H1', 'H2', 'H3']).optional(),
  barbell_category: z.enum(['core', 'growth', 'moonshot']).optional(),
  description: z.string().max(500).optional(),
  market_research: MarketResearchSchema.partial().optional(),
  scenarios: z
    .object({
      pessimistic: ScenarioSchema.partial(),
      realistic: ScenarioSchema.partial(),
      optimistic: ScenarioSchema.partial(),
    })
    .optional(),
  moic_target: z.number().positive().optional(),
  investment_thesis: InvestmentThesisSchema.partial().optional(),
  evaluation_deadline: z.string().optional(),
  thesis_ids: z.array(z.string().uuid()).optional(),
})

// ─── Schéma soumission finale (validation complète) ──────────────────────────

export const ProjectSubmitSchema = z.object({
  title: z.string().min(3, 'Titre trop court (min 3 caractères)').max(120),
  sector: z.string().min(1, 'Secteur requis').max(80),
  tags: z.array(z.string().max(30)).max(10).optional(),
  horizon: z.enum(['H1', 'H2', 'H3']),
  barbell_category: z.enum(['core', 'growth', 'moonshot']),
  description: z.string().max(500).optional(),
  market_research: MarketResearchSchema,
  scenarios: ScenariosSchema,
  moic_target: z.number().positive('Le MOIC doit être positif'),
  investment_thesis: InvestmentThesisSchema,
  evaluation_deadline: z
    .string()
    .min(1, 'Date limite d\'évaluation requise'),
  thesis_ids: z.array(z.string().uuid()).optional(),
})

// ─── Types dérivés ────────────────────────────────────────────────────────────

export type ProjectDraftInput = z.infer<typeof ProjectDraftSchema>
export type ProjectSubmitInput = z.infer<typeof ProjectSubmitSchema>

export type ScenarioInput = z.infer<typeof ScenarioSchema>
export type MarketResearchInput = z.infer<typeof MarketResearchSchema>
export type InvestmentThesisInput = z.infer<typeof InvestmentThesisSchema>
