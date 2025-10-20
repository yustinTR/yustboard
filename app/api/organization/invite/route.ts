import { NextResponse } from 'next/server'
import { requirePermission } from '@/lib/permissions'
import prisma from '@/lib/database/prisma'
import { randomBytes } from 'crypto'

export async function POST(request: Request) {
  try {
    // Require permission to invite members
    const authResult = await requirePermission('members:invite')

    if ('error' in authResult) {
      return authResult.error
    }

    const { context } = authResult

    const body = await request.json()
    const { email, role } = body

    if (!email || !role) {
      return NextResponse.json({ error: 'Email and role are required' }, { status: 400 })
    }

    // Check if user already exists in organization
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        organizationId: context.organizationId
      }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'User is already a member of this organization' }, { status: 400 })
    }

    // Check if invite already exists
    const existingInvite = await prisma.organizationInvite.findFirst({
      where: {
        organizationId: context.organizationId,
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
        organizationId: context.organizationId,
        email,
        role,
        token,
        expiresAt
      }
    })

    // TODO: Send email with invite link
    // const inviteLink = `${process.env.NEXTAUTH_URL}/invite/${token}`
    // const org = await prisma.organization.findUnique({ where: { id: context.organizationId }, select: { name: true } })
    // await sendInviteEmail(email, org?.name, inviteLink)

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
