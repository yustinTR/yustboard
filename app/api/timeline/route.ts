import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth/auth";
import prisma from '@/lib/database/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const cursor = searchParams.get('cursor');
    const limit = parseInt(searchParams.get('limit') || '20');

    const posts = await prisma.post.findMany({
      take: limit + 1,
      ...(cursor && {
        cursor: {
          id: cursor,
        },
        skip: 1,
      }),
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
        media: true,
      },
    });

    const hasMore = posts.length > limit;
    const postsToReturn = hasMore ? posts.slice(0, -1) : posts;

    return NextResponse.json({
      posts: postsToReturn,
      nextCursor: hasMore ? postsToReturn[postsToReturn.length - 1].id : null,
    });
  } catch (error) {
    console.error('Error fetching timeline posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch timeline posts' },
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

    const { content, media } = await request.json();

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const post = await prisma.post.create({
      data: {
        content,
        userId: session.user.id,
        media: media ? {
          create: media.map((item: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
            type: item.type,
            url: item.url,
            filename: item.filename,
            size: item.size,
            mimeType: item.mimeType,
          })),
        } : undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
        media: true,
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error creating timeline post:', error);
    return NextResponse.json(
      { error: 'Failed to create timeline post' },
      { status: 500 }
    );
  }
}