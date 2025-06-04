import type { Meta, StoryObj } from '@storybook/react';
import Header from './Header';
import { SessionProvider } from 'next-auth/react';

const meta = {
  title: 'Dashboard/Header',
  component: Header,
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
          name: 'John Doe',
          email: 'john@example.com',
          image: 'https://avatars.githubusercontent.com/u/1?v=4',
          role: 'USER',
        },
        expires: '2025-12-31',
      }}>
        <div className="min-h-screen bg-background">
          <Story />
          <div className="p-8">
            <p className="text-muted-foreground">Page content goes here...</p>
          </div>
        </div>
      </SessionProvider>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof Header>;

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
          image: 'https://avatars.githubusercontent.com/u/2?v=4',
          role: 'ADMIN',
        },
        expires: '2025-12-31',
      }}>
        <div className="min-h-screen bg-background">
          <Story />
        </div>
      </SessionProvider>
    ),
  ],
};

export const AuthorUser: Story = {
  decorators: [
    (Story) => (
      <SessionProvider session={{
        user: {
          name: 'Author User',
          email: 'author@example.com',
          image: 'https://avatars.githubusercontent.com/u/3?v=4',
          role: 'AUTHOR',
        },
        expires: '2025-12-31',
      }}>
        <div className="min-h-screen bg-background">
          <Story />
        </div>
      </SessionProvider>
    ),
  ],
};

export const NoProfileImage: Story = {
  decorators: [
    (Story) => (
      <SessionProvider session={{
        user: {
          name: 'No Image User',
          email: 'noimage@example.com',
          role: 'USER',
        },
        expires: '2025-12-31',
      }}>
        <div className="min-h-screen bg-background">
          <Story />
        </div>
      </SessionProvider>
    ),
  ],
};

export const DifferentPages: Story = {
  parameters: {
    nextjs: {
      navigation: {
        segments: [['pathname', '/dashboard/timeline']],
      },
    },
  },
};

export const MobileView: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};