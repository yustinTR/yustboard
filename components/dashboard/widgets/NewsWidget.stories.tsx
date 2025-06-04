import type { Meta, StoryObj } from '@storybook/react';
import NewsWidget from './NewsWidget';

const mockArticles = [
  {
    title: 'Breaking: Major Tech Company Announces New Product',
    description: 'In a surprising move, the tech giant revealed their latest innovation that promises to revolutionize the industry...',
    url: 'https://example.com/tech-news',
    urlToImage: 'https://via.placeholder.com/400x200',
    publishedAt: new Date().toISOString(),
    source: {
      name: 'Tech News Daily',
    },
    category: 'technology',
  },
  {
    title: 'Global Markets React to Economic Policy Changes',
    description: 'Financial markets around the world showed mixed reactions to the latest economic policy announcements...',
    url: 'https://example.com/business-news',
    urlToImage: 'https://via.placeholder.com/400x200',
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
    source: {
      name: 'Business Times',
    },
    category: 'business',
  },
  {
    title: 'Scientific Breakthrough in Climate Research',
    description: 'Researchers have discovered a new method that could significantly impact our understanding of climate change...',
    url: 'https://example.com/science-news',
    publishedAt: new Date(Date.now() - 7200000).toISOString(),
    source: {
      name: 'Science Journal',
    },
    category: 'science',
  },
];

const meta = {
  title: 'Dashboard/Widgets/NewsWidget',
  component: NewsWidget,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof NewsWidget>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  decorators: [
    (Story) => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ articles: mockArticles }),
        } as Response)
      );

      return <Story />;
    },
  ],
};

export const Loading: Story = {
  decorators: [
    (Story) => {
      global.fetch = jest.fn(() => new Promise(() => {}));
      return <Story />;
    },
  ],
};

export const Error: Story = {
  decorators: [
    (Story) => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
        } as Response)
      );

      return <Story />;
    },
  ],
};

export const NoArticles: Story = {
  decorators: [
    (Story) => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ articles: [] }),
        } as Response)
      );

      return <Story />;
    },
  ],
};

export const WithManyArticles: Story = {
  decorators: [
    (Story) => {
      const manyArticles = Array.from({ length: 10 }, (_, i) => ({
        title: `News Article ${i + 1}: Important Update`,
        description: `This is the description for news article ${i + 1}. It contains important information about recent events...`,
        url: `https://example.com/news-${i + 1}`,
        urlToImage: i % 2 === 0 ? 'https://via.placeholder.com/400x200' : undefined,
        publishedAt: new Date(Date.now() - i * 3600000).toISOString(),
        source: {
          name: ['Tech News', 'Business Daily', 'Science Today', 'World Report'][i % 4],
        },
        category: ['technology', 'business', 'science', 'general'][i % 4],
      }));

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ articles: manyArticles }),
        } as Response)
      );

      return <Story />;
    },
  ],
};

export const MobileView: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  decorators: [
    (Story) => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ articles: mockArticles }),
        } as Response)
      );

      return <Story />;
    },
  ],
};