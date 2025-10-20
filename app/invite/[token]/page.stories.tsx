import type { Meta, StoryObj } from '@storybook/nextjs';
import InviteAcceptPage from './page';
import { SessionProvider } from 'next-auth/react';

const meta = {
  title: 'Pages/Invite',
  component: InviteAcceptPage,
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
            email: 'newmember@test.com',
          },
          expires: '2025-12-31',
        }}
      >
        <Story />
      </SessionProvider>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof InviteAcceptPage>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock params Promise
const mockParams = Promise.resolve({ token: 'mock-invite-token-123' });

// Valid invite - ready to accept
export const ValidInvite: Story = {
  args: {
    params: mockParams,
  },
  decorators: [
    (Story) => {
      global.fetch = ((url: string) => {
        if (url.includes('/api/invite/')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                invite: {
                  id: 'invite-123',
                  email: 'newmember@test.com',
                  role: 'MEMBER',
                  organization: {
                    name: 'Acme Inc',
                    slug: 'acme-inc',
                  },
                  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                  isExpired: false,
                  isAccepted: false,
                },
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
  args: {
    params: mockParams,
  },
  decorators: [
    (Story) => {
      global.fetch = (() => new Promise(() => {})) as typeof globalThis.fetch;
      return <Story />;
    },
  ],
};

// Expired invite
export const ExpiredInvite: Story = {
  args: {
    params: mockParams,
  },
  decorators: [
    (Story) => {
      global.fetch = ((url: string) => {
        if (url.includes('/api/invite/')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                invite: {
                  id: 'invite-123',
                  email: 'newmember@test.com',
                  role: 'MEMBER',
                  organization: {
                    name: 'Acme Inc',
                    slug: 'acme-inc',
                  },
                  expiresAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                  isExpired: true,
                  isAccepted: false,
                },
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

// Already accepted invite
export const AlreadyAccepted: Story = {
  args: {
    params: mockParams,
  },
  decorators: [
    (Story) => {
      global.fetch = ((url: string) => {
        if (url.includes('/api/invite/')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                invite: {
                  id: 'invite-123',
                  email: 'newmember@test.com',
                  role: 'MEMBER',
                  organization: {
                    name: 'Acme Inc',
                    slug: 'acme-inc',
                  },
                  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                  isExpired: false,
                  isAccepted: true,
                },
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

// Invalid invite (not found)
export const InvalidInvite: Story = {
  args: {
    params: mockParams,
  },
  decorators: [
    (Story) => {
      global.fetch = ((url: string) => {
        if (url.includes('/api/invite/')) {
          return Promise.resolve({
            ok: false,
            status: 404,
            json: () =>
              Promise.resolve({
                error: 'Invite not found',
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

// Success state (after accepting)
export const SuccessAccepted: Story = {
  args: {
    params: mockParams,
  },
  decorators: [
    (Story) => {
      global.fetch = ((url: string, options?: RequestInit) => {
        if (url.includes('/accept') && options?.method === 'POST') {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                message: 'Invite accepted successfully',
                organization: {
                  name: 'Acme Inc',
                  slug: 'acme-inc',
                },
              }),
          } as Response);
        }
        if (url.includes('/api/invite/')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                invite: {
                  id: 'invite-123',
                  email: 'newmember@test.com',
                  role: 'MEMBER',
                  organization: {
                    name: 'Acme Inc',
                    slug: 'acme-inc',
                  },
                  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                  isExpired: false,
                  isAccepted: false,
                },
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

// Accepting in progress
export const Accepting: Story = {
  args: {
    params: mockParams,
  },
  decorators: [
    (Story) => {
      global.fetch = ((url: string, options?: RequestInit) => {
        if (options?.method === 'POST') {
          // Simulate slow API
          return new Promise(() => {});
        }
        if (url.includes('/api/invite/')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                invite: {
                  id: 'invite-123',
                  email: 'newmember@test.com',
                  role: 'MEMBER',
                  organization: {
                    name: 'Acme Inc',
                    slug: 'acme-inc',
                  },
                  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                  isExpired: false,
                  isAccepted: false,
                },
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

// Accept failed
export const AcceptFailed: Story = {
  args: {
    params: mockParams,
  },
  decorators: [
    (Story) => {
      global.fetch = ((url: string, options?: RequestInit) => {
        if (url.includes('/accept') && options?.method === 'POST') {
          return Promise.resolve({
            ok: false,
            status: 500,
            json: () =>
              Promise.resolve({
                error: 'Failed to accept invite',
              }),
          } as Response);
        }
        if (url.includes('/api/invite/')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                invite: {
                  id: 'invite-123',
                  email: 'newmember@test.com',
                  role: 'MEMBER',
                  organization: {
                    name: 'Acme Inc',
                    slug: 'acme-inc',
                  },
                  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                  isExpired: false,
                  isAccepted: false,
                },
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

// Admin role invite
export const AdminRoleInvite: Story = {
  args: {
    params: mockParams,
  },
  decorators: [
    (Story) => {
      global.fetch = ((url: string) => {
        if (url.includes('/api/invite/')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                invite: {
                  id: 'invite-123',
                  email: 'admin@test.com',
                  role: 'ADMIN',
                  organization: {
                    name: 'Acme Inc',
                    slug: 'acme-inc',
                  },
                  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                  isExpired: false,
                  isAccepted: false,
                },
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

// Unauthenticated user - should redirect to login
export const Unauthenticated: Story = {
  args: {
    params: mockParams,
  },
  decorators: [
    (Story) => (
      <SessionProvider session={null}>
        <Story />
      </SessionProvider>
    ),
  ],
};
