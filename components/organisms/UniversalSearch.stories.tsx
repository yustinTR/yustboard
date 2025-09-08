import type { Meta, StoryObj } from '@storybook/nextjs';
import UniversalSearch from './UniversalSearch';
import { SessionProvider } from 'next-auth/react';

const meta = {
  title: 'Dashboard/UniversalSearch',
  component: UniversalSearch,
  parameters: {
    layout: 'padded',
    nextjs: {
      appDirectory: true,
    },
  },
  decorators: [
    (Story) => (
      <SessionProvider session={{
        user: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'USER',
        },
        expires: '2025-12-31',
      }}>
        <div className="w-full max-w-2xl mx-auto">
          <Story />
        </div>
      </SessionProvider>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof UniversalSearch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithMockResults: Story = {
  decorators: [
    (Story) => {
      // Mock the fetch API to return search results
      global.fetch = ((url) => {
        if (typeof url === 'string' && url.includes('/api/search')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              results: [
                {
                  id: '1',
                  type: 'email',
                  title: 'Meeting Tomorrow',
                  subtitle: 'from john@example.com',
                  date: new Date(),
                },
                {
                  id: '2',
                  type: 'calendar',
                  title: 'Team Standup',
                  subtitle: '10:00 AM - 10:30 AM',
                  date: new Date(),
                },
                {
                  id: '3',
                  type: 'blog',
                  title: 'How to Use Universal Search',
                  subtitle: 'A comprehensive guide',
                  url: '/blog/universal-search-guide',
                },
                {
                  id: '4',
                  type: 'file',
                  title: 'Project Proposal.pdf',
                  subtitle: '2.4 MB',
                },
              ],
            }),
          } as Response);
        }
        return Promise.reject(new Error('Not found'));
      }) as typeof globalThis.fetch;

      return <Story />;
    },
  ],
};

export const EmptyState: Story = {
  decorators: [
    (Story) => {
      global.fetch = (() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ results: [] }),
        } as Response)
      ) as typeof globalThis.fetch;

      return <Story />;
    },
  ],
};

export const LoadingState: Story = {
  decorators: [
    (Story) => {
      global.fetch = (() => new Promise(() => {})) as typeof globalThis.fetch;
      return <Story />;
    },
  ],
};

export const ErrorState: Story = {
  decorators: [
    (Story) => {
      global.fetch = (() =>
        Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ error: 'Internal server error' }),
        } as Response)
      ) as typeof globalThis.fetch;

      return <Story />;
    },
  ],
};

export const InHeader: Story = {
  decorators: [
    (Story) => (
      <SessionProvider session={{
        user: {
          id: '2',
          name: 'Test User',
          email: 'test@example.com',
          role: 'USER',
        },
        expires: '2025-12-31',
      }}>
        <header className="flex items-center justify-between p-4 border-b">
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <div className="flex items-center gap-4">
            <Story />
            <button className="p-2 rounded-full hover:bg-muted">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
          </div>
        </header>
      </SessionProvider>
    ),
  ],
};