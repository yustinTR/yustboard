import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/server';
import prisma from '@/lib/database/prisma';

export interface ActivityItem {
  id: string;
  type: 'post' | 'comment' | 'like' | 'task_completed' | 'member_joined' | 'announcement';
  message: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  metadata?: {
    postId?: string;
    taskId?: string;
    announcementId?: string;
    postContent?: string;
    taskTitle?: string;
    announcementTitle?: string;
  };
  createdAt: string;
}

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
    const limit = parseInt(searchParams.get('limit') || '20');

    // Fetch recent activities in parallel
    const [posts, comments, likes, completedTasks, announcements, newMembers] = await Promise.all([
      // Recent posts
      prisma.post.findMany({
        where: { organizationId: user.organizationId },
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, image: true }
          }
        }
      }),

      // Recent comments
      prisma.postComment.findMany({
        where: {
          post: { organizationId: user.organizationId }
        },
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, image: true }
          },
          post: {
            select: { id: true, content: true }
          }
        }
      }),

      // Recent likes
      prisma.postLike.findMany({
        where: {
          post: { organizationId: user.organizationId }
        },
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, image: true }
          },
          post: {
            select: { id: true, content: true }
          }
        }
      }),

      // Recently completed tasks
      prisma.task.findMany({
        where: {
          organizationId: user.organizationId,
          completed: true
        },
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, image: true }
          }
        }
      }),

      // Recent announcements
      prisma.announcement.findMany({
        where: {
          organizationId: user.organizationId,
          published: true
        },
        take: limit,
        orderBy: { publishedAt: 'desc' },
        include: {
          author: {
            select: { id: true, name: true, image: true }
          }
        }
      }),

      // Recent members joined (last 30 days)
      prisma.organizationMembership.findMany({
        where: {
          organizationId: user.organizationId,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        },
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, image: true }
          }
        }
      })
    ]);

    // Transform and merge activities
    const activities: ActivityItem[] = [];

    // Add posts
    posts.forEach(post => {
      activities.push({
        id: `post-${post.id}`,
        type: 'post',
        message: `heeft een bericht geplaatst`,
        user: post.user,
        metadata: {
          postId: post.id,
          postContent: post.content.substring(0, 100) + (post.content.length > 100 ? '...' : '')
        },
        createdAt: post.createdAt.toISOString()
      });
    });

    // Add comments
    comments.forEach(comment => {
      activities.push({
        id: `comment-${comment.id}`,
        type: 'comment',
        message: `heeft gereageerd op een bericht`,
        user: comment.user,
        metadata: {
          postId: comment.post.id,
          postContent: comment.post.content.substring(0, 50) + (comment.post.content.length > 50 ? '...' : '')
        },
        createdAt: comment.createdAt.toISOString()
      });
    });

    // Add likes
    likes.forEach(like => {
      activities.push({
        id: `like-${like.id}`,
        type: 'like',
        message: `vond een bericht leuk`,
        user: like.user,
        metadata: {
          postId: like.post.id,
          postContent: like.post.content.substring(0, 50) + (like.post.content.length > 50 ? '...' : '')
        },
        createdAt: like.createdAt.toISOString()
      });
    });

    // Add completed tasks
    completedTasks.forEach(task => {
      if (task.user) {
        activities.push({
          id: `task-${task.id}`,
          type: 'task_completed',
          message: `heeft een taak afgerond`,
          user: task.user,
          metadata: {
            taskId: task.id,
            taskTitle: task.title
          },
          createdAt: task.updatedAt.toISOString()
        });
      }
    });

    // Add announcements
    announcements.forEach(announcement => {
      activities.push({
        id: `announcement-${announcement.id}`,
        type: 'announcement',
        message: `heeft een aankondiging geplaatst`,
        user: announcement.author,
        metadata: {
          announcementId: announcement.id,
          announcementTitle: announcement.title
        },
        createdAt: (announcement.publishedAt || announcement.createdAt).toISOString()
      });
    });

    // Add new members
    newMembers.forEach(member => {
      activities.push({
        id: `member-${member.id}`,
        type: 'member_joined',
        message: `is lid geworden van het team`,
        user: member.user,
        createdAt: member.createdAt.toISOString()
      });
    });

    // Sort by date (newest first) and limit
    activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const limitedActivities = activities.slice(0, limit);

    return NextResponse.json({
      activities: limitedActivities
    }, {
      headers: {
        'Cache-Control': 'private, max-age=30, stale-while-revalidate=60'
      }
    });
  } catch (error) {
    console.error('Error fetching activity feed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity feed' },
      { status: 500 }
    );
  }
}
