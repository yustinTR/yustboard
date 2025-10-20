import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/server';
import { supabaseAdmin } from '@/lib/database/supabase';
import prisma from '@/lib/database/prisma';
import { writeFile, readdir, stat, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Storage bucket name
const STORAGE_BUCKET = 'yustboard-images';

// GET request to list uploaded files
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    
    if (type === 'list') {
      // Check if Supabase is configured
      if (supabaseAdmin) {
        // List files from Supabase Storage
        const { data: files, error } = await supabaseAdmin
          .storage
          .from(STORAGE_BUCKET)
          .list('uploads', {
            limit: 100,
            offset: 0,
            sortBy: { column: 'created_at', order: 'desc' }
          });

        if (error) {
          console.error('Error listing files from Supabase:', error);
          // Fall back to local storage
        } else {
          // Get public URLs for each file
          const client = supabaseAdmin!; // We know it's not null due to the outer check
          const fileList = (files || []).map((file) => {
            const { data } = client
              .storage
              .from(STORAGE_BUCKET)
              .getPublicUrl(`uploads/${file.name}`);
              
            return {
              id: file.id,
              filename: file.name,
              url: data.publicUrl,
              size: file.metadata?.size || 0,
              uploadedAt: new Date(file.created_at),
            };
          });

          return NextResponse.json({ files: fileList });
        }
      }
      
      // Fallback to local file system
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'blog');
      
      try {
        const files = await readdir(uploadDir);
        const fileList = await Promise.all(
          files.map(async (filename) => {
            const filePath = path.join(uploadDir, filename);
            const stats = await stat(filePath);
            return {
              id: filename,
              filename,
              url: `/uploads/blog/${filename}`,
              size: stats.size,
              uploadedAt: stats.mtime,
            };
          })
        );

        // Sort by upload date, newest first
        fileList.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());

        return NextResponse.json({ files: fileList });
      } catch {
        // Directory doesn't exist yet
        return NextResponse.json({ files: [] });
      }
    }
    
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('Error listing files:', error);
    return NextResponse.json(
      { error: 'Failed to list files' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const uploadType = formData.get('type') as string; // 'avatar' or undefined (default to blog/media)

    // Get user's current organization (only required for non-avatar uploads)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { organizationId: true }
    });

    if (uploadType !== 'avatar' && !user?.organizationId) {
      return NextResponse.json({ error: 'User must belong to an organization' }, { status: 400 });
    }

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds 50MB limit' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not allowed. Only images are allowed.' },
        { status: 400 }
      );
    }

    let fileUrl: string;
    let uniqueFilename: string;

    // Check if Supabase is configured
    if (supabaseAdmin) {
      // Create unique filename with type prefix
      const fileExtension = file.name.split('.').pop();
      uniqueFilename = `${uuidv4()}.${fileExtension}`;
      const prefix = uploadType === 'avatar' ? 'avatars' : 'uploads';
      const filePath = `${prefix}/${uniqueFilename}`;

      // Upload to Supabase Storage
      const { error } = await supabaseAdmin
        .storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false
        });

      if (!error) {
        // Get public URL
        const { data: publicUrlData } = supabaseAdmin
          .storage
          .from(STORAGE_BUCKET)
          .getPublicUrl(filePath);

        fileUrl = publicUrlData.publicUrl;
      } else {
        console.error('Error uploading to Supabase:', error);
        // Fall back to local storage
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileExtension = path.extname(file.name);
        uniqueFilename = `${uuidv4()}${fileExtension}`;
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'blog');
        const localFilePath = path.join(uploadDir, uniqueFilename);
        await mkdir(uploadDir, { recursive: true });
        await writeFile(localFilePath, buffer);
        fileUrl = `/uploads/blog/${uniqueFilename}`;
      }
    } else {
      // Fallback to local file system
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Create unique filename
      const fileExtension = path.extname(file.name);
      uniqueFilename = `${uuidv4()}${fileExtension}`;
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'blog');
      const localFilePath = path.join(uploadDir, uniqueFilename);

      // Ensure upload directory exists
      await mkdir(uploadDir, { recursive: true });

      // Save file
      await writeFile(localFilePath, buffer);

      // Set file URL
      fileUrl = `/uploads/blog/${uniqueFilename}`;
    }

    // Save to database (skip for avatars as they're stored on user directly)
    let mediaFile;
    if (uploadType !== 'avatar' && user?.organizationId) {
      mediaFile = await prisma.mediaFile.create({
        data: {
          filename: uniqueFilename,
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
          url: fileUrl,
          userId: session.user.id,
          organizationId: user.organizationId
        }
      });
    }

    return NextResponse.json({
      id: mediaFile?.id || null,
      url: fileUrl,
      filename: file.name,
      size: file.size,
      mimeType: file.type,
      type: 'image',
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

// DELETE request to delete a file
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fileUrl = searchParams.get('url');
    
    if (!fileUrl) {
      return NextResponse.json({ error: 'No file URL provided' }, { status: 400 });
    }

    // Check if Supabase is configured and URL is from Supabase
    if (supabaseAdmin && fileUrl.includes('supabase')) {
      // Extract file path from URL
      const urlParts = fileUrl.split('/');
      const filename = urlParts[urlParts.length - 1];
      const filePath = `uploads/${filename}`;

      // Delete from Supabase Storage
      const { error } = await supabaseAdmin
        .storage
        .from(STORAGE_BUCKET)
        .remove([filePath]);

      if (error) {
        console.error('Error deleting from Supabase:', error);
        return NextResponse.json(
          { error: 'Failed to delete file' },
          { status: 500 }
        );
      }
    }
    // Note: We don't delete local files for security reasons
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}