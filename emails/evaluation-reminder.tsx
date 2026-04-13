import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from '@react-email/components'

type EvaluationReminderEmailProps = {
  projectTitle: string
  projectUrl: string
  hoursLeft: number
  platformName?: string
}

export function EvaluationReminderEmail({
  projectTitle,
  projectUrl,
  hoursLeft,
  platformName = 'Veille Élite',
}: EvaluationReminderEmailProps): React.JSX.Element {
  return (
    <Html>
      <Head />
      <Preview>{`Rappel : évaluation de ${projectTitle} — ${String(hoursLeft)}h restantes`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>{platformName}</Heading>
          <Heading style={h2}>Rappel d&apos;évaluation</Heading>
          <Text style={text}>
            Il vous reste <strong style={{ color: '#fbbf24' }}>{hoursLeft} heures</strong> pour évaluer
            le projet <strong style={{ color: '#ffffff' }}>{projectTitle}</strong>.
          </Text>
          <Text style={text}>
            Votre vote est indispensable pour atteindre le quorum et permettre la prise de décision.
          </Text>
          <Button href={projectUrl} style={button}>
            Évaluer maintenant
          </Button>
        </Container>
      </Body>
    </Html>
  )
}

const main = { backgroundColor: '#0a0a0a', fontFamily: 'system-ui, sans-serif' }
const container = { maxWidth: '560px', margin: '0 auto', padding: '40px 20px' }
const h1 = { color: '#ffffff', fontSize: '22px', fontWeight: 'bold', marginBottom: '4px' }
const h2 = { color: '#e5e7eb', fontSize: '17px', fontWeight: '600', marginBottom: '16px' }
const text = { color: '#9ca3af', fontSize: '15px', lineHeight: '1.6', margin: '8px 0' }
const button = {
  backgroundColor: '#d97706',
  color: '#ffffff',
  padding: '12px 28px',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'none',
  display: 'inline-block',
  margin: '24px 0',
}
