import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth/server'
import prisma from '@/lib/database/prisma'

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession()

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

    // Only OWNER and ADMIN can update member roles
    if (user.organizationRole !== 'OWNER' && user.organizationRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { memberId, role } = body

    if (!memberId || !role) {
      return NextResponse.json({ error: 'Member ID and role are required' }, { status: 400 })
    }

    // Verify member belongs to same organization
    const member = await prisma.user.findUnique({
      where: { id: memberId },
      select: { organizationId: true, organizationRole: true }
    })

    if (!member || member.organizationId !== user.organizationId) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Cannot change OWNER role
    if (member.organizationRole === 'OWNER') {
      return NextResponse.json({ error: 'Cannot change owner role' }, { status: 400 })
    }

    // Only OWNER can promote to OWNER
    if (role === 'OWNER' && user.organizationRole !== 'OWNER') {
      return NextResponse.json({ error: 'Only owner can promote to owner' }, { status: 403 })
    }

    // Update member role
    const updatedMember = await prisma.user.update({
      where: { id: memberId },
      data: { organizationRole: role },
      select: {
        id: true,
        name: true,
        email: true,
        organizationRole: true
      }
    })

    return NextResponse.json({ member: updatedMember })
  } catch (error) {
    console.error('Error updating member role:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
