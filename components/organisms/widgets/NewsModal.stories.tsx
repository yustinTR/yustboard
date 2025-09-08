import type { Meta, StoryObj } from '@storybook/nextjs';
import NewsModal from './NewsModal';

const meta: Meta<typeof NewsModal> = {
  title: 'Dashboard/Modals/NewsModal',
  component: NewsModal,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Modal for displaying news article details with glass morphism design and sharing functionality.',
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
    article: {
      control: 'object',
      description: 'News article to display',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock news articles
const techArticle = {
  title: 'Revolutionary AI Breakthrough: New Language Model Achieves Human-Level Understanding',
  description: 'Researchers have developed a new AI system that demonstrates unprecedented understanding of human language and context, potentially revolutionizing how we interact with technology.',
  url: 'https://example.com/tech-news/ai-breakthrough',
  urlToImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop',
  publishedAt: new Date().toISOString(),
  source: {
    name: 'TechCrunch'
  },
  category: 'technology'
};

const businessArticle = {
  title: 'Global Economy Shows Signs of Recovery as Tech Stocks Surge',
  description: 'Markets around the world are experiencing significant growth as technology companies report better-than-expected earnings, leading economists to revise their forecasts upward.',
  url: 'https://example.com/business/market-recovery',
  urlToImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=400&fit=crop',
  publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  source: {
    name: 'Financial Times'
  },
  category: 'business'
};

const scienceArticle = {
  title: 'NASA Discovers Water Ice on Mars: Implications for Future Human Missions',
  description: 'Scientists using data from the Mars Reconnaissance Orbiter have confirmed the presence of significant water ice deposits beneath the Martian surface, opening new possibilities for sustainable human habitation on the Red Planet.',
  url: 'https://example.com/science/mars-water-discovery',
  urlToImage: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=400&fit=crop',
  publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  source: {
    name: 'NASA News'
  },
  category: 'science'
};

const longArticle = {
  title: 'The Future of Sustainable Energy: How Solar and Wind Power Are Transforming Global Infrastructure and Creating New Economic Opportunities',
  description: 'This comprehensive analysis explores the rapid advancement of renewable energy technologies, their impact on traditional energy markets, the challenges and opportunities they present for developing nations, and the role of government policies in accelerating the transition to a sustainable energy future. The article examines case studies from multiple countries and provides insights into the technological innovations that are making clean energy more affordable and accessible than ever before.',
  url: 'https://example.com/environment/sustainable-energy-future',
  urlToImage: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&h=400&fit=crop',
  publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
  source: {
    name: 'Environmental Science Today'
  },
  category: 'environment'
};

const noImageArticle = {
  title: 'Breaking: New Study Reveals Surprising Health Benefits of Regular Exercise',
  description: 'A long-term study involving 10,000 participants has revealed unexpected benefits of regular physical activity beyond the commonly known cardiovascular improvements.',
  url: 'https://example.com/health/exercise-benefits',
  publishedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
  source: {
    name: 'Health Today'
  },
  category: 'health'
};

export const TechNews: Story = {
  args: {
    article: techArticle,
    isOpen: true,
    onClose: () => console.log('Modal closed'),
  },
};

export const BusinessNews: Story = {
  args: {
    article: businessArticle,
    isOpen: true,
    onClose: () => console.log('Modal closed'),
  },
};

export const ScienceNews: Story = {
  args: {
    article: scienceArticle,
    isOpen: true,
    onClose: () => console.log('Modal closed'),
  },
};

export const LongArticle: Story = {
  args: {
    article: longArticle,
    isOpen: true,
    onClose: () => console.log('Modal closed'),
  },
};

export const NoImage: Story = {
  args: {
    article: noImageArticle,
    isOpen: true,
    onClose: () => console.log('Modal closed'),
  },
};

export const Closed: Story = {
  args: {
    article: techArticle,
    isOpen: false,
    onClose: () => console.log('Modal closed'),
  },
};

// Mock Web Share API for stories
if (typeof window !== 'undefined' && !navigator.share) {
  (navigator as typeof navigator).share = async (data: ShareData) => {
    console.log('Mock share:', data);
    return Promise.resolve();
  };
}

// Mock clipboard API for stories
if (typeof window !== 'undefined' && !navigator.clipboard) {
  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: async (text: string) => {
        console.log('Mock clipboard write:', text);
        return Promise.resolve();
      }
    },
    writable: true,
    configurable: true
  });
}