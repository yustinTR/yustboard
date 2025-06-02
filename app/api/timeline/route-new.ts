import { NextRequest, NextResponse } from 'next/server';
import { withApiMiddleware, ApiContext } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const GET = withApiMiddleware(async (request: NextRequest, context: ApiContext) => {
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
}, {
  requireAuth: true,
  rateLimit: {
    requests: 100,
    windowMs: 60000, // 1 minute
  },
});