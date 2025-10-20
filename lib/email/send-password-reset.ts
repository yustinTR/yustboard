import { render } from '@react-email/render';
import PasswordResetEmail from '@/emails/PasswordResetEmail';
import { getResendClient } from './resend';
import { logger } from '@/lib/logger';

interface SendPasswordResetEmailParams {
  to: string;
  userName: string;
  resetToken: string;
}

export async function sendPasswordResetEmail({
  to,
  userName,
  resetToken,
}: SendPasswordResetEmailParams): Promise<boolean> {
  try {
    const resend = getResendClient();

    if (!resend) {
      logger.warn('Resend client not configured, skipping password reset email');
      console.log(`
        📧 PASSWORD RESET EMAIL (would be sent to ${to}):
        Reset your password: ${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}
      `);
      return true; // Return true so flow continues
    }

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;

    const emailHtml = await render(
      PasswordResetEmail({
        userName,
        resetUrl,
      })
    );

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'YustBoard <onboarding@resend.dev>',
      to: [to],
      subject: 'Wachtwoord Resetten - YustBoard',
      html: emailHtml,
    });

    if (error) {
      logger.error('Failed to send password reset email:', error);
      return false;
    }

    logger.debug('Password reset email sent successfully:', { to, emailId: data?.id });
    return true;
  } catch (error) {
    logger.error('Error sending password reset email:', error as Error);
    return false;
  }
}
