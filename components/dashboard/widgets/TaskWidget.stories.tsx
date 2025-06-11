import type { Meta, StoryObj } from '@storybook/react';
import TaskWidget from './TaskWidget';
import { SessionProvider } from 'next-auth/react';

const meta = {
  title: 'Dashboard/Widgets/TaskWidget',
  component: TaskWidget,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <SessionProvider session={{
        user: {
          name: 'Test User',
          email: 'test@example.com',
        },
        expires: '2025-12-31',
      }}>
        <div className="max-w-md">
          <Story />
        </div>
      </SessionProvider>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof TaskWidget>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithTasks: Story = {
  decorators: [
    (Story) => {
      // Mock fetch to return calendar events
      global.fetch = ((() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            {
              id: '1',
              title: 'Team Meeting',
              description: 'Weekly sync with the team',
              date: new Date().toISOString(),
              endDate: new Date(Date.now() + 3600000).toISOString(),
              completed: false,
            },
            {
              id: '2',
              title: 'Project Deadline',
              description: 'Submit final project deliverables',
              date: new Date(Date.now() + 86400000).toISOString(),
              completed: false,
            },
            {
              id: '3',
              title: 'Code Review',
              description: 'Review pull requests',
              date: new Date(Date.now() + 172800000).toISOString(),
              completed: false,
            },
          ]),
        } as Response)
      )) as any;

      return <Story />;
    },
  ],
};

export const EmptyState: Story = {
  decorators: [
    (Story) => {
      global.fetch = ((() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        } as Response)
      )) as any;

      return <Story />;
    },
  ],
};

export const LoadingState: Story = {
  decorators: [
    (Story) => {
      global.fetch = ((() => new Promise(() => {}))) as any;
      return <Story />;
    },
  ],
};

export const ErrorState: Story = {
  decorators: [
    (Story) => {
      global.fetch = ((() =>
        Promise.resolve({
          ok: false,
          status: 500,
        } as Response)
      )) as any;

      return <Story />;
    },
  ],
};

export const AuthenticatedWithToken: Story = {
  decorators: [
    (Story) => (
      <SessionProvider session={{
        user: {
          name: 'Test User',
          email: 'test@example.com',
        },
        accessToken: 'mock-access-token',
        expires: '2025-12-31',
      }}>
        <div className="max-w-md">
          <Story />
        </div>
      </SessionProvider>
    ),
  ],
};