/**
 * WhatsApp via Evolution API
 * Envoie des messages texte structurés via l'instance Evolution API configurée.
 */

type SendResult = { success: boolean; error?: string }

function buildEvolutionUrl(path: string): string {
  const base = process.env.EVOLUTION_API_URL?.replace(/\/$/, '') ?? ''
  const instance = process.env.EVOLUTION_INSTANCE ?? ''
  return `${base}/message/${path}/${instance}`
}

async function sendWhatsAppText(to: string, text: string): Promise<SendResult> {
  const apiUrl = process.env.EVOLUTION_API_URL
  const apiKey = process.env.EVOLUTION_API_KEY

  if (!apiUrl || !apiKey || !process.env.EVOLUTION_INSTANCE) {
    return { success: false, error: 'Evolution API non configurée' }
  }

  // Formater le numéro : supprimer les espaces/tirets, ajouter le préfixe international si absent
  const formattedNumber = to.replace(/[\s\-().+]/g, '').replace(/^0/, '212')

  try {
    const response = await fetch(buildEvolutionUrl('sendText'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey,
      },
      body: JSON.stringify({
        number: formattedNumber,
        text,
      }),
      signal: AbortSignal.timeout(5000), // 5s timeout
    })

    if (!response.ok) {
      const body = await response.text()
      console.error('[whatsapp] Evolution API error:', response.status, body)
      return { success: false, error: `Evolution API ${response.status}` }
    }

    return { success: true }
  } catch (err) {
    console.error('[whatsapp] sendWhatsApp error:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Erreur inconnue' }
  }
}

// ─── Messages formatés ────────────────────────────────────────────────────────

export async function sendInvitationWhatsApp(params: {
  to: string
  inviteUrl: string
  role: string
}): Promise<SendResult> {
  const roleLabel = params.role === 'evaluateur' ? 'Évaluateur' : params.role === 'admin' ? 'Administrateur' : 'Contributeur'
  const text = `🎯 *Veille Élite* — Invitation\n\nVous êtes invité(e) à rejoindre la plateforme en tant que *${roleLabel}*.\n\n👉 ${params.inviteUrl}\n\n_Ce lien est valable 7 jours._`
  return sendWhatsAppText(params.to, text)
}

export async function sendEvaluationRequestedWhatsApp(params: {
  to: string
  projectTitle: string
  projectUrl: string
  deadline?: string
}): Promise<SendResult> {
  const deadlineLine = params.deadline ? `\n⏰ Date limite : *${params.deadline}*` : ''
  const text = `📊 *Veille Élite* — Nouveau projet à évaluer\n\n*${params.projectTitle}*${deadlineLine}\n\n👉 ${params.projectUrl}`
  return sendWhatsAppText(params.to, text)
}

export async function sendQuorumReachedWhatsApp(params: {
  to: string
  projectTitle: string
  resultsUrl: string
  evaluationCount: number
}): Promise<SendResult> {
  const text = `✅ *Veille Élite* — Quorum atteint\n\n*${params.projectTitle}* a reçu ${params.evaluationCount} évaluation${params.evaluationCount > 1 ? 's' : ''}. Les résultats sont disponibles.\n\n👉 ${params.resultsUrl}`
  return sendWhatsAppText(params.to, text)
}

export async function sendDecisionMadeWhatsApp(params: {
  to: string
  projectTitle: string
  decision: 'approved' | 'rejected' | 'deferred'
  projectUrl: string
}): Promise<SendResult> {
  const icons = { approved: '✅', rejected: '❌', deferred: '⏸️' }
  const labels = { approved: 'APPROUVÉ', rejected: 'REJETÉ', deferred: 'DIFFÉRÉ' }
  const text = `${icons[params.decision]} *Veille Élite* — Décision\n\n*${params.projectTitle}* : *${labels[params.decision]}*\n\n👉 ${params.projectUrl}`
  return sendWhatsAppText(params.to, text)
}

export async function sendEvaluationReminderWhatsApp(params: {
  to: string
  projectTitle: string
  projectUrl: string
  hoursLeft: number
}): Promise<SendResult> {
  const text = `⚠️ *Veille Élite* — Rappel\n\n*${params.projectTitle}* — il reste *${params.hoursLeft}h* pour évaluer.\n\n👉 ${params.projectUrl}`
  return sendWhatsAppText(params.to, text)
}
