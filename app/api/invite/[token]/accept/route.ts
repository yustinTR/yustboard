import { NextRequest, NextResponse } from 'next/server';
import { requireAuthOnly } from '@/lib/permissions';
import prisma from '@/lib/database/prisma';
import { sendWelcomeEmail } from '@/lib/email/send-welcome';
import { createBulkNotifications } from '@/lib/notifications/create';

// POST - Accept organization invite
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    // Use requireAuthOnly since user may not have an organization yet
    const authResult = await requireAuthOnly();

    if ('error' in authResult) {
      console.log('❌ Auth failed in invite accept:', authResult.error);
      return authResult.error;
    }

    const { userId } = authResult;
    const { token } = await params;

    console.log('✅ Accepting invite:', { userId, token });

    // Find the invite
    const invite = await prisma.organizationInvite.findUnique({
      where: { token },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    if (!invite) {
      return NextResponse.json(
        { error: 'Invite not found' },
        { status: 404 }
      );
    }

    // Check if expired
    if (new Date(invite.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'Invite has expired' },
        { status: 400 }
      );
    }

    // Check if already accepted
    if (invite.acceptedAt) {
      return NextResponse.json(
        { error: 'Invite has already been accepted' },
        { status: 400 }
      );
    }

    // Optional: Verify email matches (commented out to allow flexibility)
    // const user = await prisma.user.findUnique({
    //   where: { id: context.userId },
    //   select: { email: true }
    // });
    // if (user?.email !== invite.email) {
    //   return NextResponse.json(
    //     { error: 'This invite is for a different email address' },
    //     { status: 403 }
    //   );
    // }

    // Ensure organizationId exists
    if (!invite.organizationId) {
      return NextResponse.json(
        { error: 'Invalid invite: no organization' },
        { status: 400 }
      );
    }

    // Extract organizationId for type safety in transaction
    const organizationId = invite.organizationId;
    const role = invite.role;

    // Accept invite in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create organization membership
      const membership = await tx.organizationMembership.create({
        data: {
          userId,
          organizationId,
          role
        }
      });

      // Update user's current organization
      await tx.user.update({
        where: { id: userId },
        data: {
          organizationId,
          organizationRole: role
        }
      });

      // Mark invite as accepted
      await tx.organizationInvite.update({
        where: { id: invite.id },
        data: {
          acceptedAt: new Date()
        }
      });

      return membership;
    });

    // Get user details for welcome email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true }
    });

    // Send welcome email to new member
    if (user?.email && invite.organization) {
      try {
        await sendWelcomeEmail({
          to: user.email,
          userName: user.name || 'Team Member',
          organizationName: invite.organization.name,
          role: invite.role
        });
        console.log(`Welcome email sent to ${user.email}`);
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Continue - invite was already accepted
      }
    }

    // Notify org admins about new member
    try {
      const admins = await prisma.organizationMembership.findMany({
        where: {
          organizationId,
          role: { in: ['OWNER', 'ADMIN'] }
        },
        select: { userId: true }
      });

      if (admins.length > 0) {
        await createBulkNotifications(
          admins.map((a) => a.userId),
          {
            organizationId,
            type: 'MEMBER_JOINED',
            title: 'Nieuw teamlid',
            message: `${user?.name || 'Een nieuw lid'} is lid geworden van ${invite.organization?.name}`,
            link: '/dashboard/settings?tab=organization'
          }
        );
      }
    } catch (notifError) {
      console.error('Failed to create notifications:', notifError);
      // Continue - invite was already accepted
    }

    return NextResponse.json({
      message: 'Invite accepted successfully',
      organization: invite.organization,
      membership: result
    });
  } catch (error) {
    console.error('Error accepting invite:', error);
    return NextResponse.json(
      { error: 'Failed to accept invite' },
      { status: 500 }
    );
  }
}
