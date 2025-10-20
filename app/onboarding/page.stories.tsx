import type { Meta, StoryObj } from '@storybook/nextjs';
import OnboardingPage from './page';
import { SessionProvider } from 'next-auth/react';

const meta = {
  title: 'Pages/Onboarding',
  component: OnboardingPage,
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
    },
  },
  decorators: [
    (Story) => (
      <SessionProvider
        session={{
          user: {
            id: 'user-123',
            name: 'Test User',
            email: 'test@example.com',
          },
          expires: '2025-12-31',
        }}
      >
        <Story />
      </SessionProvider>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof OnboardingPage>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default state - ready for organization creation
export const Default: Story = {
  decorators: [
    (Story) => {
      // Mock fetch for onboarding status check
      global.fetch = ((url: string) => {
        if (url.includes('/api/onboarding') && !url.includes('POST')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                needsOnboarding: true,
                authenticated: true,
              }),
          } as Response);
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        } as Response);
      }) as typeof globalThis.fetch;

      return <Story />;
    },
  ],
};

// Loading state
export const Loading: Story = {
  decorators: [
    (Story) => (
      <SessionProvider
        session={{
          user: {
            id: 'user-123',
            name: 'Test User',
            email: 'test@example.com',
          },
          expires: '2025-12-31',
        }}
      >
        <Story />
      </SessionProvider>
    ),
  ],
  parameters: {
    mockData: {
      loading: true,
    },
  },
};

// Creating organization (submitting)
export const CreatingOrganization: Story = {
  decorators: [
    (Story) => {
      global.fetch = ((url: string, options?: RequestInit) => {
        if (options?.method === 'POST') {
          // Simulate slow API
          return new Promise(() => {});
        }
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              needsOnboarding: true,
              authenticated: true,
            }),
        } as Response);
      }) as typeof globalThis.fetch;

      return <Story />;
    },
  ],
};

// Error: Slug already exists
export const SlugAlreadyExists: Story = {
  decorators: [
    (Story) => {
      global.fetch = ((url: string, options?: RequestInit) => {
        if (options?.method === 'POST') {
          return Promise.resolve({
            ok: false,
            status: 400,
            json: () =>
              Promise.resolve({
                error: 'Organization slug already exists',
              }),
          } as Response);
        }
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              needsOnboarding: true,
              authenticated: true,
            }),
        } as Response);
      }) as typeof globalThis.fetch;

      return <Story />;
    },
  ],
};

// Error: Invalid slug format
export const InvalidSlugFormat: Story = {
  decorators: [
    (Story) => {
      global.fetch = ((url: string, options?: RequestInit) => {
        if (options?.method === 'POST') {
          return Promise.resolve({
            ok: false,
            status: 400,
            json: () =>
              Promise.resolve({
                error:
                  'Invalid slug format. Only lowercase letters, numbers, and hyphens allowed.',
              }),
          } as Response);
        }
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              needsOnboarding: true,
              authenticated: true,
            }),
        } as Response);
      }) as typeof globalThis.fetch;

      return <Story />;
    },
  ],
};

// Unauthenticated - should redirect to login
export const Unauthenticated: Story = {
  decorators: [
    (Story) => (
      <SessionProvider session={null}>
        <Story />
      </SessionProvider>
    ),
  ],
};
