import type { Meta, StoryObj } from '@storybook/nextjs';
import GmailWidget from './GmailWidget';
import { SessionProvider } from 'next-auth/react';

const mockEmails = [
  {
    id: '1',
    threadId: 'thread1',
    from: {
      name: 'John Doe',
      email: 'john@example.com',
    },
    to: ['me@example.com'],
    subject: 'Project Update - Q4 Review',
    snippet: 'Hi team, I wanted to share the latest updates on our Q4 project. We have made significant progress...',
    date: new Date(),
    isRead: false,
    isStarred: false,
    hasAttachments: true,
    labels: ['INBOX', 'IMPORTANT'],
    sizeEstimate: 2048,
  },
  {
    id: '2',
    threadId: 'thread2',
    from: {
      name: 'Sarah Johnson',
      email: 'sarah@company.com',
    },
    to: ['me@example.com'],
    subject: 'Meeting Tomorrow at 2 PM',
    snippet: 'Just a reminder about our meeting tomorrow to discuss the new feature implementation...',
    date: new Date(Date.now() - 3600000), // 1 hour ago
    isRead: false,
    isStarred: true,
    hasAttachments: false,
    labels: ['INBOX'],
    sizeEstimate: 1024,
  },
  {
    id: '3',
    threadId: 'thread3',
    from: {
      name: 'GitHub',
      email: 'notifications@github.com',
    },
    to: ['me@example.com'],
    subject: '[PR] New pull request in yustboard',
    snippet: 'A new pull request has been opened by user123: "Add dark mode support"...',
    date: new Date(Date.now() - 86400000), // Yesterday
    isRead: true,
    isStarred: false,
    hasAttachments: false,
    labels: ['INBOX'],
    sizeEstimate: 1536,
  },
  {
    id: '4',
    threadId: 'thread4',
    from: {
      name: 'Slack',
      email: 'team@slack.com',
    },
    to: ['me@example.com'],
    subject: 'Your weekly team summary',
    snippet: 'Here\'s what happened in your workspace this week: 42 messages, 8 files shared...',
    date: new Date(Date.now() - 172800000), // 2 days ago
    isRead: true,
    isStarred: false,
    hasAttachments: true,
    labels: ['INBOX'],
    sizeEstimate: 2560,
  },
  {
    id: '5',
    threadId: 'thread5',
    from: {
      name: 'Service Team',
      email: 'billing@service.com',
    },
    to: ['me@example.com'],
    subject: 'Invoice for December 2024',
    snippet: 'Your invoice for December 2024 is now available. Total amount: $99.00...',
    date: new Date(Date.now() - 604800000), // 1 week ago
    isRead: true,
    isStarred: false,
    hasAttachments: true,
    labels: ['INBOX', 'IMPORTANT'],
    sizeEstimate: 1792,
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
          id: '1',
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
      global.fetch = ((() => new Promise(() => {}))) as typeof globalThis.fetch;
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
          status: 401,
          json: () => Promise.resolve({ error: 'Unauthorized' }),
        } as Response)
      )) as typeof globalThis.fetch;
      return <Story />;
    },
  ],
};

export const AllUnread: Story = {
  args: {
    initialEmails: mockEmails.map(email => ({ ...email, isRead: false })),
  },
};

export const AllStarred: Story = {
  args: {
    initialEmails: mockEmails.map(email => ({ ...email, isStarred: true })),
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