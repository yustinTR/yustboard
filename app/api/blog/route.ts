import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET all published blog posts (public) or all posts (for authors/admins)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;
    const authorOnly = searchParams.get('authorOnly') === 'true';

    // Build where clause based on user role
    let whereClause: Record<string, unknown> = {};
    
    if (session?.user?.role === 'ADMIN' || session?.user?.role === 'AUTHOR') {
      // Authors can see all their posts and all published posts
      if (authorOnly) {
        whereClause = {
          authorId: session.user.id
        };
      } else if (session?.user?.role === 'AUTHOR') {
        whereClause = {
          OR: [
            { published: true },
            { authorId: session.user.id }
          ]
        };
      }
      // Admins can see all posts (no where clause needed)
    } else {
      // Public users can only see published posts
      whereClause = { published: true };
    }

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where: whereClause,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          coverImage: true,
          published: true,
          publishedAt: true,
          createdAt: true,
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            }
          }
        },
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.blogPost.count({ where: whereClause })
    ]);

    return NextResponse.json({
      posts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}

// POST create new blog post (authors/admins only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database to check role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    // Check if user has author or admin role
    if (!user || (user.role !== 'AUTHOR' && user.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Forbidden: Only authors and admins can create blog posts' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, excerpt, content, coverImage, published } = body;

    if (!title || !excerpt || !content) {
      return NextResponse.json(
        { error: 'Title, excerpt, and content are required' },
        { status: 400 }
      );
    }

    // Generate slug from title
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    // Ensure unique slug
    let slug = baseSlug;
    let counter = 1;
    
    try {
      // Check if prisma.blogPost exists
      if (!prisma.blogPost) {
        console.error('BlogPost model not found in Prisma client');
        return NextResponse.json(
          { error: 'Database configuration error. Please restart the development server.' },
          { status: 500 }
        );
      }
      
      while (await prisma.blogPost.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    } catch (dbError) {
      console.error('Database error while checking slug:', dbError);
      return NextResponse.json(
        { error: 'Database error. Please ensure the server is restarted after schema changes.' },
        { status: 500 }
      );
    }

    const blogPost = await prisma.blogPost.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        coverImage,
        published: published || false,
        publishedAt: published ? new Date() : null,
        authorId: session.user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        }
      }
    });

    return NextResponse.json(blogPost, { status: 201 });
  } catch (error) {
    console.error('Error creating blog post:', error);
    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    );
  }
}