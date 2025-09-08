import type { Meta, StoryObj } from '@storybook/nextjs';
import EventModal from './EventModal';

const meta: Meta<typeof EventModal> = {
  title: 'Dashboard/Modals/EventModal',
  component: EventModal,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Modal for displaying calendar event details with glass morphism design.',
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
    event: {
      control: 'object',
      description: 'Event details to display',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock event data
const mockEvent = {
  id: '1',
  title: 'Team Meeting - Sprint Planning',
  description: 'Weekly sprint planning meeting to discuss upcoming tasks, priorities, and blockers. We will review the current sprint progress and plan for the next iteration.',
  date: new Date('2024-01-15T10:00:00'),
  endDate: new Date('2024-01-15T11:30:00'),
  location: 'Conference Room A / Zoom Meeting',
  completed: false,
  attendees: ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Wilson'],
  organizer: 'Project Manager',
  url: 'https://calendar.google.com/event/123'
};

const upcomingEvent = {
  id: '2',
  title: 'Product Demo Presentation',
  description: 'Presenting the new dashboard features to stakeholders and gathering feedback for future improvements.',
  date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
  endDate: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // Tomorrow + 2 hours
  location: 'Main Auditorium',
  completed: false,
  attendees: ['CEO', 'CTO', 'Product Team', 'Design Team'],
  organizer: 'Product Manager',
  url: 'https://calendar.google.com/event/456'
};

const pastEvent = {
  id: '3',
  title: 'Code Review Session',
  description: 'Review recent code changes and discuss best practices.',
  date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
  endDate: new Date(Date.now() - 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // Yesterday + 1 hour
  location: 'Development Office',
  completed: true,
  attendees: ['Senior Developer', 'Junior Developer'],
  organizer: 'Tech Lead'
};

const ongoingEvent = {
  id: '4',
  title: 'Daily Standup',
  description: 'Quick daily sync to discuss progress and blockers.',
  date: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
  endDate: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
  location: 'Zoom Call',
  completed: false,
  attendees: ['Development Team'],
  organizer: 'Scrum Master'
};

export const Default: Story = {
  args: {
    event: mockEvent,
    isOpen: true,
    onClose: () => console.log('Modal closed'),
  },
};

export const UpcomingEvent: Story = {
  args: {
    event: upcomingEvent,
    isOpen: true,
    onClose: () => console.log('Modal closed'),
  },
};

export const PastEvent: Story = {
  args: {
    event: pastEvent,
    isOpen: true,
    onClose: () => console.log('Modal closed'),
  },
};

export const OngoingEvent: Story = {
  args: {
    event: ongoingEvent,
    isOpen: true,
    onClose: () => console.log('Modal closed'),
  },
};

export const MinimalEvent: Story = {
  args: {
    event: {
      id: '5',
      title: 'Quick Coffee Break',
      date: new Date(),
      completed: false,
    },
    isOpen: true,
    onClose: () => console.log('Modal closed'),
  },
};

export const LongEvent: Story = {
  args: {
    event: {
      id: '6',
      title: 'Annual Company Retreat - Team Building and Strategy Planning Session',
      description: 'This is our annual company retreat where we will be focusing on team building activities, strategic planning for the upcoming year, reviewing our company goals and objectives, and planning new initiatives. We will have multiple sessions including workshops, presentations, and networking opportunities. The event will span across multiple days with various activities planned for each day including outdoor activities, group discussions, and collaborative sessions.',
      date: new Date('2024-06-15T09:00:00'),
      endDate: new Date('2024-06-17T17:00:00'),
      location: 'Mountain Resort Conference Center, Colorado Springs, CO',
      completed: false,
      attendees: [
        'All Company Staff', 'External Facilitator', 'Guest Speakers', 
        'Board Members', 'Department Heads', 'Team Leads'
      ],
      organizer: 'Human Resources Department',
      url: 'https://calendar.google.com/event/retreat2024'
    },
    isOpen: true,
    onClose: () => console.log('Modal closed'),
  },
};

export const Closed: Story = {
  args: {
    event: mockEvent,
    isOpen: false,
    onClose: () => console.log('Modal closed'),
  },
};