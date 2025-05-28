import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { writeFile, readdir, stat, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// GET request to list uploaded files
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    
    if (type === 'list') {
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
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
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
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not allowed' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const fileExtension = path.extname(file.name);
    const uniqueFilename = `${uuidv4()}${fileExtension}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'blog');
    const filePath = path.join(uploadDir, uniqueFilename);

    // Ensure upload directory exists
    await mkdir(uploadDir, { recursive: true });

    // Save file
    await writeFile(filePath, buffer);

    // Return file info
    const fileUrl = `/uploads/blog/${uniqueFilename}`;
    const isImage = file.type.startsWith('image/');

    return NextResponse.json({
      url: fileUrl,
      filename: file.name,
      size: file.size,
      mimeType: file.type,
      type: isImage ? 'image' : 'file',
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}