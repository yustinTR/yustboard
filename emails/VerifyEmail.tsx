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

interface VerifyEmailProps {
  userName: string;
  verificationUrl: string;
}

export default function VerifyEmail({
  userName,
  verificationUrl,
}: VerifyEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Verifieer je e-mailadres voor YustBoard
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>✉️ Verifieer je e-mailadres</Heading>

          <Text style={text}>
            Hallo <strong>{userName}</strong>,
          </Text>

          <Text style={text}>
            Welkom bij YustBoard! Klik op de knop hieronder om je e-mailadres te verifiëren en toegang te krijgen tot je dashboard.
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={verificationUrl}>
              Verifieer E-mailadres
            </Button>
          </Section>

          <Text style={text}>
            Of kopieer deze link naar je browser:
          </Text>

          <Text style={link}>
            {verificationUrl}
          </Text>

          <Text style={text}>
            Deze link is 24 uur geldig.
          </Text>

          <Text style={footer}>
            Als je dit account niet hebt aangemaakt, kun je deze e-mail negeren.<br />
            <br />
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

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '30px 0',
};

const button = {
  backgroundColor: '#3b82f6',
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
