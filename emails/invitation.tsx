import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'

type InvitationEmailProps = {
  inviteUrl: string
  role: string
  platformName?: string
}

export function InvitationEmail({
  inviteUrl,
  role,
  platformName = 'Veille Élite',
}: InvitationEmailProps): React.JSX.Element {
  const roleLabel = role === 'admin' ? 'Administrateur' : role === 'evaluateur' ? 'Évaluateur' : 'Contributeur'

  return (
    <Html>
      <Head />
      <Preview>Vous êtes invité à rejoindre {platformName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>{platformName}</Heading>
          <Text style={text}>
            Vous avez été invité à rejoindre la plateforme de décision d&apos;investissement{' '}
            <strong>{platformName}</strong> en tant que <strong>{roleLabel}</strong>.
          </Text>
          <Section style={buttonSection}>
            <Button href={inviteUrl} style={button}>
              Accepter l&apos;invitation
            </Button>
          </Section>
          <Text style={smallText}>
            Ce lien est valable 7 jours. Si vous n&apos;avez pas demandé cet accès, ignorez cet email.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = { backgroundColor: '#0a0a0a', fontFamily: 'system-ui, sans-serif' }
const container = { maxWidth: '560px', margin: '0 auto', padding: '40px 20px' }
const h1 = { color: '#ffffff', fontSize: '22px', fontWeight: 'bold', marginBottom: '8px' }
const text = { color: '#9ca3af', fontSize: '15px', lineHeight: '1.6' }
const buttonSection = { textAlign: 'center' as const, margin: '32px 0' }
const button = {
  backgroundColor: '#2563eb',
  color: '#ffffff',
  padding: '12px 28px',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'none',
  display: 'inline-block',
}
const smallText = { color: '#4b5563', fontSize: '12px', marginTop: '24px' }
