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

type EvaluationRequestedEmailProps = {
  projectTitle: string
  projectUrl: string
  deadline?: string
  platformName?: string
}

export function EvaluationRequestedEmail({
  projectTitle,
  projectUrl,
  deadline,
  platformName = 'Veille Élite',
}: EvaluationRequestedEmailProps): React.JSX.Element {
  return (
    <Html>
      <Head />
      <Preview>Nouveau projet à évaluer : {projectTitle}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>{platformName}</Heading>
          <Heading style={h2}>Nouveau projet à évaluer</Heading>
          <Text style={text}>
            Le projet <strong style={{ color: '#ffffff' }}>{projectTitle}</strong> est désormais ouvert
            à l&apos;évaluation.
          </Text>
          {deadline && (
            <Text style={text}>
              Date limite : <strong style={{ color: '#fbbf24' }}>{deadline}</strong>
            </Text>
          )}
          <Button href={projectUrl} style={button}>
            Évaluer ce projet
          </Button>
          <Text style={smallText}>
            Votre vote est anonyme jusqu&apos;au quorum. Vous recevrez les résultats agrégés une fois le quorum atteint.
          </Text>
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
  backgroundColor: '#2563eb',
  color: '#ffffff',
  padding: '12px 28px',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'none',
  display: 'inline-block',
  margin: '24px 0',
}
const smallText = { color: '#4b5563', fontSize: '12px', marginTop: '16px' }
