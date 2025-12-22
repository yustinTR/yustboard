import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/server';
import prisma from '@/lib/database/prisma';

// All available menu items with their Google requirement
const allMenuItems = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: 'Home', requiresGoogle: false },
  { id: 'timeline', label: 'Timeline', path: '/dashboard/timeline', icon: 'MessageSquare', requiresGoogle: false },
  { id: 'mail', label: 'Mail', path: '/dashboard/mail', icon: 'Mail', requiresGoogle: true },
  { id: 'agenda', label: 'Agenda', path: '/dashboard/agenda', icon: 'Calendar', requiresGoogle: true },
  { id: 'banking', label: 'Banking', path: '/dashboard/banking', icon: 'DollarSign', requiresGoogle: false },
  { id: 'blog', label: 'Blog', path: '/dashboard/blog', icon: 'FileText', requiresGoogle: false },
  { id: 'news', label: 'Nieuws', path: '/dashboard/news', icon: 'Globe', requiresGoogle: false },
  { id: 'social', label: 'Social', path: '/dashboard/social', icon: 'Users', requiresGoogle: false },
  { id: 'weather', label: 'Weather', path: '/dashboard/weather', icon: 'Cloud', requiresGoogle: false },
  { id: 'announcements', label: 'Aankondigingen', path: '/dashboard/announcements', icon: 'Bell', requiresGoogle: false },
  { id: 'tasks', label: 'Taken', path: '/dashboard/tasks', icon: 'CheckSquare', requiresGoogle: false },
  { id: 'settings', label: 'Instellingen', path: '/dashboard/settings', icon: 'Settings', requiresGoogle: false }
];

// GET - Fetch organization menu configuration
export async function GET() {
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

    // Only OWNER and ADMIN can view/edit menu settings
    if (user.organizationRole !== 'OWNER' && user.organizationRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get organization menu settings
    const menuSettings = await prisma.organizationMenuDefault.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { position: 'asc' }
    });

    // Merge with all menu items to get full list
    const menuItems = allMenuItems.map((item, index) => {
      const setting = menuSettings.find(s => s.menuItemId === item.id);
      return {
        ...item,
        enabled: setting ? setting.enabled : true,
        position: setting ? setting.position : index
      };
    });

    // Sort by position
    menuItems.sort((a, b) => a.position - b.position);

    return NextResponse.json({
      menuItems,
      hasOrgSettings: menuSettings.length > 0
    }, {
      headers: {
        'Cache-Control': 'private, max-age=180, stale-while-revalidate=360'
      }
    });
  } catch (error) {
    console.error('Error fetching organization menu:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Save organization menu configuration
export async function POST(request: Request) {
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

    // Only OWNER and ADMIN can save menu settings
    if (user.organizationRole !== 'OWNER' && user.organizationRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { menuItems } = body as { menuItems: Array<{ id: string; enabled: boolean; position: number }> };

    if (!menuItems || !Array.isArray(menuItems)) {
      return NextResponse.json({ error: 'Invalid request: menuItems array required' }, { status: 400 });
    }

    // Delete existing settings and create new ones in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete all existing menu settings for this organization
      await tx.organizationMenuDefault.deleteMany({
        where: { organizationId: user.organizationId! }
      });

      // Create new settings
      if (menuItems.length > 0) {
        await tx.organizationMenuDefault.createMany({
          data: menuItems.map((item) => ({
            organizationId: user.organizationId!,
            menuItemId: item.id,
            enabled: item.enabled,
            position: item.position
          }))
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Menu settings saved successfully'
    });
  } catch (error) {
    console.error('Error saving organization menu:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
