import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/database/prisma';

// GET - Fetch invite details by token
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

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

    if (!invite.organization) {
      return NextResponse.json(
        { error: 'Invalid invite: organization not found' },
        { status: 404 }
      );
    }

    // Check if expired
    const isExpired = new Date(invite.expiresAt) < new Date();

    // Return invite data
    return NextResponse.json({
      invite: {
        id: invite.id,
        email: invite.email,
        role: invite.role,
        organization: {
          name: invite.organization.name,
          slug: invite.organization.slug
        },
        expiresAt: invite.expiresAt.toISOString(),
        isExpired,
        isAccepted: invite.acceptedAt !== null
      }
    });
  } catch (error) {
    console.error('Error fetching invite:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invite' },
      { status: 500 }
    );
  }
}
