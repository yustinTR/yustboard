import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requirePermission } from '@/lib/permissions';
import prisma from '@/lib/database/prisma';

// GET - Fetch single announcement
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ announcementId: string }> }
) {
  try {
    const authResult = await requireAuth();

    if ('error' in authResult) {
      return authResult.error;
    }

    const { context } = authResult;
    const { announcementId } = await params;

    const announcement = await prisma.announcement.findUnique({
      where: { id: announcementId },
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

    if (!announcement) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    }

    // Verify announcement belongs to user's organization
    if (announcement.organizationId !== context.organizationId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(announcement);
  } catch (error) {
    console.error('Error fetching announcement:', error);
    return NextResponse.json(
      { error: 'Failed to fetch announcement' },
      { status: 500 }
    );
  }
}

// PATCH - Update announcement (ADMIN/OWNER only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ announcementId: string }> }
) {
  try {
    const authResult = await requirePermission('announcements:update');

    if ('error' in authResult) {
      return authResult.error;
    }

    const { context } = authResult;
    const { announcementId } = await params;

    // Verify announcement belongs to user's organization
    const existingAnnouncement = await prisma.announcement.findUnique({
      where: { id: announcementId },
      select: { organizationId: true, published: true }
    });

    if (!existingAnnouncement) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    }

    if (existingAnnouncement.organizationId !== context.organizationId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { title, content, coverImage, published } = body;

    // If changing from unpublished to published, set publishedAt
    const shouldSetPublishedAt = published === true && !existingAnnouncement.published;

    const announcement = await prisma.announcement.update({
      where: { id: announcementId },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(coverImage !== undefined && { coverImage }),
        ...(published !== undefined && { published }),
        ...(shouldSetPublishedAt && { publishedAt: new Date() })
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
    console.error('Error updating announcement:', error);
    return NextResponse.json(
      { error: 'Failed to update announcement' },
      { status: 500 }
    );
  }
}

// DELETE - Delete announcement (ADMIN/OWNER only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ announcementId: string }> }
) {
  try {
    const authResult = await requirePermission('announcements:delete');

    if ('error' in authResult) {
      return authResult.error;
    }

    const { context } = authResult;
    const { announcementId } = await params;

    // Verify announcement belongs to user's organization
    const existingAnnouncement = await prisma.announcement.findUnique({
      where: { id: announcementId },
      select: { organizationId: true }
    });

    if (!existingAnnouncement) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    }

    if (existingAnnouncement.organizationId !== context.organizationId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.announcement.delete({
      where: { id: announcementId }
    });

    return NextResponse.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    return NextResponse.json(
      { error: 'Failed to delete announcement' },
      { status: 500 }
    );
  }
}
