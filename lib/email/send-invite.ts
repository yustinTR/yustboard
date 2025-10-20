import { sendEmail } from './resend';
import InviteEmail from '@/emails/InviteEmail';

export interface SendInviteEmailParams {
  to: string;
  invitedByName: string;
  invitedByEmail: string;
  organizationName: string;
  inviteToken: string;
  role: string;
}

/**
 * Send a team invite email
 */
export async function sendInviteEmail(params: SendInviteEmailParams) {
  const { to, invitedByName, invitedByEmail, organizationName, inviteToken, role } = params;

  // Build invite link
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const inviteLink = `${baseUrl}/invite/${inviteToken}`;

  try {
    await sendEmail({
      to,
      subject: `${invitedByName} heeft je uitgenodigd voor ${organizationName}`,
      react: InviteEmail({
        invitedByName,
        invitedByEmail,
        organizationName,
        inviteLink,
        role,
      }),
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send invite email:', error);
    // Don't throw - we don't want invite creation to fail if email fails
    return { success: false, error };
  }
}
