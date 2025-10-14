import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth/server'
import prisma from '@/lib/database/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ inviteId: string }> }
) {
  try {
    const session = await getServerSession()
    const { inviteId } = await params

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

    // Only OWNER and ADMIN can cancel invites
    if (user.organizationRole !== 'OWNER' && user.organizationRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Verify invite belongs to user's organization
    const invite = await prisma.organizationInvite.findUnique({
      where: { id: inviteId }
    })

    if (!invite || invite.organizationId !== user.organizationId) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 })
    }

    // Delete invite
    await prisma.organizationInvite.delete({
      where: { id: inviteId }
    })

    return NextResponse.json({ message: 'Invite cancelled successfully' })
  } catch (error) {
    console.error('Error cancelling invite:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
