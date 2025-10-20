import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/server';
import prisma from '@/lib/database/prisma';
import { supabaseAdmin } from '@/lib/database/supabase';
import { unlink } from 'fs/promises';
import path from 'path';

// DELETE - Delete media file
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ mediaId: string }> }
) {
  try {
    const session = await getServerSession();
    const { mediaId } = await params;

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

    // Get media file and verify it belongs to user's organization
    const mediaFile = await prisma.mediaFile.findUnique({
      where: { id: mediaId },
      select: {
        organizationId: true,
        url: true,
        filename: true
      }
    });

    if (!mediaFile) {
      return NextResponse.json({ error: 'Media file not found' }, { status: 404 });
    }

    if (mediaFile.organizationId !== user.organizationId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete from storage (Supabase or local)
    try {
      if (supabaseAdmin && mediaFile.url.includes('supabase')) {
        // Delete from Supabase Storage
        const urlParts = mediaFile.url.split('/');
        const filename = urlParts[urlParts.length - 1];
        const filePath = `uploads/${filename}`;

        await supabaseAdmin
          .storage
          .from('yustboard-images')
          .remove([filePath]);
      } else if (mediaFile.url.startsWith('/uploads/')) {
        // Delete from local file system
        const localPath = path.join(process.cwd(), 'public', mediaFile.url);
        try {
          await unlink(localPath);
        } catch (err) {
          console.error('Error deleting local file:', err);
          // Continue even if file deletion fails
        }
      }
    } catch (storageError) {
      console.error('Error deleting from storage:', storageError);
      // Continue to delete database record even if storage deletion fails
    }

    // Delete from database
    await prisma.mediaFile.delete({
      where: { id: mediaId }
    });

    return NextResponse.json({ message: 'Media file deleted successfully' });
  } catch (error) {
    console.error('Error deleting media file:', error);
    return NextResponse.json(
      { error: 'Failed to delete media file' },
      { status: 500 }
    );
  }
}
