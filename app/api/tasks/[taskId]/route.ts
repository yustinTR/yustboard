import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireResourceOwnership } from '@/lib/permissions';
import prisma from '@/lib/database/prisma';

// PATCH - Update task (toggle completed, edit title/description)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const authResult = await requireAuth();

    if ('error' in authResult) {
      return authResult.error;
    }

    const { context } = authResult;
    const { taskId } = await params;

    // Verify task belongs to user's organization
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
      select: { organizationId: true, userId: true }
    });

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (existingTask.organizationId !== context.organizationId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if user owns the task or is admin
    const ownershipResult = await requireResourceOwnership(existingTask.userId);

    if ('error' in ownershipResult) {
      return ownershipResult.error;
    }

    const body = await request.json();
    const { title, description, date, completed } = body;

    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(date !== undefined && { date: new Date(date) }),
        ...(completed !== undefined && { completed })
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

// DELETE - Delete task
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const authResult = await requireAuth();

    if ('error' in authResult) {
      return authResult.error;
    }

    const { context } = authResult;
    const { taskId } = await params;

    // Verify task belongs to user's organization
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
      select: { organizationId: true, userId: true }
    });

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (existingTask.organizationId !== context.organizationId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if user owns the task or is admin
    const ownershipResult = await requireResourceOwnership(existingTask.userId);

    if ('error' in ownershipResult) {
      return ownershipResult.error;
    }

    await prisma.task.delete({
      where: { id: taskId }
    });

    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}
