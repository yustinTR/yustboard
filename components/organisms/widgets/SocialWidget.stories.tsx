import type { Meta, StoryObj } from '@storybook/nextjs';
import SocialWidget from './SocialWidget';

const meta: Meta<typeof SocialWidget> = {
  title: 'Dashboard/Widgets/SocialWidget',
  component: SocialWidget,
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

export const Default: Story = {};

export const ComingSoon: Story = {};