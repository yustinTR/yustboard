import type { Meta, StoryObj } from '@storybook/nextjs';
import CalendarWidget from './CalendarWidget';

interface CalendarResponse {
  events: Array<{
    id: string;
    summary: string;
    start: {
      dateTime?: string;
      date?: string;
    };
    end: {
      dateTime?: string;
      date?: string;
    };
    description?: string;
    htmlLink?: string;
  }>;
}

// Mock fetch for Storybook environment
const mockFetch = (data: CalendarResponse) => {
  globalThis.fetch = async () => {
    return {
      ok: true,
      json: async () => data,
    } as Response;
  };
};

const meta: Meta<typeof CalendarWidget> = {
  title: 'Dashboard/Widgets/CalendarWidget',
  component: CalendarWidget,
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

// Default state with calendar events
export const WithEvents: Story = {
  play: async () => {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 86400000);
    const nextWeek = new Date(now.getTime() + 604800000);

    mockFetch({
      events: [
        {
          id: '1',
          summary: 'Team Stand-up',
          start: {
            dateTime: new Date(now.setHours(10, 0, 0, 0)).toISOString(),
          },
          end: {
            dateTime: new Date(now.setHours(10, 30, 0, 0)).toISOString(),
          },
          description: 'Daily team sync meeting',
          htmlLink: 'https://calendar.google.com/event1',
        },
        {
          id: '2',
          summary: 'Project Review',
          start: {
            dateTime: new Date(tomorrow.setHours(14, 0, 0, 0)).toISOString(),
          },
          end: {
            dateTime: new Date(tomorrow.setHours(15, 0, 0, 0)).toISOString(),
          },
          description: 'Quarterly project review meeting',
          htmlLink: 'https://calendar.google.com/event2',
        },
        {
          id: '3',
          summary: 'Client Presentation',
          start: {
            dateTime: new Date(nextWeek.setHours(11, 0, 0, 0)).toISOString(),
          },
          end: {
            dateTime: new Date(nextWeek.setHours(12, 0, 0, 0)).toISOString(),
          },
          description: 'Q4 results presentation to client',
          htmlLink: 'https://calendar.google.com/event3',
        },
      ],
    });
  },
};

// Empty state
export const NoEvents: Story = {
  play: async () => {
    mockFetch({ events: [] });
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
        json: async () => ({ events: [] }),
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
        json: async () => ({ error: 'Failed to fetch calendar events' }),
      } as Response;
    };
  },
};

// All-day events
export const AllDayEvents: Story = {
  play: async () => {
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 86400000);

    mockFetch({
      events: [
        {
          id: '1',
          summary: 'Company Holiday',
          start: {
            date: today.toISOString().split('T')[0],
          },
          end: {
            date: today.toISOString().split('T')[0],
          },
          description: 'Christmas Day - Office Closed',
          htmlLink: 'https://calendar.google.com/event1',
        },
        {
          id: '2',
          summary: 'Team Building Event',
          start: {
            date: tomorrow.toISOString().split('T')[0],
          },
          end: {
            date: tomorrow.toISOString().split('T')[0],
          },
          description: 'Annual team building day',
          htmlLink: 'https://calendar.google.com/event2',
        },
      ],
    });
  },
};
