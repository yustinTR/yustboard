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

interface PasswordResetEmailProps {
  userName: string;
  resetUrl: string;
}

export default function PasswordResetEmail({
  userName,
  resetUrl,
}: PasswordResetEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Reset je wachtwoord voor YustBoard
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>🔐 Wachtwoord Reset</Heading>

          <Text style={text}>
            Hallo <strong>{userName}</strong>,
          </Text>

          <Text style={text}>
            We hebben een verzoek ontvangen om je wachtwoord te resetten. Klik op de knop hieronder om een nieuw wachtwoord in te stellen.
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={resetUrl}>
              Reset Wachtwoord
            </Button>
          </Section>

          <Text style={text}>
            Of kopieer deze link naar je browser:
          </Text>

          <Text style={link}>
            {resetUrl}
          </Text>

          <Text style={text}>
            Deze link is 1 uur geldig.
          </Text>

          <Text style={warning}>
            ⚠️ Als je dit verzoek niet hebt gedaan, kun je deze e-mail negeren. Je wachtwoord blijft dan ongewijzigd.
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

const link = {
  color: '#3b82f6',
  fontSize: '14px',
  lineHeight: '24px',
  wordBreak: 'break-all' as const,
  margin: '0 0 20px',
};

const warning = {
  color: '#dc2626',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '20px 0',
  padding: '12px',
  backgroundColor: '#fee2e2',
  borderRadius: '6px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '30px 0',
};

const button = {
  backgroundColor: '#dc2626',
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
