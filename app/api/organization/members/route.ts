import { NextResponse } from 'next/server'
import { requirePermission, isOwner } from '@/lib/permissions'
import prisma from '@/lib/database/prisma'

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

    return NextResponse.json({ member: updatedMember })
  } catch (error) {
    console.error('Error updating member role:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
