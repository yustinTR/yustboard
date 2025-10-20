import { sendEmail } from './resend';
import WelcomeEmail from '@/emails/WelcomeEmail';

export interface SendWelcomeEmailParams {
  to: string;
  userName: string;
  organizationName: string;
  role: string;
}

/**
 * Send a welcome email to a new team member
 */
export async function sendWelcomeEmail(params: SendWelcomeEmailParams) {
  const { to, userName, organizationName, role } = params;

  // Build dashboard link
  const dashboardUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard`;

  try {
    await sendEmail({
      to,
      subject: `Welkom bij ${organizationName}!`,
      react: WelcomeEmail({
        userName,
        organizationName,
        role,
        dashboardUrl,
      }),
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return { success: false, error };
  }
}
