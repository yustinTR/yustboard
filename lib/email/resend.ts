import { Resend } from 'resend';

// Initialize Resend with API key (only if available)
let resend: Resend | null = null;

function getResendClient() {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  react: React.ReactElement;
}

/**
 * Send an email using Resend
 */
export async function sendEmail({ to, subject, react }: SendEmailOptions) {
  const client = getResendClient();

  if (!client) {
    console.warn('Resend API key not configured, skipping email send');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const from = process.env.RESEND_FROM_EMAIL || 'YustBoard <onboarding@resend.dev>';

    const { data, error } = await client.emails.send({
      from,
      to,
      subject,
      react,
    });

    if (error) {
      console.error('Error sending email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log('Email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error in sendEmail:', error);
    throw error;
  }
}

export { getResendClient };
export default getResendClient;
