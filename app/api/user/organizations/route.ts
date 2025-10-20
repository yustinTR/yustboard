import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth/server'
import prisma from '@/lib/database/prisma'

export async function GET() {
  try {
    const session = await getServerSession()

    console.log('🔐 /api/user/organizations session check:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      userKeys: session?.user ? Object.keys(session.user) : []
    });

    if (!session?.user?.id) {
      console.log('❌ No session.user.id, returning 401');
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

    // Get all organizations where this user has a membership
    const memberships = await prisma.organizationMembership.findMany({
      where: {
        userId: session.user.id
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
      },
      orderBy: {
        organization: {
          name: 'asc'
        }
      }
    })

    const organizations = memberships.map(m => m.organization)

    return NextResponse.json({
      organizations,
      current: user.organization
    })
  } catch (error) {
    console.error('Error fetching user organizations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
