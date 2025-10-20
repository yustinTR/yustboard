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

interface InviteEmailProps {
  invitedByName: string;
  invitedByEmail: string;
  organizationName: string;
  inviteLink: string;
  role: string;
}

export default function InviteEmail({
  invitedByName,
  invitedByEmail,
  organizationName,
  inviteLink,
  role,
}: InviteEmailProps) {
  const roleText = role === 'ADMIN' ? 'Beheerder' : role === 'MEMBER' ? 'Lid' : 'Kijker';

  return (
    <Html>
      <Head />
      <Preview>
        {invitedByName} heeft je uitgenodigd om lid te worden van {organizationName}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>🎉 Je bent uitgenodigd!</Heading>

          <Text style={text}>
            <strong>{invitedByName}</strong> ({invitedByEmail}) heeft je uitgenodigd om lid te worden van{' '}
            <strong>{organizationName}</strong> op YustBoard.
          </Text>

          <Text style={text}>
            Je rol zal zijn: <strong>{roleText}</strong>
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={inviteLink}>
              Accepteer Uitnodiging
            </Button>
          </Section>

          <Text style={text}>
            Of kopieer en plak deze link in je browser:
          </Text>
          <Text style={link}>{inviteLink}</Text>

          <Text style={footer}>
            Deze uitnodiging verloopt over 7 dagen. Als je deze uitnodiging niet verwachtte, kun je deze email negeren.
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

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '30px 0',
};

const button = {
  backgroundColor: '#5469d4',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
};

const link = {
  color: '#5469d4',
  fontSize: '14px',
  lineHeight: '24px',
  wordBreak: 'break-all' as const,
  marginBottom: '20px',
};

const footer = {
  color: '#9ca299',
  fontSize: '14px',
  lineHeight: '24px',
  marginTop: '30px',
};
