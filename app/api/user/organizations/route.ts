import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth/server'
import prisma from '@/lib/database/prisma'

export async function GET() {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current user with their organization
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        organizationId: true,
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

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // For now, we only return the user's current organization
    // In the future, users might be members of multiple organizations
    const organizations = user.organization ? [user.organization] : []

    // Get all organizations where this user is a member
    // This will be used when we implement multi-org membership
    const allOrganizations = await prisma.organization.findMany({
      where: {
        users: {
          some: {
            id: session.user.id
          }
        }
      },
      select: {
        id: true,
        name: true,
        slug: true,
        plan: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({
      organizations: allOrganizations.length > 0 ? allOrganizations : organizations,
      current: user.organization
    })
  } catch (error) {
    console.error('Error fetching user organizations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
