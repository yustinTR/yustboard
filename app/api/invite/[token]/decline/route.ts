import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/database/prisma';

// POST - Decline organization invite
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Find the invite
    const invite = await prisma.organizationInvite.findUnique({
      where: { token }
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

    // Delete the invite
    await prisma.organizationInvite.delete({
      where: { id: invite.id }
    });

    // TODO: Send email notification to organization admins
    // await sendInviteDeclinedEmail(invite.organizationId, invite.email)

    return NextResponse.json({
      message: 'Invite declined successfully'
    });
  } catch (error) {
    console.error('Error declining invite:', error);
    return NextResponse.json(
      { error: 'Failed to decline invite' },
      { status: 500 }
    );
  }
}
