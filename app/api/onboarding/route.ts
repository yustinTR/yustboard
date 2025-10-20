import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth/server'
import prisma from '@/lib/database/prisma'

export async function POST(request: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user already has an organization
    const existingUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { organizationId: true }
    })

    if (existingUser?.organizationId) {
      return NextResponse.json(
        { error: 'User already belongs to an organization' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { organizationName, organizationSlug } = body

    if (!organizationName || !organizationSlug) {
      return NextResponse.json(
        { error: 'Organization name and slug are required' },
        { status: 400 }
      )
    }

    // Validate slug format (lowercase, alphanumeric, hyphens only)
    const slugRegex = /^[a-z0-9-]+$/
    if (!slugRegex.test(organizationSlug)) {
      return NextResponse.json(
        { error: 'Slug must contain only lowercase letters, numbers, and hyphens' },
        { status: 400 }
      )
    }

    // Check if slug is already taken
    const existingOrg = await prisma.organization.findUnique({
      where: { slug: organizationSlug }
    })

    if (existingOrg) {
      return NextResponse.json(
        { error: 'This organization slug is already taken' },
        { status: 400 }
      )
    }

    // Create organization and update user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the organization
      const organization = await tx.organization.create({
        data: {
          name: organizationName,
          slug: organizationSlug,
          plan: 'FREE',
          settings: {
            create: {
              allowUserInvites: true,
              maxUsers: 5, // FREE plan limit
              brandingEnabled: false
            }
          }
        },
        include: {
          settings: true
        }
      })

      // Create membership record
      await tx.organizationMembership.create({
        data: {
          userId: session.user.id!,
          organizationId: organization.id,
          role: 'OWNER'
        }
      })

      // Update user's current organization
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          organizationId: organization.id,
          organizationRole: 'OWNER'
        }
      })

      return organization
    })

    return NextResponse.json({
      success: true,
      organization: result
    })
  } catch (error) {
    console.error('Error creating organization:', error)
    return NextResponse.json(
      { error: 'Failed to create organization' },
      { status: 500 }
    )
  }
}

// Check if user needs onboarding
export async function GET() {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json({ needsOnboarding: false, authenticated: false })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        organizationId: true,
        organization: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    })

    return NextResponse.json({
      needsOnboarding: !user?.organizationId,
      authenticated: true,
      organization: user?.organization || null
    })
  } catch (error) {
    console.error('Error checking onboarding status:', error)
    return NextResponse.json(
      { error: 'Failed to check onboarding status' },
      { status: 500 }
    )
  }
}
