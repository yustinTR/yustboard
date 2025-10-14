import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth/server'
import prisma from '@/lib/database/prisma'
import { randomBytes } from 'crypto'

export async function POST(request: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        organizationId: true,
        organizationRole: true,
        organization: {
          select: {
            name: true,
            settings: {
              select: {
                allowUserInvites: true
              }
            }
          }
        }
      }
    })

    if (!user?.organizationId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }

    // Check permissions
    const canInvite = user.organizationRole === 'OWNER' ||
                      user.organizationRole === 'ADMIN' ||
                      (user.organization?.settings?.allowUserInvites && user.organizationRole === 'MEMBER')

    if (!canInvite) {
      return NextResponse.json({ error: 'You do not have permission to invite users' }, { status: 403 })
    }

    const body = await request.json()
    const { email, role } = body

    if (!email || !role) {
      return NextResponse.json({ error: 'Email and role are required' }, { status: 400 })
    }

    // Check if user already exists in organization
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        organizationId: user.organizationId
      }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'User is already a member of this organization' }, { status: 400 })
    }

    // Check if invite already exists
    const existingInvite = await prisma.organizationInvite.findFirst({
      where: {
        organizationId: user.organizationId,
        email,
        acceptedAt: null,
        expiresAt: {
          gt: new Date()
        }
      }
    })

    if (existingInvite) {
      return NextResponse.json({ error: 'An active invite already exists for this email' }, { status: 400 })
    }

    // Generate invite token
    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // Expires in 7 days

    // Create invite
    const invite = await prisma.organizationInvite.create({
      data: {
        organizationId: user.organizationId,
        email,
        role,
        token,
        expiresAt
      }
    })

    // TODO: Send email with invite link
    // const inviteLink = `${process.env.NEXTAUTH_URL}/invite/${token}`
    // await sendInviteEmail(email, user.organization.name, inviteLink)

    return NextResponse.json({
      invite: {
        id: invite.id,
        email: invite.email,
        role: invite.role,
        createdAt: invite.createdAt,
        expiresAt: invite.expiresAt
      },
      message: 'Invite created successfully'
    })
  } catch (error) {
    console.error('Error creating invite:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
