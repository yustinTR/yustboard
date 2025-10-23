import { NextResponse } from 'next/server'
import { requirePermission, isOwner } from '@/lib/permissions'
import prisma from '@/lib/database/prisma'
import { createNotification } from '@/lib/notifications/create'

// GET /api/organization/members - Fetch members for @mentions
export async function GET(request: Request) {
  try {
    const authResult = await requirePermission('members:view')

    if ('error' in authResult) {
      return authResult.error
    }

    const { context } = authResult

    // Get search query parameter
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.toLowerCase() || ''

    // Fetch organization members
    const memberships = await prisma.organizationMembership.findMany({
      where: {
        organizationId: context.organizationId,
        user: query
          ? {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } },
              ],
            }
          : undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      take: 10,
      orderBy: {
        user: {
          name: 'asc',
        },
      },
    })

    // Map to simple user objects
    const members = memberships.map((m) => m.user)

    return NextResponse.json({ members })
  } catch (error) {
    console.error('Error fetching organization members:', error)
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    // Require permission to update member roles
    const authResult = await requirePermission('members:update-role')

    if ('error' in authResult) {
      return authResult.error
    }

    const { context } = authResult

    const body = await request.json()
    const { memberId, role } = body

    if (!memberId || !role) {
      return NextResponse.json({ error: 'Member ID and role are required' }, { status: 400 })
    }

    // Verify member has membership in same organization
    const membership = await prisma.organizationMembership.findUnique({
      where: {
        userId_organizationId: {
          userId: memberId,
          organizationId: context.organizationId
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!membership) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Cannot change OWNER role
    if (membership.role === 'OWNER') {
      return NextResponse.json({ error: 'Cannot change owner role' }, { status: 400 })
    }

    // Only OWNER can promote to OWNER
    if (role === 'OWNER' && !isOwner(context.organizationRole)) {
      return NextResponse.json({ error: 'Only owner can promote to owner' }, { status: 403 })
    }

    // Update member role in membership
    const updatedMembership = await prisma.organizationMembership.update({
      where: {
        userId_organizationId: {
          userId: memberId,
          organizationId: context.organizationId
        }
      },
      data: { role },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    const updatedMember = {
      ...updatedMembership.user,
      organizationRole: updatedMembership.role
    }

    // Notify the member about role change
    try {
      const roleNames: Record<string, string> = {
        OWNER: 'Eigenaar',
        ADMIN: 'Beheerder',
        MEMBER: 'Lid',
        VIEWER: 'Kijker'
      };

      const org = await prisma.organization.findUnique({
        where: { id: context.organizationId },
        select: { name: true }
      });

      await createNotification({
        userId: memberId,
        organizationId: context.organizationId,
        type: 'ROLE_CHANGED',
        title: 'Je rol is gewijzigd',
        message: `Je rol in ${org?.name || 'de organisatie'} is gewijzigd naar ${roleNames[role] || role}`,
        link: '/dashboard/settings?tab=organization'
      });
    } catch (notifError) {
      console.error('Failed to create role change notification:', notifError);
      // Continue - role was already updated
    }

    return NextResponse.json({ member: updatedMember })
  } catch (error) {
    console.error('Error updating member role:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
