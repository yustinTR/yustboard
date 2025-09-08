import type { Meta, StoryObj } from '@storybook/nextjs';
import Post from './Post';

const meta = {
  title: 'Dashboard/Timeline/Post',
  component: Post,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Post>;

export default meta;
type Story = StoryObj<typeof meta>;

const basePost = {
  id: '1',
  content: 'Just deployed a new feature to production! 🚀 Everything is running smoothly.',
  createdAt: new Date().toISOString(),
  user: {
    id: 'user1',
    name: 'John Doe',
    email: 'john@example.com',
    image: 'https://avatars.githubusercontent.com/u/1?v=4',
  },
};

export const Default: Story = {
  args: {
    post: basePost,
  },
};

export const OwnPost: Story = {
  args: {
    post: basePost,
    currentUserId: 'user1',
  },
};

export const NoUserImage: Story = {
  args: {
    post: {
      ...basePost,
      user: {
        ...basePost.user,
        image: null,
      },
    },
  },
};

export const NoUserName: Story = {
  args: {
    post: {
      ...basePost,
      user: {
        id: 'user2',
        name: null,
        email: 'anonymous@example.com',
        image: null,
      },
    },
  },
};

export const LongContent: Story = {
  args: {
    post: {
      ...basePost,
      content: 'This is a very long post that contains multiple lines of text. It discusses various topics including software development, best practices, and team collaboration. The goal is to see how the component handles longer content and whether it properly wraps or truncates the text. Additionally, we want to ensure that the layout remains consistent regardless of the content length.',
    },
  },
};

export const OldPost: Story = {
  args: {
    post: {
      ...basePost,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    },
  },
};

export const PostWithEmoji: Story = {
  args: {
    post: {
      ...basePost,
      content: '🎉 Celebrating our team\'s success! 🎊 Great work everyone! 💪 #teamwork #success',
    },
  },
};

export const PostWithHashtags: Story = {
  args: {
    post: {
      ...basePost,
      content: 'Working on #React and #TypeScript today. Building some cool features with #NextJS!',
    },
  },
};

export const MultiplePostsExample: Story = {
  args: {
    post: basePost,
    currentUserId: 'current-user-id',
  },
  render: () => {
    const posts = [
      {
        id: '1',
        content: 'Starting my day with some coffee and code ☕',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        user: {
          id: 'user1',
          name: 'Alice Johnson',
          email: 'alice@example.com',
          image: 'https://avatars.githubusercontent.com/u/2?v=4',
        },
      },
      {
        id: '2',
        content: 'Just finished implementing the new dashboard widgets!',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        user: {
          id: 'user2',
          name: 'Bob Smith',
          email: 'bob@example.com',
          image: 'https://avatars.githubusercontent.com/u/3?v=4',
        },
      },
      {
        id: '3',
        content: 'Anyone else excited about the new features we\'re shipping this week?',
        createdAt: new Date(Date.now() - 10800000).toISOString(),
        user: {
          id: 'user3',
          name: 'Carol Davis',
          email: 'carol@example.com',
          image: null,
        },
      },
    ];

    return (
      <div className="space-y-4">
        {posts.map((post) => (
          <Post key={post.id} post={post} currentUserId="user2" />
        ))}
      </div>
    );
  },
};