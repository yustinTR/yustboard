import { render } from '@react-email/render';
import VerifyEmail from '@/emails/VerifyEmail';
import { getResendClient } from './resend';
import { logger } from '@/lib/logger';

interface SendVerificationEmailParams {
  to: string;
  userName: string;
  verificationToken: string;
}

export async function sendVerificationEmail({
  to,
  userName,
  verificationToken,
}: SendVerificationEmailParams): Promise<boolean> {
  try {
    const resend = getResendClient();

    if (!resend) {
      logger.warn('Resend client not configured, skipping verification email');
      console.log(`
        📧 VERIFICATION EMAIL (would be sent to ${to}):
        Verify your email: ${process.env.NEXTAUTH_URL}/verify-email?token=${verificationToken}
      `);
      return true; // Return true so registration flow continues
    }

    const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${verificationToken}`;

    const emailHtml = await render(
      VerifyEmail({
        userName,
        verificationUrl,
      })
    );

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'YustBoard <onboarding@resend.dev>',
      to: [to],
      subject: 'Verifieer je e-mailadres - YustBoard',
      html: emailHtml,
    });

    if (error) {
      logger.error('Failed to send verification email:', error);
      return false;
    }

    logger.debug('Verification email sent successfully:', { to, emailId: data?.id });
    return true;
  } catch (error) {
    logger.error('Error sending verification email:', error as Error);
    return false;
  }
}
