import { z } from 'zod'

// Un score par critère : clé = criterion_id (UUID), valeur = 0–10
const ScoresSchema = z
  .record(z.string().uuid(), z.number().min(0).max(10))
  .refine((scores) => Object.keys(scores).length > 0, {
    message: 'Au moins un score est requis',
  })

// Red Team structuré
const RedTeamSchema = z
  .object({
    strongest_argument_against: z
      .string()
      .min(30, 'L\'argument contre doit faire au moins 30 caractères'),
    blind_spots: z
      .string()
      .min(20, 'Décrivez les angles morts (min 20 caractères)'),
    conditions_for_success: z
      .string()
      .min(20, 'Décrivez les conditions de succès (min 20 caractères)'),
  })
  .optional()

export const EvaluationSchema = z.object({
  scores: ScoresSchema,
  commentary: z
    .string()
    .min(50, 'Le commentaire doit faire au moins 50 caractères')
    .max(2000, 'Le commentaire ne peut dépasser 2000 caractères'),
  red_team: RedTeamSchema,
})

export type EvaluationInput = z.infer<typeof EvaluationSchema>
export type RedTeamInput = z.infer<typeof RedTeamSchema>
