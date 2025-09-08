import type { Meta, StoryObj } from '@storybook/nextjs';
import EmailModal from './EmailModal';

// Mock fetch for email data
global.fetch = ((url: string) => {
  if (typeof url === 'string' && url.includes('/api/gmail/')) {
    const emailId = url.split('/').pop();
    
    const mockEmails: { [key: string]: Record<string, unknown> } = {
      'email1': {
        id: 'email1',
        subject: 'Project Update - Dashboard Development',
        from: { name: 'John Doe', email: 'john@example.com' },
        to: ['you@example.com'],
        date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        body: `Hi there,

I wanted to give you a quick update on the dashboard development project. We've made significant progress this week:

✅ Completed the user authentication system
✅ Implemented the main dashboard layout
✅ Added glass morphism design throughout
🔄 Currently working on the widget system
📅 Next week: Focus on data visualization components

The project is on track for the planned release date. The new glass design is looking really modern and user-friendly.

Let me know if you have any questions or feedback!

Best regards,
John`,
        isRead: false,
        isStarred: true,
        hasAttachments: false,
        labels: ['INBOX', 'UNREAD', 'STARRED'],
      },
      'email2': {
        id: 'email2',
        subject: 'Meeting Notes - Weekly Team Sync',
        from: { name: 'Sarah Johnson', email: 'sarah@company.com' },
        to: ['team@company.com'],
        date: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        body: `Team,

Here are the notes from today's meeting:

## Agenda Items Discussed:

1. **Sprint Review**
   - Completed 8 out of 10 planned tickets
   - 2 tickets moved to next sprint due to complexity

2. **Upcoming Deadlines**
   - Feature freeze: Friday, Jan 26th
   - Testing phase: Jan 29th - Feb 2nd
   - Release: February 5th

3. **Blockers**
   - Waiting for API documentation from backend team
   - Need design approval for new user flow

## Action Items:
- @john: Follow up with backend team on API docs
- @alice: Finalize design mockups by Wednesday
- @team: Code review by Thursday

Next meeting: Same time next week.

Cheers,
Sarah`,
        isRead: true,
        isStarred: false,
        hasAttachments: true,
        labels: ['INBOX'],
      },
      'email3': {
        id: 'email3',
        subject: 'Welcome to YustBoard!',
        from: { name: 'YustBoard Team', email: 'welcome@yustboard.com' },
        to: ['newuser@example.com'],
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        body: `Welcome to YustBoard! 🎉

Thank you for joining our platform. We're excited to have you on board!

## Getting Started:

1. **Complete your profile** - Add your personal information and preferences
2. **Explore the dashboard** - Check out all the available widgets and features  
3. **Customize your experience** - Rearrange widgets and set up your workspace
4. **Connect your accounts** - Link Gmail, Calendar, and other services

## Need Help?

- 📚 Check out our [documentation](https://docs.yustboard.com)
- 💬 Join our [community forum](https://community.yustboard.com)  
- 📧 Email us at support@yustboard.com

We're here to help you make the most of YustBoard!

Welcome aboard! 🚀

The YustBoard Team`,
        isRead: true,
        isStarred: false,
        hasAttachments: false,
        labels: ['INBOX'],
      },
    };

    const email = mockEmails[emailId || 'email1'];
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(email || mockEmails.email1)
    } as Response);
  }
  
  return Promise.reject(new Error('Not found'));
}) as typeof fetch;

const meta: Meta<typeof EmailModal> = {
  title: 'Dashboard/Modals/EmailModal',
  component: EmailModal,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Modal for displaying email details with glass morphism design, starring functionality, and email actions.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Controls whether the modal is open',
    },
    onClose: {
      action: 'closed',
      description: 'Callback when modal is closed',
    },
    emailId: {
      control: 'text',
      description: 'ID of the email to display',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const UnreadStarredEmail: Story = {
  args: {
    emailId: 'email1',
    isOpen: true,
    onClose: () => console.log('Modal closed'),
  },
};

export const ReadEmailWithAttachments: Story = {
  args: {
    emailId: 'email2',
    isOpen: true,
    onClose: () => console.log('Modal closed'),
  },
};

export const WelcomeEmail: Story = {
  args: {
    emailId: 'email3',
    isOpen: true,
    onClose: () => console.log('Modal closed'),
  },
};

export const LoadingState: Story = {
  args: {
    emailId: 'loading',
    isOpen: true,
    onClose: () => console.log('Modal closed'),
  },
  decorators: [
    (Story) => {
      // Override fetch to simulate loading
      global.fetch = (() => {
        return new Promise(() => {}); // Never resolves
      }) as typeof fetch;
      
      return <Story />;
    },
  ],
};

export const ErrorState: Story = {
  args: {
    emailId: 'error',
    isOpen: true,
    onClose: () => console.log('Modal closed'),
  },
  decorators: [
    (Story) => {
      // Override fetch to simulate error
      global.fetch = (() => {
        return Promise.reject(new Error('Failed to fetch email'));
      }) as typeof fetch;
      
      return <Story />;
    },
  ],
};

export const Closed: Story = {
  args: {
    emailId: 'email1',
    isOpen: false,
    onClose: () => console.log('Modal closed'),
  },
};