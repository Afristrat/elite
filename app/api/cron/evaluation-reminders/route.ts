import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEvaluationReminderEmail } from '@/lib/notifications/email'

// CRON : 0 9 * * * (chaque matin à 9h)
// Protection : Authorization: Bearer CRON_SECRET

export async function GET(request: NextRequest): Promise<NextResponse> {
  // Vérification du token CRON
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()

  // Projets status='open' avec deadline dans les 48h
  const now = new Date()
  const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000)

  const { data: urgentProjects } = await supabase
    .from('projects')
    .select('id, title, evaluation_deadline, proposant_id')
    .eq('status', 'open')
    .not('evaluation_deadline', 'is', null)
    .lte('evaluation_deadline', in48h.toISOString())
    .gte('evaluation_deadline', now.toISOString())

  if (!urgentProjects?.length) {
    return NextResponse.json({ processed: 0, sent: 0, skipped: 0 })
  }

  let sent = 0
  let skipped = 0

  for (const project of urgentProjects) {
    // Évaluateurs qui n'ont pas encore soumis
    const { data: evaluations } = await supabase
      .from('evaluations')
      .select('evaluateur_id')
      .eq('project_id', project.id)

    const evaluatedIds = new Set((evaluations ?? []).map((e) => e.evaluateur_id).filter(Boolean))

    // Tous les évaluateurs actifs (hors proposant)
    const { data: evaluators } = await supabase
      .from('profiles')
      .select('id, email, full_name, notification_prefs')
      .eq('role', 'evaluateur')
      .eq('status', 'active')
      .neq('id', project.proposant_id)

    if (!evaluators?.length) continue

    const deadline = new Date(project.evaluation_deadline!)
    const hoursLeft = Math.round((deadline.getTime() - now.getTime()) / (1000 * 60 * 60))
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''

    for (const evaluator of evaluators) {
      // Déjà évalué → skip
      if (evaluatedIds.has(evaluator.id)) {
        skipped++
        continue
      }

      // Vérifier notification_prefs
      const prefs = evaluator.notification_prefs as Record<string, boolean> | null
      if (prefs?.evaluation_reminder === false) {
        skipped++
        continue
      }

      // Vérifier si déjà rappelé il y a moins de 24h
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      const { data: recentNotif } = await supabase
        .from('notifications_log')
        .select('id')
        .eq('recipient_id', evaluator.id)
        .eq('type', 'evaluation_reminder')
        .gte('sent_at', yesterday.toISOString())
        .limit(1)
        .single()

      if (recentNotif) {
        skipped++
        continue
      }

      // Envoyer le rappel
      const result = await sendEvaluationReminderEmail({
        to: evaluator.email,
        projectTitle: project.title,
        projectUrl: `${appUrl}/projects/${project.id}/evaluate`,
        hoursLeft,
      })

      // Logger dans notifications_log
      await supabase.from('notifications_log').insert({
        recipient_id: evaluator.id,
        type: 'evaluation_reminder',
        channel: 'email',
        status: result.success ? 'sent' : 'failed',
        payload: { project_id: project.id, error: result.error ?? null },
      })

      if (result.success) sent++
      else skipped++
    }
  }

  return NextResponse.json({
    processed: urgentProjects.length,
    sent,
    skipped,
  })
}
