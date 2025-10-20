import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/permissions'
import prisma from '@/lib/database/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ inviteId: string }> }
) {
  try {
    // Require admin privileges to cancel invites
    const authResult = await requireAdmin()

    if ('error' in authResult) {
      return authResult.error
    }

    const { context } = authResult
    const { inviteId } = await params

    // Verify invite belongs to user's organization
    const invite = await prisma.organizationInvite.findUnique({
      where: { id: inviteId }
    })

    if (!invite || invite.organizationId !== context.organizationId) {
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
