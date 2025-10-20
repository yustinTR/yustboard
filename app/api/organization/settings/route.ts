import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/server';
import prisma from '@/lib/database/prisma';

// GET - Fetch organization settings
export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { organizationId: true }
    });

    if (!user?.organizationId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 });
    }

    // Get or create settings
    let settings = await prisma.organizationSettings.findUnique({
      where: { organizationId: user.organizationId }
    });

    // Create default settings if not exists
    if (!settings) {
      settings = await prisma.organizationSettings.create({
        data: {
          organizationId: user.organizationId,
          allowUserInvites: true,
          brandingEnabled: false
        }
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error fetching organization settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update organization settings
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { organizationId: true, organizationRole: true }
    });

    if (!user?.organizationId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 });
    }

    // Only OWNER and ADMIN can update settings
    if (user.organizationRole !== 'OWNER' && user.organizationRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Only admins can update settings' }, { status: 403 });
    }

    const body = await request.json();
    const {
      brandingEnabled,
      logoUrl,
      primaryColor,
      secondaryColor,
      allowUserInvites,
      maxUsers,
      maxWidgets
    } = body;

    // Validate hex colors if provided
    if (primaryColor && !/^#[0-9A-F]{6}$/i.test(primaryColor)) {
      return NextResponse.json({ error: 'Invalid primary color format. Use hex format (e.g., #3B82F6)' }, { status: 400 });
    }

    if (secondaryColor && !/^#[0-9A-F]{6}$/i.test(secondaryColor)) {
      return NextResponse.json({ error: 'Invalid secondary color format. Use hex format (e.g., #3B82F6)' }, { status: 400 });
    }

    // Get or create settings
    let settings = await prisma.organizationSettings.findUnique({
      where: { organizationId: user.organizationId }
    });

    const updateData: Record<string, boolean | string | number | null> = {};
    if (brandingEnabled !== undefined) updateData.brandingEnabled = brandingEnabled;
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl;
    if (primaryColor !== undefined) updateData.primaryColor = primaryColor;
    if (secondaryColor !== undefined) updateData.secondaryColor = secondaryColor;
    if (allowUserInvites !== undefined) updateData.allowUserInvites = allowUserInvites;
    if (maxUsers !== undefined) updateData.maxUsers = maxUsers;
    if (maxWidgets !== undefined) updateData.maxWidgets = maxWidgets;

    if (settings) {
      // Update existing settings
      settings = await prisma.organizationSettings.update({
        where: { organizationId: user.organizationId },
        data: updateData
      });
    } else {
      // Create new settings
      settings = await prisma.organizationSettings.create({
        data: {
          organizationId: user.organizationId,
          ...updateData
        }
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error updating organization settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
