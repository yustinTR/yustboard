import type { Meta, StoryObj } from '@storybook/nextjs';
import BlogWidget from './BlogWidget';

// Mock blog post data for Storybook
const mockBlogPosts = [
  {
    id: 'post1',
    title: 'Getting Started with Next.js 14 and App Router',
    slug: 'getting-started-nextjs-14-app-router',
    excerpt: 'Learn how to build modern web applications with Next.js 14, featuring the new App Router, server components, and improved performance.',
    coverImage: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop&crop=center',
    published: true,
    publishedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    author: {
      id: 'author1',
      name: 'John Developer',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    }
  },
  {
    id: 'post2',
    title: 'Building Responsive Dashboards with Tailwind CSS',
    slug: 'building-responsive-dashboards-tailwind-css',
    excerpt: 'Create beautiful and responsive dashboard interfaces using Tailwind CSS utility classes and modern design principles.',
    coverImage: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=300&fit=crop&crop=center',
    published: true,
    publishedAt: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(), // 4 days ago
    author: {
      id: 'author2',
      name: 'Sarah Designer',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b332c1fa?w=100&h=100&fit=crop&crop=face'
    }
  },
  {
    id: 'post3',
    title: 'TypeScript Best Practices for Large Applications',
    slug: 'typescript-best-practices-large-applications',
    excerpt: 'Discover essential TypeScript patterns and practices that will help you maintain and scale large applications effectively.',
    coverImage: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=300&fit=crop&crop=center',
    published: true,
    publishedAt: new Date(Date.now() - 86400000 * 7).toISOString(), // 1 week ago
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString(), // 8 days ago
    author: {
      id: 'author1',
      name: 'John Developer',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    }
  },
  {
    id: 'post4',
    title: 'Implementing Authentication with NextAuth.js',
    slug: 'implementing-authentication-nextauth',
    excerpt: 'Step-by-step guide to implementing secure authentication in your Next.js application using NextAuth.js.',
    published: true,
    publishedAt: new Date(Date.now() - 86400000 * 14).toISOString(), // 2 weeks ago
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(), // 15 days ago
    author: {
      id: 'author3',
      name: 'Alex Security',
      image: null
    }
  },
  {
    id: 'post5',
    title: 'Performance Optimization Techniques for React',
    slug: 'performance-optimization-techniques-react',
    excerpt: 'Learn advanced techniques to optimize your React applications for better performance and user experience.',
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop&crop=center',
    published: true,
    publishedAt: new Date(Date.now() - 86400000 * 21).toISOString(), // 3 weeks ago
    createdAt: new Date(Date.now() - 86400000 * 22).toISOString(), // 22 days ago
    author: {
      id: 'author2',
      name: 'Sarah Designer',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b332c1fa?w=100&h=100&fit=crop&crop=face'
    }
  }
];

const meta: Meta<typeof BlogWidget> = {
  title: 'Dashboard/Widgets/BlogWidget',
  component: BlogWidget,
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
    },
    mockData: {
      '/api/blog': {
        posts: mockBlogPosts
      }
    }
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-96 h-[600px]">
        <Story />
      </div>
    )
  ]
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock the API call for Storybook
if (typeof window !== 'undefined') {
  // Override fetch for Storybook
  const originalFetch = window.fetch;
  window.fetch = async (url: RequestInfo | URL, options?: RequestInit) => {
    if (typeof url === 'string' && url.includes('/api/blog')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({ posts: mockBlogPosts }),
        status: 200,
        statusText: 'OK'
      } as Response);
    }
    return originalFetch(url, options);
  };
}

export const Default: Story = {};

export const Loading: Story = {
  parameters: {
    mockData: {
      '/api/blog': {
        delay: 5000 // Simulate loading state
      }
    }
  }
};

export const WithFewPosts: Story = {
  parameters: {
    mockData: {
      '/api/blog': {
        posts: mockBlogPosts.slice(0, 2)
      }
    }
  }
};

export const EmptyState: Story = {
  parameters: {
    mockData: {
      '/api/blog': {
        posts: []
      }
    }
  }
};

export const ErrorState: Story = {
  parameters: {
    mockData: {
      '/api/blog': {
        error: 'Failed to fetch blog posts',
        status: 500
      }
    }
  }
};