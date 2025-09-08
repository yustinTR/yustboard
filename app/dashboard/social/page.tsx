import { FiTwitter, FiInstagram, FiMessageCircle, FiHeart, FiShare2, FiRefreshCw } from 'react-icons/fi';

// Mock social media posts (would come from API in real app)
const socialPosts = [
  {
    id: '1',
    platform: 'twitter',
    author: {
      name: 'John Doe',
      handle: 'johndoe',
      avatar: 'https://placehold.co/100',
    },
    content: 'Just launched my new portfolio website! Check it out at example.com #webdev',
    likes: 45,
    comments: 5,
    shares: 12,
    timestamp: new Date(2023, 5, 14, 10, 30),
  },
  {
    id: '2',
    platform: 'instagram',
    author: {
      name: 'Jane Smith',
      handle: 'janesmith',
      avatar: 'https://placehold.co/100',
    },
    content: 'Beautiful day at the beach! ☀️🌊 #summer #vacation',
    likes: 120,
    comments: 15,
    shares: 3,
    timestamp: new Date(2023, 5, 14, 14, 15),
    image: 'https://placehold.co/600x400',
  },
  {
    id: '3',
    platform: 'twitter',
    author: {
      name: 'Tech News',
      handle: 'technews',
      avatar: 'https://placehold.co/100',
    },
    content: 'Breaking: New AI model can write code with 90% accuracy. This could revolutionize software development. #AI #tech',
    likes: 89,
    comments: 34,
    shares: 27,
    timestamp: new Date(2023, 5, 14, 9, 15),
  },
  {
    id: '4',
    platform: 'instagram',
    author: {
      name: 'Travel Enthusiast',
      handle: 'travelbug',
      avatar: 'https://placehold.co/100',
    },
    content: 'Exploring the streets of Tokyo. So much to see and discover! 🇯🇵 #travel #japan',
    likes: 256,
    comments: 42,
    shares: 18,
    timestamp: new Date(2023, 5, 13, 22, 45),
    image: 'https://placehold.co/600x400',
  },
  {
    id: '5',
    platform: 'twitter',
    author: {
      name: 'Coding Tips',
      handle: 'codetips',
      avatar: 'https://placehold.co/100',
    },
    content: 'Pro tip: Learn keyboard shortcuts for your IDE. It will save you hours of development time. #programming #productivity',
    likes: 65,
    comments: 7,
    shares: 31,
    timestamp: new Date(2023, 5, 13, 15, 20),
  },
];

export default function SocialPage() {
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitter':
        return <FiTwitter className="text-blue-400" />;
      case 'instagram':
        return <FiInstagram className="text-pink-500" />;
      default:
        return null;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d`;
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Social Feed</h1>
        <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors">
          <FiRefreshCw className="mr-2" />
          Refresh
        </button>
      </div>

      {/* Platform Filter */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="p-4 flex space-x-4">
          <button className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg flex items-center transition-colors">
            <FiTwitter className="text-blue-400 mr-2" />
            Twitter
          </button>
          <button className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg flex items-center transition-colors">
            <FiInstagram className="text-pink-500 mr-2" />
            Instagram
          </button>
        </div>
      </div>

      {/* Social Feed */}
      <div className="space-y-4">
        {socialPosts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4">
              <div className="flex items-start">
                <img 
                  src={post.author.avatar} 
                  alt={post.author.name} 
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="font-medium mr-1">{post.author.name}</span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm mr-2">@{post.author.handle}</span>
                    <span className="text-gray-400 dark:text-gray-500 text-xs">{formatTime(post.timestamp)}</span>
                    <div className="ml-auto">{getPlatformIcon(post.platform)}</div>
                  </div>
                  <p className="mt-2 text-gray-700 dark:text-gray-300">{post.content}</p>
                  {post.image && (
                    <div className="mt-3 rounded-lg overflow-hidden">
                      <img src={post.image} alt="Post" className="w-full h-auto" />
                    </div>
                  )}
                  <div className="mt-4 flex items-center text-gray-500 dark:text-gray-400">
                    <button className="flex items-center mr-6 hover:text-blue-500 transition-colors">
                      <FiMessageCircle className="mr-1" />
                      <span>{post.comments}</span>
                    </button>
                    <button className="flex items-center mr-6 hover:text-red-500 transition-colors">
                      <FiHeart className="mr-1" />
                      <span>{post.likes}</span>
                    </button>
                    <button className="flex items-center hover:text-green-500 transition-colors">
                      <FiShare2 className="mr-1" />
                      <span>{post.shares}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}