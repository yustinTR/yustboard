import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/permissions'
import prisma from '@/lib/database/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    // Require permission to remove members
    const authResult = await requirePermission('members:remove')

    if ('error' in authResult) {
      return authResult.error
    }

    const { context } = authResult
    const { memberId } = await params

    // Verify member has membership in same organization
    const membership = await prisma.organizationMembership.findUnique({
      where: {
        userId_organizationId: {
          userId: memberId,
          organizationId: context.organizationId
        }
      }
    })

    if (!membership) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Cannot remove OWNER
    if (membership.role === 'OWNER') {
      return NextResponse.json({ error: 'Cannot remove owner' }, { status: 400 })
    }

    // Remove membership
    await prisma.organizationMembership.delete({
      where: {
        userId_organizationId: {
          userId: memberId,
          organizationId: context.organizationId
        }
      }
    })

    // If this was the user's current organization, unset it
    const targetUser = await prisma.user.findUnique({
      where: { id: memberId },
      select: { organizationId: true }
    })

    if (targetUser?.organizationId === context.organizationId) {
      await prisma.user.update({
        where: { id: memberId },
        data: {
          organizationId: null,
          organizationRole: 'MEMBER'
        }
      })
    }

    return NextResponse.json({ message: 'Member removed successfully' })
  } catch (error) {
    console.error('Error removing member:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
