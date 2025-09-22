import type { Meta, StoryObj } from '@storybook/nextjs';
import FitnessWidget from './FitnessWidget';

// Mock fitness data for Storybook
const mockFitnessData = {
  steps: {
    value: 8420,
    goal: 10000
  },
  calories: {
    value: 1850,
    goal: 2200
  },
  activeMinutes: {
    value: 45,
    goal: 60
  },
  heartRate: {
    value: 72,
    min: 65,
    max: 95
  },
  weeklyStats: [
    { day: 'Ma', steps: 9500 },
    { day: 'Di', steps: 7200 },
    { day: 'Wo', steps: 11800 },
    { day: 'Do', steps: 8900 },
    { day: 'Vr', steps: 10200 },
    { day: 'Za', steps: 6400 },
    { day: 'Zo', steps: 8420 }
  ]
};

const mockHighPerformanceData = {
  steps: {
    value: 12750,
    goal: 10000
  },
  calories: {
    value: 2890,
    goal: 2200
  },
  activeMinutes: {
    value: 85,
    goal: 60
  },
  heartRate: {
    value: 68,
    min: 62,
    max: 88
  },
  weeklyStats: [
    { day: 'Ma', steps: 12500 },
    { day: 'Di', steps: 11200 },
    { day: 'Wo', steps: 13800 },
    { day: 'Do', steps: 10900 },
    { day: 'Vr', steps: 14200 },
    { day: 'Za', steps: 9400 },
    { day: 'Zo', steps: 12750 }
  ]
};

const mockLowActivityData = {
  steps: {
    value: 3420,
    goal: 10000
  },
  calories: {
    value: 1250,
    goal: 2200
  },
  activeMinutes: {
    value: 15,
    goal: 60
  },
  heartRate: {
    value: 78,
    min: 70,
    max: 102
  },
  weeklyStats: [
    { day: 'Ma', steps: 4500 },
    { day: 'Di', steps: 2200 },
    { day: 'Wo', steps: 5800 },
    { day: 'Do', steps: 3900 },
    { day: 'Vr', steps: 4200 },
    { day: 'Za', steps: 2400 },
    { day: 'Zo', steps: 3420 }
  ]
};

const mockNoHeartRateData = {
  ...mockFitnessData,
  heartRate: {
    value: 0,
    min: 0,
    max: 0
  }
};

const meta: Meta<typeof FitnessWidget> = {
  title: 'Dashboard/Widgets/FitnessWidget',
  component: FitnessWidget,
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
  const originalFetch = window.fetch;
  window.fetch = async (url: RequestInfo | URL, options?: RequestInit) => {
    if (typeof url === 'string' && url.includes('/api/fitness')) {
      // Get the story context to determine which data to return
      const storyContext = (window as { __STORYBOOK_STORY_CONTEXT__?: { name?: string } }).__STORYBOOK_STORY_CONTEXT__;

      let dataToReturn = mockFitnessData;

      if (storyContext?.name === 'High Performance') {
        dataToReturn = mockHighPerformanceData;
      } else if (storyContext?.name === 'Low Activity') {
        dataToReturn = mockLowActivityData;
      } else if (storyContext?.name === 'No Heart Rate') {
        dataToReturn = mockNoHeartRateData;
      } else if (storyContext?.name === 'Error State') {
        return Promise.resolve({
          ok: false,
          json: async () => ({ message: 'Failed to connect to Google Fit' }),
          status: 401,
          statusText: 'Unauthorized'
        } as Response);
      } else if (storyContext?.name === 'Loading') {
        return new Promise(() => {}); // Never resolve to show loading state
      }

      return Promise.resolve({
        ok: true,
        json: async () => dataToReturn,
        status: 200,
        statusText: 'OK'
      } as Response);
    }
    return originalFetch(url, options);
  };
}

export const Default: Story = {};

export const Loading: Story = {};

export const HighPerformance: Story = {};

export const LowActivity: Story = {};

export const NoHeartRate: Story = {};

export const ErrorState: Story = {};