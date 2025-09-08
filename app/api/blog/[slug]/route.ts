import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth';
import prisma from '@/lib/database/prisma';

// GET single blog post by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { slug } = await params;

    const post = await prisma.blogPost.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
          }
        }
      }
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // Check if post is published or user has permission to view
    if (!post.published) {
      if (!session?.user) {
        return NextResponse.json(
          { error: 'Blog post not found' },
          { status: 404 }
        );
      }

      if (
        session.user.role !== 'ADMIN' && 
        session.user.id !== post.authorId
      ) {
        return NextResponse.json(
          { error: 'Blog post not found' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog post' },
      { status: 500 }
    );
  }
}

// PUT update blog post (author or admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { slug } = await params;
    const body = await request.json();

    // Find the post
    const existingPost = await prisma.blogPost.findUnique({
      where: { slug },
      select: {
        id: true,
        authorId: true,
        published: true,
      }
    });

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // Check permissions
    if (
      session.user.role !== 'ADMIN' && 
      session.user.id !== existingPost.authorId
    ) {
      return NextResponse.json(
        { error: 'Forbidden: You can only edit your own posts' },
        { status: 403 }
      );
    }

    const { title, excerpt, content, coverImage, published } = body;

    // Generate new slug if title changed
    let newSlug = slug;
    if (title) {
      const baseSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      // Check if new slug is different and ensure uniqueness
      if (baseSlug !== slug) {
        newSlug = baseSlug;
        let counter = 1;
        while (await prisma.blogPost.findUnique({ 
          where: { slug: newSlug },
          select: { id: true }
        })) {
          if (newSlug === slug) break; // Same as current slug is ok
          newSlug = `${baseSlug}-${counter}`;
          counter++;
        }
      }
    }

    // Set publishedAt if publishing for the first time
    const publishedAt = published && !existingPost.published 
      ? new Date() 
      : undefined;

    const updatedPost = await prisma.blogPost.update({
      where: { id: existingPost.id },
      data: {
        title,
        slug: newSlug,
        excerpt,
        content,
        coverImage,
        published,
        publishedAt,
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

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error('Error updating blog post:', error);
    return NextResponse.json(
      { error: 'Failed to update blog post' },
      { status: 500 }
    );
  }
}

// DELETE blog post (author or admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { slug } = await params;

    // Find the post
    const post = await prisma.blogPost.findUnique({
      where: { slug },
      select: {
        id: true,
        authorId: true,
      }
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // Check permissions
    if (
      session.user.role !== 'ADMIN' && 
      session.user.id !== post.authorId
    ) {
      return NextResponse.json(
        { error: 'Forbidden: You can only delete your own posts' },
        { status: 403 }
      );
    }

    await prisma.blogPost.delete({
      where: { id: post.id }
    });

    return NextResponse.json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json(
      { error: 'Failed to delete blog post' },
      { status: 500 }
    );
  }
}