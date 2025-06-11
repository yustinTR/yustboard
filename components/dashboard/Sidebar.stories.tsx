import type { Meta, StoryObj } from '@storybook/react';
import Sidebar from './Sidebar';
import { SessionProvider } from 'next-auth/react';
import { SidebarProvider } from '@/contexts/SidebarContext';

const meta = {
  title: 'Dashboard/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/dashboard',
      },
    },
  },
  decorators: [
    (Story) => (
      <SessionProvider session={{
        user: {
          name: 'Test User',
          email: 'test@example.com',
          role: 'USER',
        },
        expires: '2025-12-31',
      }}>
        <SidebarProvider>
          <div className="flex h-screen bg-background">
            <Story />
            <div className="flex-1 p-8">
              <h1 className="text-2xl font-bold mb-4">Dashboard Content</h1>
              <p className="text-muted-foreground">
                This is the main content area. The sidebar is shown on the left.
              </p>
            </div>
          </div>
        </SidebarProvider>
      </SessionProvider>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AdminUser: Story = {
  decorators: [
    (Story) => (
      <SessionProvider session={{
        user: {
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'ADMIN',
        },
        expires: '2025-12-31',
      }}>
        <SidebarProvider>
          <div className="flex h-screen bg-background">
            <Story />
            <div className="flex-1 p-8">
              <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                Admin users see additional menu items in the sidebar.
              </p>
            </div>
          </div>
        </SidebarProvider>
      </SessionProvider>
    ),
  ],
};

export const ActiveTimeline: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/dashboard/timeline',
      },
    },
  },
};

export const ActiveSettings: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/dashboard/settings',
      },
    },
  },
};

export const Collapsed: Story = {
  decorators: [
    (Story) => (
      <SessionProvider session={{
        user: {
          name: 'Test User',
          email: 'test@example.com',
          role: 'USER',
        },
        expires: '2025-12-31',
      }}>
        <SidebarProvider initialCollapsed={true}>
          <div className="flex h-screen bg-background">
            <Story />
            <div className="flex-1 p-8">
              <h1 className="text-2xl font-bold mb-4">Collapsed Sidebar</h1>
              <p className="text-muted-foreground">
                The sidebar starts in collapsed state.
              </p>
            </div>
          </div>
        </SidebarProvider>
      </SessionProvider>
    ),
  ],
};

export const WithCustomMenuItems: Story = {
  decorators: [
    (Story) => {
      // Mock fetch to return custom menu items
      global.fetch = ((url) => {
        if (typeof url === 'string' && url.includes('/api/settings/menu')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              menuItems: [
                { id: 'dashboard', label: 'Home', path: '/dashboard', icon: 'Home', enabled: true, position: 0 },
                { id: 'timeline', label: 'Feed', path: '/dashboard/timeline', icon: 'MessageSquare', enabled: true, position: 1 },
                { id: 'mail', label: 'Email', path: '/dashboard/mail', icon: 'Mail', enabled: false, position: 2 },
                { id: 'settings', label: 'Settings', path: '/dashboard/settings', icon: 'Settings', enabled: true, position: 9 },
              ],
            }),
          } as Response);
        }
        return Promise.reject(new Error('Not found'));
      }) as any;

      return (
        <SessionProvider session={{
          user: {
            name: 'Test User',
            email: 'test@example.com',
            role: 'USER',
          },
          expires: '2025-12-31',
        }}>
          <SidebarProvider>
            <div className="flex h-screen bg-background">
              <Story />
              <div className="flex-1 p-8">
                <h1 className="text-2xl font-bold mb-4">Custom Menu</h1>
                <p className="text-muted-foreground">
                  This sidebar shows customized menu items with some disabled.
                </p>
              </div>
            </div>
          </SidebarProvider>
        </SessionProvider>
      );
    },
  ],
};