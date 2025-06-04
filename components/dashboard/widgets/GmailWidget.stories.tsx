import type { Meta, StoryObj } from '@storybook/react';
import GmailWidget from './GmailWidget';
import { SessionProvider } from 'next-auth/react';

const mockEmails = [
  {
    id: '1',
    threadId: 'thread1',
    from: 'john@example.com',
    fromName: 'John Doe',
    subject: 'Project Update - Q4 Review',
    snippet: 'Hi team, I wanted to share the latest updates on our Q4 project. We have made significant progress...',
    date: new Date(),
    unread: true,
    starred: false,
    hasAttachments: true,
    important: true,
  },
  {
    id: '2',
    threadId: 'thread2',
    from: 'sarah@company.com',
    fromName: 'Sarah Johnson',
    subject: 'Meeting Tomorrow at 2 PM',
    snippet: 'Just a reminder about our meeting tomorrow to discuss the new feature implementation...',
    date: new Date(Date.now() - 3600000), // 1 hour ago
    unread: true,
    starred: true,
    hasAttachments: false,
    important: false,
  },
  {
    id: '3',
    threadId: 'thread3',
    from: 'notifications@github.com',
    fromName: 'GitHub',
    subject: '[PR] New pull request in yustboard',
    snippet: 'A new pull request has been opened by user123: "Add dark mode support"...',
    date: new Date(Date.now() - 86400000), // Yesterday
    unread: false,
    starred: false,
    hasAttachments: false,
    important: false,
  },
  {
    id: '4',
    threadId: 'thread4',
    from: 'team@slack.com',
    fromName: 'Slack',
    subject: 'Your weekly team summary',
    snippet: 'Here\'s what happened in your workspace this week: 42 messages, 8 files shared...',
    date: new Date(Date.now() - 172800000), // 2 days ago
    unread: false,
    starred: false,
    hasAttachments: true,
    important: false,
  },
  {
    id: '5',
    threadId: 'thread5',
    from: 'billing@service.com',
    fromName: 'Service Team',
    subject: 'Invoice for December 2024',
    snippet: 'Your invoice for December 2024 is now available. Total amount: $99.00...',
    date: new Date(Date.now() - 604800000), // 1 week ago
    unread: false,
    starred: false,
    hasAttachments: true,
    important: true,
  },
];

const meta = {
  title: 'Dashboard/Widgets/GmailWidget',
  component: GmailWidget,
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
        <div className="max-w-2xl">
          <Story />
        </div>
      </SessionProvider>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof GmailWidget>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    initialEmails: mockEmails,
  },
};

export const EmptyInbox: Story = {
  args: {
    initialEmails: [],
  },
};

export const LimitedEmails: Story = {
  args: {
    initialEmails: mockEmails,
    maxEmails: 3,
  },
};

export const LoadingState: Story = {
  decorators: [
    (Story) => {
      global.fetch = jest.fn(() => new Promise(() => {}));
      return <Story />;
    },
  ],
};

export const ErrorState: Story = {
  decorators: [
    (Story) => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 401,
          json: () => Promise.resolve({ error: 'Unauthorized' }),
        } as Response)
      );
      return <Story />;
    },
  ],
};

export const AllUnread: Story = {
  args: {
    initialEmails: mockEmails.map(email => ({ ...email, unread: true })),
  },
};

export const AllStarred: Story = {
  args: {
    initialEmails: mockEmails.map(email => ({ ...email, starred: true })),
  },
};

export const WithLongSubjects: Story = {
  args: {
    initialEmails: [
      {
        ...mockEmails[0],
        subject: 'This is a very long email subject that should be truncated when displayed in the widget to maintain proper layout',
      },
      {
        ...mockEmails[1],
        subject: 'Another extremely long subject line that goes on and on and needs to be properly handled by the UI component',
      },
      ...mockEmails.slice(2),
    ],
  },
};