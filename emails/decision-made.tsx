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

type DecisionType = 'approved' | 'rejected' | 'deferred'

type DecisionMadeEmailProps = {
  projectTitle: string
  decision: DecisionType
  rationale: string
  projectUrl: string
  repoUrl?: string
  platformName?: string
}

const DECISION_LABELS: Record<DecisionType, string> = {
  approved: 'APPROUVÉ ✓',
  rejected: 'REJETÉ ✗',
  deferred: 'DIFFÉRÉ ⏸',
}

const DECISION_COLORS: Record<DecisionType, string> = {
  approved: '#34d399',
  rejected: '#f87171',
  deferred: '#fbbf24',
}

const BUTTON_COLORS: Record<DecisionType, string> = {
  approved: '#059669',
  rejected: '#dc2626',
  deferred: '#d97706',
}

export function DecisionMadeEmail({
  projectTitle,
  decision,
  rationale,
  projectUrl,
  repoUrl,
  platformName = 'Projets Elite',
}: DecisionMadeEmailProps): React.JSX.Element {
  return (
    <Html>
      <Head />
      <Preview>
        Décision — {projectTitle} : {DECISION_LABELS[decision]}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>{platformName}</Heading>
          <Text style={{ ...decisionBadge, color: DECISION_COLORS[decision] }}>
            {DECISION_LABELS[decision]}
          </Text>
          <Heading style={h2}>{projectTitle}</Heading>
          <Text style={text}>
            <strong style={{ color: '#e5e7eb' }}>Justification :</strong>
          </Text>
          <Text style={rationale_style}>{rationale}</Text>
          <Button href={projectUrl} style={{ ...button, backgroundColor: BUTTON_COLORS[decision] }}>
            Voir les résultats
          </Button>
          {repoUrl && (
            <Text style={smallText}>
              Repo / Deal :{' '}
              <a href={repoUrl} style={{ color: '#60a5fa' }}>
                {repoUrl}
              </a>
            </Text>
          )}
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
const decisionBadge = { fontSize: '13px', fontWeight: '700', letterSpacing: '0.05em', margin: '8px 0' }
const rationale_style = {
  color: '#d1d5db',
  fontSize: '14px',
  lineHeight: '1.7',
  borderLeft: '3px solid #374151',
  paddingLeft: '12px',
  margin: '12px 0',
}
const button = {
  color: '#ffffff',
  padding: '12px 28px',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'none',
  display: 'inline-block',
  margin: '24px 0',
}
const smallText = { color: '#4b5563', fontSize: '12px', marginTop: '12px' }
