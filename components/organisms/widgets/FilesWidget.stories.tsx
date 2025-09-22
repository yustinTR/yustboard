import type { Meta, StoryObj } from '@storybook/nextjs';
import { SessionProvider } from 'next-auth/react';
import FilesWidget from './FilesWidget';
import type { DriveFile } from '@/utils/google/google-drive';

// Mock Google Drive files data for Storybook
const mockDriveFiles: DriveFile[] = [
  {
    id: 'file1',
    name: 'Project Proposal - Q4 2024',
    mimeType: 'application/vnd.google-apps.document',
    createdTime: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    modifiedTime: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    webViewLink: 'https://docs.google.com/document/d/1234567890/edit',
    iconLink: 'https://drive-thirdparty.googleusercontent.com/16/type/application/vnd.google-apps.document',
    owners: [{ displayName: 'John Doe', emailAddress: 'john@example.com' }],
    shared: true,
    size: '25.5 KB'
  },
  {
    id: 'file2',
    name: 'Budget Spreadsheet 2025',
    mimeType: 'application/vnd.google-apps.spreadsheet',
    createdTime: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
    modifiedTime: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    webViewLink: 'https://docs.google.com/spreadsheets/d/0987654321/edit',
    iconLink: 'https://drive-thirdparty.googleusercontent.com/16/type/application/vnd.google-apps.spreadsheet',
    owners: [{ displayName: 'Jane Smith', emailAddress: 'jane@example.com' }],
    shared: true,
    size: '102 KB'
  },
  {
    id: 'file3',
    name: 'Team Meeting Notes - March',
    mimeType: 'application/vnd.google-apps.document',
    createdTime: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    modifiedTime: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
    webViewLink: 'https://docs.google.com/document/d/5555555555/edit',
    iconLink: 'https://drive-thirdparty.googleusercontent.com/16/type/application/vnd.google-apps.document',
    owners: [{ displayName: 'Alice Manager', emailAddress: 'alice@example.com' }],
    shared: false,
    size: '15 KB'
  },
  {
    id: 'file4',
    name: 'Marketing Presentation Q1',
    mimeType: 'application/vnd.google-apps.presentation',
    createdTime: new Date(Date.now() - 86400000 * 7).toISOString(), // 1 week ago
    modifiedTime: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
    webViewLink: 'https://docs.google.com/presentation/d/7777777777/edit',
    iconLink: 'https://drive-thirdparty.googleusercontent.com/16/type/application/vnd.google-apps.presentation',
    owners: [{ displayName: 'Bob Marketing', emailAddress: 'bob@example.com' }],
    shared: true,
    size: '2.1 MB'
  },
  {
    id: 'file5',
    name: 'Contract_Agreement_2024.pdf',
    mimeType: 'application/pdf',
    createdTime: new Date(Date.now() - 86400000 * 14).toISOString(), // 2 weeks ago
    modifiedTime: new Date(Date.now() - 86400000 * 10).toISOString(), // 10 days ago
    webViewLink: 'https://drive.google.com/file/d/9999999999/view',
    iconLink: 'https://drive-thirdparty.googleusercontent.com/16/type/application/pdf',
    owners: [{ displayName: 'Carol Legal', emailAddress: 'carol@example.com' }],
    shared: false,
    size: '845 KB'
  },
  {
    id: 'file6',
    name: 'Dashboard_Screenshots.zip',
    mimeType: 'application/zip',
    createdTime: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
    modifiedTime: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
    webViewLink: 'https://drive.google.com/file/d/8888888888/view',
    iconLink: 'https://drive-thirdparty.googleusercontent.com/16/type/application/zip',
    owners: [{ displayName: 'David Designer', emailAddress: 'david@example.com' }],
    shared: true,
    size: '15.2 MB'
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

const meta: Meta<typeof FilesWidget> = {
  title: 'Dashboard/Widgets/FilesWidget',
  component: FilesWidget,
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
        <div className="w-96 h-[600px]">
          <Story />
        </div>
      </SessionProvider>
    )
  ],
  argTypes: {
    initialFiles: {
      description: 'Initial files to display in the widget',
      control: 'object'
    },
    maxFiles: {
      description: 'Maximum number of files to display',
      control: { type: 'number', min: 1, max: 20 }
    }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock the API call for Storybook
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;
  window.fetch = async (url: RequestInfo | URL, options?: RequestInit) => {
    if (typeof url === 'string' && url.includes('/api/drive')) {
      const urlObj = new URL(url, window.location.origin);
      const maxFiles = parseInt(urlObj.searchParams.get('max') || '5');

      // Get the story context to determine which data to return
      const storyContext = (window as { __STORYBOOK_STORY_CONTEXT__?: { name?: string } }).__STORYBOOK_STORY_CONTEXT__;

      if (storyContext?.name === 'Error State') {
        return Promise.resolve({
          ok: false,
          json: async () => ({ error: 'Google Drive authentication failed. Please sign out and sign in again.' }),
          status: 401,
          statusText: 'Unauthorized'
        } as Response);
      } else if (storyContext?.name === 'Loading') {
        return new Promise(() => {}); // Never resolve to show loading state
      } else if (storyContext?.name === 'Empty State') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ files: [] }),
          status: 200,
          statusText: 'OK'
        } as Response);
      }

      const filesToReturn = mockDriveFiles.slice(0, maxFiles);

      return Promise.resolve({
        ok: true,
        json: async () => ({ files: filesToReturn }),
        status: 200,
        statusText: 'OK'
      } as Response);
    }
    return originalFetch(url, options);
  };
}

export const Default: Story = {
  args: {
    initialFiles: [],
    maxFiles: 5
  }
};

export const WithInitialFiles: Story = {
  args: {
    initialFiles: mockDriveFiles.slice(0, 3),
    maxFiles: 5
  }
};

export const Loading: Story = {
  args: {
    initialFiles: [],
    maxFiles: 5
  }
};

export const ErrorState: Story = {
  args: {
    initialFiles: [],
    maxFiles: 5
  }
};

export const EmptyState: Story = {
  args: {
    initialFiles: [],
    maxFiles: 5
  }
};

export const MaxFiles: Story = {
  args: {
    initialFiles: [],
    maxFiles: 10
  }
};

export const OnlyDocuments: Story = {
  args: {
    initialFiles: mockDriveFiles.filter(file =>
      file.mimeType.includes('document') || file.mimeType.includes('pdf')
    ),
    maxFiles: 5
  }
};