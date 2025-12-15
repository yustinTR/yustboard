import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/server';
import prisma from '@/lib/database/prisma';
import { extractMentions } from '@/lib/utils/mentions';
import { createNotification } from '@/lib/notifications/create';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const comments = await prisma.postComment.findMany({
      where: { postId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const { content } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Check if the post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Create comment
    const comment = await prisma.postComment.create({
      data: {
        content: content.trim(),
        postId,
        userId: session.user.id,
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
      },
    });

    // Extract mentions and send notifications
    const mentions = extractMentions(content);
    if (mentions.length > 0) {
      const commenterName = session.user.name || session.user.email?.split('@')[0] || 'Iemand';

      // Get user's organization for the notification
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { organizationId: true }
      });

      // Send notification to each mentioned user (except self)
      for (const mention of mentions) {
        if (mention.userId !== session.user.id) {
          await createNotification({
            userId: mention.userId,
            organizationId: user?.organizationId || undefined,
            type: 'COMMENT_MENTION',
            title: 'Je bent genoemd in een reactie',
            message: `${commenterName} heeft je genoemd in een reactie`,
            link: `/dashboard/timeline?post=${postId}`,
          });
        }
      }
    }

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}