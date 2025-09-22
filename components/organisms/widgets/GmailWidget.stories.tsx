import type { Meta, StoryObj } from '@storybook/nextjs';
import { SessionProvider } from 'next-auth/react';
import GmailWidget from './GmailWidget';
import type { EmailMessage } from '@/utils/google/google-gmail';

// Mock email data for Storybook
const mockEmails: EmailMessage[] = [
  {
    id: 'email1',
    threadId: 'thread1',
    from: { name: 'John Doe', email: 'john@example.com' },
    to: ['you@example.com'],
    subject: 'Project Update — Q4 Review',
    snippet: 'Hi team, I wanted to share the latest updates on our Q4 project. We have...',
    date: new Date(Date.now() - 3600000), // 1 hour ago
    isRead: false,
    isStarred: true,
    hasAttachments: true,
    labels: ['INBOX', 'UNREAD', 'STARRED'],
    sizeEstimate: 15420
  },
  {
    id: 'email2',
    threadId: 'thread2',
    from: { name: 'Sarah Johnson', email: 'sarah@example.com' },
    to: ['you@example.com'],
    subject: 'Meeting Tomorrow at 2 PM',
    snippet: 'Just a reminder about our meeting tomorrow to discuss the new feature implementa...',
    date: new Date(Date.now() - 86400000), // 1 day ago
    isRead: false,
    isStarred: true,
    hasAttachments: false,
    labels: ['INBOX', 'UNREAD'],
    sizeEstimate: 8250
  },
  {
    id: 'email3',
    threadId: 'thread3',
    from: { name: 'GitHub', email: 'notifications@github.com' },
    to: ['you@example.com'],
    subject: '[PR] New pull request in yustboard',
    snippet: 'A new pull request has been opened by usr123. "Add dark mode support"...',
    date: new Date(Date.now() - 86400000 * 2), // 2 days ago
    isRead: true,
    isStarred: false,
    hasAttachments: false,
    labels: ['INBOX'],
    sizeEstimate: 5680
  },
  {
    id: 'email4',
    threadId: 'thread4',
    from: { name: 'Slack', email: 'notifications@slack.com' },
    to: ['you@example.com'],
    subject: 'Your weekly team summary',
    snippet: 'Here\'s what happened in your workspace this week: 42 messages, 8 files sh...',
    date: new Date(Date.now() - 86400000 * 3), // 3 days ago
    isRead: true,
    isStarred: false,
    hasAttachments: false,
    labels: ['INBOX', 'CATEGORY_UPDATES'],
    sizeEstimate: 12340
  }
];

const mockSession = {
  user: {
    id: 'user123',
    name: 'Test User',
    email: 'test@example.com',
    image: null,
    role: 'USER' as const
  },
  accessToken: 'mock-access-token',
  expires: '2024-12-31'
};

const meta: Meta<typeof GmailWidget> = {
  title: 'Dashboard/Widgets/GmailWidget',
  component: GmailWidget,
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
    }
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <SessionProvider session={mockSession}>
        <div className="max-w-md">
          <Story />
        </div>
      </SessionProvider>
    )
  ],
  argTypes: {
    initialEmails: {
      description: 'Initial emails to display in the widget',
      control: 'object'
    },
    maxEmails: {
      description: 'Maximum number of emails to fetch and display',
      control: { type: 'number', min: 1, max: 20 }
    }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    initialEmails: mockEmails,
    maxEmails: 5
  }
};

export const WithUnreadEmails: Story = {
  args: {
    initialEmails: mockEmails.map(email => ({ ...email, isRead: false })),
    maxEmails: 5
  }
};

export const WithAllReadEmails: Story = {
  args: {
    initialEmails: mockEmails.map(email => ({ ...email, isRead: true, isStarred: false })),
    maxEmails: 5
  }
};

export const EmptyState: Story = {
  args: {
    initialEmails: [],
    maxEmails: 5
  }
};