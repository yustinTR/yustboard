import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/server';
import prisma from '@/lib/database/prisma';
import { extractMentions } from '@/lib/utils/mentions';
import { createNotification } from '@/lib/notifications/create';

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
    const cursor = searchParams.get('cursor');
    const limit = parseInt(searchParams.get('limit') || '20');

    const posts = await prisma.post.findMany({
      where: {
        organizationId: user.organizationId // Filter by current organization
      },
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
    }, {
      headers: {
        'Cache-Control': 'private, max-age=60, stale-while-revalidate=120'
      }
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
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { organizationId: true }
    });

    if (!user?.organizationId) {
      return NextResponse.json({ error: 'User must belong to an organization' }, { status: 400 });
    }

    const { content, media } = await request.json();

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const post = await prisma.post.create({
      data: {
        content,
        userId: session.user.id,
        organizationId: user.organizationId,
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

    // Extract mentions and send notifications
    const mentions = extractMentions(content);
    console.log('Extracted mentions from post:', mentions);

    if (mentions.length > 0) {
      const posterName = session.user.name || session.user.email?.split('@')[0] || 'Iemand';

      // Send notification to each mentioned user (except self)
      for (const mention of mentions) {
        console.log('Processing mention:', mention, 'Current user:', session.user.id);
        if (mention.userId !== session.user.id) {
          const result = await createNotification({
            userId: mention.userId,
            organizationId: user.organizationId,
            type: 'COMMENT_MENTION',
            title: 'Je bent genoemd in een post',
            message: `${posterName} heeft je genoemd in een tijdlijn post`,
            link: `/dashboard/timeline?post=${post.id}`,
          });
          console.log('Notification creation result:', result);
        } else {
          console.log('Skipping self-mention');
        }
      }
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error creating timeline post:', error);
    return NextResponse.json(
      { error: 'Failed to create timeline post' },
      { status: 500 }
    );
  }
}