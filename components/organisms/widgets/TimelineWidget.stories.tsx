import type { Meta, StoryObj } from '@storybook/nextjs';
import { SessionProvider } from 'next-auth/react';
import TimelineWidget from './TimelineWidget';

// Mock timeline post data for Storybook
const mockTimelinePosts = [
  {
    id: 'post1',
    content: 'Just finished implementing the new dashboard widgets with Material Design! 🎨 The glass morphism effect looks amazing!',
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    user: {
      id: 'user1',
      name: 'Sarah Wilson',
      email: 'sarah@example.com',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b332c1fa?w=100&h=100&fit=crop&crop=face'
    },
    likes: [{ userId: 'user2' }, { userId: 'user3' }],
    _count: {
      likes: 2,
      comments: 3
    },
    media: []
  },
  {
    id: 'post2',
    content: 'Working on some exciting new features for the project. Can\'t wait to share them with the team! 🚀',
    createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    user: {
      id: 'user2',
      name: 'John Developer',
      email: 'john@example.com',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    },
    likes: [{ userId: 'user1' }],
    _count: {
      likes: 1,
      comments: 1
    },
    media: [
      {
        id: 'media1',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300',
        filename: 'project-screenshot.png',
        size: 245680,
        mimeType: 'image/png'
      }
    ]
  },
  {
    id: 'post3',
    content: 'Had a great team meeting today. Everyone is so motivated and creative! Love working with this team 💪',
    createdAt: new Date(Date.now() - 14400000).toISOString(), // 4 hours ago
    user: {
      id: 'user3',
      name: 'Alex Manager',
      email: 'alex@example.com',
      image: null
    },
    likes: [{ userId: 'user1' }, { userId: 'user2' }, { userId: 'user4' }],
    _count: {
      likes: 3,
      comments: 2
    },
    media: []
  },
  {
    id: 'post4',
    content: 'Quick tip: Always test your components in both light and dark mode! Found some contrast issues today that were easily fixable.',
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    user: {
      id: 'user4',
      name: 'Emma QA',
      email: 'emma@example.com',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
    },
    likes: [{ userId: 'user1' }, { userId: 'user2' }],
    _count: {
      likes: 2,
      comments: 0
    },
    media: []
  },
  {
    id: 'post5',
    content: 'Deployed the latest updates to production. Everything looks good! 🎉 Thanks to everyone for the thorough testing.',
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    user: {
      id: 'user1',
      name: 'Sarah Wilson',
      email: 'sarah@example.com',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b332c1fa?w=100&h=100&fit=crop&crop=face'
    },
    likes: [{ userId: 'user2' }, { userId: 'user3' }, { userId: 'user4' }, { userId: 'user5' }],
    _count: {
      likes: 4,
      comments: 1
    },
    media: []
  }
];

const mockSession = {
  user: {
    id: 'user1',
    name: 'Test User',
    email: 'test@example.com',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b332c1fa?w=100&h=100&fit=crop&crop=face',
    role: 'USER' as const
  },
  accessToken: 'mock-access-token',
  expires: '2024-12-31'
};

const meta: Meta<typeof TimelineWidget> = {
  title: 'Dashboard/Widgets/TimelineWidget',
  component: TimelineWidget,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'gradient',
      values: [
        {
          name: 'gradient',
          value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }
      ]
    },
    mockData: {
      '/api/timeline': {
        posts: mockTimelinePosts
      }
    }
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <SessionProvider session={mockSession}>
        <div className="w-96 h-[600px]">
          <Story />
        </div>
      </SessionProvider>
    )
  ]
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock the API calls for Storybook
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;
  window.fetch = async (url: RequestInfo | URL, options?: RequestInit) => {
    if (typeof url === 'string') {
      if (url.includes('/api/timeline') && !url.includes('/like')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ posts: mockTimelinePosts }),
          status: 200,
          statusText: 'OK'
        } as Response);
      }

      if (url.includes('/api/timeline') && url.includes('/like')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true }),
          status: 200,
          statusText: 'OK'
        } as Response);
      }

      if (url.includes('/api/timeline') && options?.method === 'POST') {
        const newPost = {
          id: `post${Date.now()}`,
          content: 'New post created in Storybook!',
          createdAt: new Date().toISOString(),
          user: mockSession.user,
          likes: [],
          _count: { likes: 0, comments: 0 },
          media: []
        };
        return Promise.resolve({
          ok: true,
          json: async () => newPost,
          status: 200,
          statusText: 'OK'
        } as Response);
      }
    }
    return originalFetch(url, options);
  };
}

export const Default: Story = {};

export const Loading: Story = {
  parameters: {
    mockData: {
      '/api/timeline': {
        delay: 5000
      }
    }
  }
};

export const WithMedia: Story = {
  parameters: {
    mockData: {
      '/api/timeline': {
        posts: mockTimelinePosts.filter(post => post.media.length > 0)
      }
    }
  }
};

export const EmptyTimeline: Story = {
  parameters: {
    mockData: {
      '/api/timeline': {
        posts: []
      }
    }
  }
};

export const ErrorState: Story = {
  parameters: {
    mockData: {
      '/api/timeline': {
        error: 'Failed to load timeline',
        status: 500
      }
    }
  }
};