import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/server';
import prisma from '@/lib/database/prisma';

// GET - Fetch announcements for current organization
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's current organization
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { organizationId: true }
    });

    if (!user?.organizationId) {
      return NextResponse.json({ error: 'User must belong to an organization' }, { status: 400 });
    }

    const searchParams = request.nextUrl.searchParams;
    const publishedOnly = searchParams.get('published') === 'true';

    const announcements = await prisma.announcement.findMany({
      where: {
        organizationId: user.organizationId,
        ...(publishedOnly && { published: true })
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      },
      orderBy: [
        { published: 'desc' },
        { publishedAt: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json({ announcements });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch announcements' },
      { status: 500 }
    );
  }
}

// POST - Create new announcement (ADMIN/OWNER only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's current organization and role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        organizationId: true,
        organizationRole: true
      }
    });

    if (!user?.organizationId) {
      return NextResponse.json({ error: 'User must belong to an organization' }, { status: 400 });
    }

    // Check if user has permission (ADMIN or OWNER)
    if (user.organizationRole !== 'ADMIN' && user.organizationRole !== 'OWNER') {
      return NextResponse.json({ error: 'Forbidden: Only admins can create announcements' }, { status: 403 });
    }

    const { title, content, coverImage, published } = await request.json();

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        coverImage,
        published: published || false,
        publishedAt: published ? new Date() : null,
        authorId: session.user.id,
        organizationId: user.organizationId
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    });

    return NextResponse.json(announcement);
  } catch (error) {
    console.error('Error creating announcement:', error);
    return NextResponse.json(
      { error: 'Failed to create announcement' },
      { status: 500 }
    );
  }
}
