import type { Meta, StoryObj } from '@storybook/nextjs';
import PostModal from './PostModal';

// Mock fetch for comments and likes
global.fetch = ((url: string, options?: RequestInit) => {
  if (typeof url === 'string') {
    // Handle comments API
    if (url.includes('/api/timeline/') && url.includes('/comments')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          comments: [
            {
              id: '1',
              content: 'Great post! Thanks for sharing.',
              createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
              user: {
                id: '2',
                name: 'Alice Johnson',
                email: 'alice@example.com',
                image: 'https://images.unsplash.com/photo-1494790108755-2616b612c2c5?w=40&h=40&fit=crop&crop=face'
              }
            },
            {
              id: '2', 
              content: 'I completely agree with your points here. This is exactly what we needed to implement.',
              createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              user: {
                id: '3',
                name: 'Bob Wilson',
                email: 'bob@example.com',
                image: null
              }
            }
          ]
        })
      } as Response);
    }
    
    // Handle like/unlike API  
    if (url.includes('/api/timeline/') && url.includes('/like')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true })
      } as Response);
    }
    
    // Handle comment creation
    if (url.includes('/api/timeline/') && options?.method === 'POST') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          id: 'new-comment',
          content: JSON.parse(options?.body as string).content,
          createdAt: new Date().toISOString(),
          user: {
            id: '1',
            name: 'Current User',
            email: 'user@example.com',
            image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
          }
        })
      } as Response);
    }
  }
  
  return Promise.reject(new Error('Not found'));
}) as typeof fetch;

const meta: Meta<typeof PostModal> = {
  title: 'Dashboard/Modals/PostModal',
  component: PostModal,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Modal for displaying timeline post details with comments, likes, and interaction capabilities.',
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
    onUpdate: {
      action: 'updated',
      description: 'Callback when post data should be refreshed',
    },
    post: {
      control: 'object',
      description: 'Timeline post to display',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock timeline posts
const regularPost = {
  id: '1',
  content: 'Just finished implementing the new glass morphism design for our dashboard! The visual effects look amazing and really give the interface a modern, professional feel. 🎨✨',
  createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
  user: {
    id: '1',
    name: 'John Developer',
    email: 'john@example.com', 
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
  },
  likes: [
    { userId: '2' },
    { userId: '3' },
    { userId: '4' }
  ],
  _count: {
    likes: 3,
    comments: 2
  },
  media: []
};

const postWithMedia = {
  id: '2',
  content: 'Check out these awesome screenshots from our latest sprint demo! The new features are working perfectly.',
  createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  user: {
    id: '2',
    name: 'Sarah Designer',
    email: 'sarah@example.com',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612c2c5?w=40&h=40&fit=crop&crop=face'
  },
  likes: [
    { userId: '1' },
    { userId: '3' },
    { userId: '4' },
    { userId: '5' },
    { userId: '6' }
  ],
  _count: {
    likes: 5,
    comments: 0
  },
  media: [
    {
      id: '1',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop',
      filename: 'dashboard-screenshot-1.png',
      size: 245760,
      mimeType: 'image/png'
    },
    {
      id: '2', 
      type: 'image',
      url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop',
      filename: 'analytics-view.png',
      size: 189440,
      mimeType: 'image/png'
    }
  ]
};

const longPost = {
  id: '3',
  content: `Just wrapped up an incredible week of development! Here's what we accomplished:

🚀 **New Features Shipped:**
- Glass morphism design system implementation
- Real-time notifications with WebSocket support  
- Advanced data visualization components
- Mobile-responsive dashboard improvements

🐛 **Bugs Fixed:**
- Email loading performance issues
- Calendar sync reliability problems
- Dark mode inconsistencies across components

📊 **Performance Improvements:**
- Reduced bundle size by 15%
- Improved first paint time by 200ms
- Optimized database queries for 40% faster load times

🎯 **Next Sprint Goals:**
- Implement user customization preferences
- Add export functionality for reports
- Enhanced accessibility features
- Integration with third-party services

Thanks to the amazing team for making this sprint so successful! 💪

#development #teamwork #progress`,
  createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
  user: {
    id: '3',
    name: 'Alex ProjectManager',
    email: 'alex@example.com',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
  },
  likes: [
    { userId: '1' },
    { userId: '2' },
    { userId: '4' },
    { userId: '5' },
    { userId: '6' },
    { userId: '7' },
    { userId: '8' }
  ],
  _count: {
    likes: 7,
    comments: 5
  },
  media: []
};

const noImagePost = {
  id: '4',
  content: 'Quick question for the team: what do you think about switching to TypeScript for our new microservices? I think it could really help with maintainability.',
  createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
  user: {
    id: '4',
    name: 'Emma Backend',
    email: 'emma@example.com',
    image: null
  },
  likes: [
    { userId: '1' }
  ],
  _count: {
    likes: 1,
    comments: 3
  },
  media: []
};

export const RegularPost: Story = {
  args: {
    post: regularPost,
    isOpen: true,
    onClose: () => console.log('Modal closed'),
    onUpdate: () => console.log('Post updated'),
  },
};

export const PostWithMedia: Story = {
  args: {
    post: postWithMedia,
    isOpen: true,
    onClose: () => console.log('Modal closed'),
    onUpdate: () => console.log('Post updated'),
  },
};

export const LongPost: Story = {
  args: {
    post: longPost,
    isOpen: true,
    onClose: () => console.log('Modal closed'),
    onUpdate: () => console.log('Post updated'),
  },
};

export const PostNoUserImage: Story = {
  args: {
    post: noImagePost,
    isOpen: true,
    onClose: () => console.log('Modal closed'),
    onUpdate: () => console.log('Post updated'),
  },
};

export const NoComments: Story = {
  args: {
    post: postWithMedia,
    isOpen: true,
    onClose: () => console.log('Modal closed'),
    onUpdate: () => console.log('Post updated'),
  },
  decorators: [
    (Story) => {
      // Override fetch to return no comments
      global.fetch = ((url: string) => {
        if (url.includes('/comments')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ comments: [] })
          } as Response);
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) } as Response);
      }) as typeof fetch;
      
      return <Story />;
    },
  ],
};

export const Closed: Story = {
  args: {
    post: regularPost,
    isOpen: false,
    onClose: () => console.log('Modal closed'),
    onUpdate: () => console.log('Post updated'),
  },
};