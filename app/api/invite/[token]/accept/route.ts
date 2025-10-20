import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/permissions';
import prisma from '@/lib/database/prisma';

// POST - Accept organization invite
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const authResult = await requireAuth();

    if ('error' in authResult) {
      return authResult.error;
    }

    const { context } = authResult;
    const { token } = await params;

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
          userId: context.userId,
          organizationId,
          role
        }
      });

      // Update user's current organization
      await tx.user.update({
        where: { id: context.userId },
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

    // TODO: Send email notification to organization admins
    // await sendInviteAcceptedEmail(invite.organizationId, user?.email)

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
