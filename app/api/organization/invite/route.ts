import { NextResponse } from 'next/server'
import { requirePermission } from '@/lib/permissions'
import prisma from '@/lib/database/prisma'
import { randomBytes } from 'crypto'
import { sendInviteEmail } from '@/lib/email/send-invite'

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

    // Check if an active (non-expired, non-accepted) invite exists
    const activeInvite = await prisma.organizationInvite.findFirst({
      where: {
        organizationId: context.organizationId,
        email,
        acceptedAt: null,
        expiresAt: {
          gt: new Date()
        }
      }
    })

    if (activeInvite) {
      return NextResponse.json({ error: 'An active invite already exists for this email' }, { status: 400 })
    }

    // Delete any old invites (expired or accepted) for this email to avoid unique constraint conflict
    await prisma.organizationInvite.deleteMany({
      where: {
        organizationId: context.organizationId,
        email
      }
    })

    // Generate invite token
    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // Expires in 7 days

    // Get organization and inviter details for email
    const organization = await prisma.organization.findUnique({
      where: { id: context.organizationId },
      select: { name: true }
    })

    const inviter = await prisma.user.findUnique({
      where: { id: context.userId },
      select: { name: true, email: true }
    })

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

    // Send invite email (don't fail if email fails)
    try {
      await sendInviteEmail({
        to: email,
        invitedByName: inviter?.name || 'A team member',
        invitedByEmail: inviter?.email || '',
        organizationName: organization?.name || 'Your organization',
        inviteToken: token,
        role
      })
      console.log(`Invite email sent to ${email}`)
    } catch (emailError) {
      console.error('Failed to send invite email, but invite was created:', emailError)
      // Continue - invite is still valid even if email fails
    }

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
