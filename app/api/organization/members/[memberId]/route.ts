import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth/server'
import prisma from '@/lib/database/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const session = await getServerSession()
    const { memberId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { organizationId: true, organizationRole: true }
    })

    if (!user?.organizationId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }

    // Only OWNER and ADMIN can remove members
    if (user.organizationRole !== 'OWNER' && user.organizationRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Verify member belongs to same organization
    const member = await prisma.user.findUnique({
      where: { id: memberId },
      select: { organizationId: true, organizationRole: true }
    })

    if (!member || member.organizationId !== user.organizationId) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Cannot remove OWNER
    if (member.organizationRole === 'OWNER') {
      return NextResponse.json({ error: 'Cannot remove owner' }, { status: 400 })
    }

    // Remove member from organization (set organizationId to null)
    await prisma.user.update({
      where: { id: memberId },
      data: {
        organizationId: null,
        organizationRole: 'MEMBER' // Reset to default
      }
    })

    return NextResponse.json({ message: 'Member removed successfully' })
  } catch (error) {
    console.error('Error removing member:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
