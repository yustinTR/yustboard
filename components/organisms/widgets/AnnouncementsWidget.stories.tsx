import type { Meta, StoryObj } from '@storybook/nextjs';
import AnnouncementsWidget from './AnnouncementsWidget';

interface AnnouncementResponse {
  announcements: Array<{
    id: string;
    title: string;
    content: string;
    coverImage: string | null;
    published: boolean;
    publishedAt: string | null;
    createdAt: string;
    author: {
      id: string;
      name: string | null;
    };
  }>;
}

// Mock fetch for Storybook environment
const mockFetch = (data: AnnouncementResponse) => {
  globalThis.fetch = async () => {
    return {
      ok: true,
      json: async () => data,
    } as Response;
  };
};

const meta: Meta<typeof AnnouncementsWidget> = {
  title: 'Dashboard/Widgets/AnnouncementsWidget',
  component: AnnouncementsWidget,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#1a1a1a' },
        { name: 'light', value: '#ffffff' },
      ],
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '400px', height: '600px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default state with announcements
export const WithAnnouncements: Story = {
  play: async () => {
    mockFetch({
      announcements: [
        {
          id: '1',
          title: 'Q4 Company Update',
          content: 'Important updates about Q4 goals and achievements',
          coverImage: null,
          published: true,
          publishedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          author: {
            id: '1',
            name: 'John Doe',
          },
        },
        {
          id: '2',
          title: 'New Feature Release',
          content: 'We are excited to announce new dashboard features',
          coverImage: null,
          published: true,
          publishedAt: new Date(Date.now() - 86400000).toISOString(),
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          author: {
            id: '2',
            name: 'Jane Smith',
          },
        },
        {
          id: '3',
          title: 'Team Meeting Reminder',
          content: 'Don\'t forget our weekly team meeting tomorrow',
          coverImage: null,
          published: true,
          publishedAt: new Date(Date.now() - 172800000).toISOString(),
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          author: {
            id: '1',
            name: 'John Doe',
          },
        },
      ],
    });
  },
};

// Empty state
export const Empty: Story = {
  play: async () => {
    mockFetch({ announcements: [] });
  },
};

// Loading state
export const Loading: Story = {
  play: async () => {
    // Mock a slow response to show loading state
    globalThis.fetch = async () => {
      await new Promise((resolve) => setTimeout(resolve, 10000));
      return {
        ok: true,
        json: async () => ({ announcements: [] }),
      } as Response;
    };
  },
};

// Error state
export const ErrorState: Story = {
  play: async () => {
    globalThis.fetch = async () => {
      return {
        ok: false,
        json: async () => ({ error: 'Failed to fetch announcements' }),
      } as Response;
    };
  },
};
