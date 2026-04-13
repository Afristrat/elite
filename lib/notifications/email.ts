import { Resend } from 'resend'
import { render } from '@react-email/components'
import { InvitationEmail } from '@/emails/invitation'
import { EvaluationRequestedEmail } from '@/emails/evaluation-requested'
import { QuorumReachedEmail } from '@/emails/quorum-reached'
import { DecisionMadeEmail } from '@/emails/decision-made'
import { EvaluationReminderEmail } from '@/emails/evaluation-reminder'

const FROM_ADDRESS = 'Veille Élite <noreply@veille-elite.fr>'

function getResend(): Resend {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY non définie')
  return new Resend(key)
}

type SendResult = { success: boolean; error?: string }

// ─── Invitation ───────────────────────────────────────────────────────────────

export async function sendInvitationEmail(params: {
  to: string
  inviteUrl: string
  role: string
}): Promise<SendResult> {
  try {
    const resend = getResend()
    const html = await render(InvitationEmail({ inviteUrl: params.inviteUrl, role: params.role }))
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: params.to,
      subject: 'Vous êtes invité à rejoindre Veille Élite',
      html,
    })
    return { success: true }
  } catch (err) {
    console.error('[email] sendInvitationEmail error:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Erreur inconnue' }
  }
}

// ─── Évaluation demandée ──────────────────────────────────────────────────────

export async function sendEvaluationRequestedEmail(params: {
  to: string
  projectTitle: string
  projectUrl: string
  deadline?: string
}): Promise<SendResult> {
  try {
    const resend = getResend()
    const html = await render(
      EvaluationRequestedEmail({
        projectTitle: params.projectTitle,
        projectUrl: params.projectUrl,
        deadline: params.deadline,
      }),
    )
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: params.to,
      subject: `Nouveau projet à évaluer : ${params.projectTitle}`,
      html,
    })
    return { success: true }
  } catch (err) {
    console.error('[email] sendEvaluationRequestedEmail error:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Erreur inconnue' }
  }
}

// ─── Quorum atteint ───────────────────────────────────────────────────────────

export async function sendQuorumReachedEmail(params: {
  to: string
  projectTitle: string
  resultsUrl: string
  evaluationCount: number
}): Promise<SendResult> {
  try {
    const resend = getResend()
    const html = await render(
      QuorumReachedEmail({
        projectTitle: params.projectTitle,
        resultsUrl: params.resultsUrl,
        evaluationCount: params.evaluationCount,
      }),
    )
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: params.to,
      subject: `Quorum atteint — ${params.projectTitle}`,
      html,
    })
    return { success: true }
  } catch (err) {
    console.error('[email] sendQuorumReachedEmail error:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Erreur inconnue' }
  }
}

// ─── Décision prise ───────────────────────────────────────────────────────────

export async function sendDecisionMadeEmail(params: {
  to: string
  projectTitle: string
  decision: 'approved' | 'rejected' | 'deferred'
  rationale: string
  projectUrl: string
  repoUrl?: string
}): Promise<SendResult> {
  try {
    const resend = getResend()
    const html = await render(
      DecisionMadeEmail({
        projectTitle: params.projectTitle,
        decision: params.decision,
        rationale: params.rationale,
        projectUrl: params.projectUrl,
        repoUrl: params.repoUrl,
      }),
    )
    const decisionLabel = params.decision === 'approved' ? 'Approuvé' : params.decision === 'rejected' ? 'Rejeté' : 'Différé'
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: params.to,
      subject: `Décision — ${params.projectTitle} : ${decisionLabel}`,
      html,
    })
    return { success: true }
  } catch (err) {
    console.error('[email] sendDecisionMadeEmail error:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Erreur inconnue' }
  }
}

// ─── Rappel évaluation ────────────────────────────────────────────────────────

export async function sendEvaluationReminderEmail(params: {
  to: string
  projectTitle: string
  projectUrl: string
  hoursLeft: number
}): Promise<SendResult> {
  try {
    const resend = getResend()
    const html = await render(
      EvaluationReminderEmail({
        projectTitle: params.projectTitle,
        projectUrl: params.projectUrl,
        hoursLeft: params.hoursLeft,
      }),
    )
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: params.to,
      subject: `Rappel : ${params.projectTitle} — ${params.hoursLeft}h restantes`,
      html,
    })
    return { success: true }
  } catch (err) {
    console.error('[email] sendEvaluationReminderEmail error:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Erreur inconnue' }
  }
}
