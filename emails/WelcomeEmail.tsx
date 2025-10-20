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
} from '@react-email/components';

interface WelcomeEmailProps {
  userName: string;
  organizationName: string;
  role: string;
  dashboardUrl: string;
}

export default function WelcomeEmail({
  userName,
  organizationName,
  role,
  dashboardUrl,
}: WelcomeEmailProps) {
  const roleText = role === 'OWNER' ? 'Eigenaar' : role === 'ADMIN' ? 'Beheerder' : role === 'MEMBER' ? 'Lid' : 'Kijker';

  return (
    <Html>
      <Head />
      <Preview>
        Welkom bij {organizationName} op YustBoard!
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>🎉 Welkom bij {organizationName}!</Heading>

          <Text style={text}>
            Hallo <strong>{userName}</strong>,
          </Text>

          <Text style={text}>
            Je bent nu lid van <strong>{organizationName}</strong> op YustBoard met de rol <strong>{roleText}</strong>.
          </Text>

          <Text style={text}>
            YustBoard is jouw persoonlijke dashboard waar je al je belangrijke informatie op één plek kunt verzamelen:
          </Text>

          <ul style={list}>
            <li style={listItem}>📧 Gmail integratie</li>
            <li style={listItem}>📅 Agenda en taken</li>
            <li style={listItem}>💰 Banking transacties</li>
            <li style={listItem}>📰 Nieuws feeds</li>
            <li style={listItem}>🌤️ Weer updates</li>
            <li style={listItem}>✍️ Blog posts</li>
          </ul>

          <Section style={buttonContainer}>
            <Button style={button} href={dashboardUrl}>
              Ga naar Dashboard
            </Button>
          </Section>

          <Text style={text}>
            Heb je vragen? Je teamgenoten helpen je graag op weg!
          </Text>

          <Text style={footer}>
            Met vriendelijke groet,<br />
            Het YustBoard Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  marginTop: '40px',
  marginBottom: '40px',
  borderRadius: '8px',
  maxWidth: '600px',
};

const h1 = {
  color: '#1a1a1a',
  fontSize: '28px',
  fontWeight: '700',
  margin: '0 0 30px',
  padding: '0',
  lineHeight: '1.4',
};

const text = {
  color: '#484848',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 20px',
};

const list = {
  margin: '0 0 20px',
  padding: '0 0 0 20px',
};

const listItem = {
  color: '#484848',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 10px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '30px 0',
};

const button = {
  backgroundColor: '#10b981',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
};

const footer = {
  color: '#9ca299',
  fontSize: '14px',
  lineHeight: '24px',
  marginTop: '30px',
};
