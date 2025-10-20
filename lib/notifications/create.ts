import prisma from '@/lib/database/prisma';
import { NotificationType } from '@prisma/client';

export interface CreateNotificationParams {
  userId: string;
  organizationId?: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

/**
 * Create a new notification for a user
 */
export async function createNotification(params: CreateNotificationParams) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        organizationId: params.organizationId,
        type: params.type,
        title: params.title,
        message: params.message,
        link: params.link,
      },
    });

    return { success: true, notification };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { success: false, error };
  }
}

/**
 * Create notifications for multiple users
 */
export async function createBulkNotifications(
  userIds: string[],
  params: Omit<CreateNotificationParams, 'userId'>
) {
  try {
    const notifications = await prisma.notification.createMany({
      data: userIds.map((userId) => ({
        userId,
        organizationId: params.organizationId,
        type: params.type,
        title: params.title,
        message: params.message,
        link: params.link,
      })),
    });

    return { success: true, count: notifications.count };
  } catch (error) {
    console.error('Error creating bulk notifications:', error);
    return { success: false, error };
  }
}
