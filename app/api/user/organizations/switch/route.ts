import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth/server'
import prisma from '@/lib/database/prisma'

export async function POST(request: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { organizationId } = body

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 })
    }

    // Verify user has a membership in the target organization
    const membership = await prisma.organizationMembership.findUnique({
      where: {
        userId_organizationId: {
          userId: session.user.id,
          organizationId: organizationId
        }
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            plan: true
          }
        }
      }
    })

    if (!membership) {
      return NextResponse.json(
        { error: 'Organization not found or you are not a member' },
        { status: 404 }
      )
    }

    const organization = membership.organization

    // Update user's current organization
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        organizationId: organizationId
      }
    })

    return NextResponse.json({
      organization,
      message: 'Organization switched successfully'
    })
  } catch (error) {
    console.error('Error switching organization:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
