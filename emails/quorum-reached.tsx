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

type QuorumReachedEmailProps = {
  projectTitle: string
  resultsUrl: string
  evaluationCount: number
  platformName?: string
}

export function QuorumReachedEmail({
  projectTitle,
  resultsUrl,
  evaluationCount,
  platformName = 'Projets Elite',
}: QuorumReachedEmailProps): React.JSX.Element {
  return (
    <Html>
      <Head />
      <Preview>Quorum atteint — {projectTitle}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>{platformName}</Heading>
          <Heading style={h2}>Quorum atteint ✓</Heading>
          <Text style={text}>
            Le projet <strong style={{ color: '#ffffff' }}>{projectTitle}</strong> a atteint le quorum
            avec <strong style={{ color: '#34d399' }}>{evaluationCount} évaluation{evaluationCount > 1 ? 's' : ''}</strong>.
            Les résultats agrégés sont maintenant disponibles.
          </Text>
          <Button href={resultsUrl} style={button}>
            Voir les résultats
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
  backgroundColor: '#059669',
  color: '#ffffff',
  padding: '12px 28px',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'none',
  display: 'inline-block',
  margin: '24px 0',
}
