import type { Meta, StoryObj } from '@storybook/nextjs';
import { Progress } from './progress';
import React from 'react';

const meta = {
  title: 'UI/Progress',
  component: Progress,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
    },
  },
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 50,
  },
};

export const Empty: Story = {
  args: {
    value: 0,
  },
};

export const Complete: Story = {
  args: {
    value: 100,
  },
};

export const InProgress: Story = {
  args: {
    value: 33,
  },
};

export const CustomSize: Story = {
  render: () => (
    <div className="space-y-4 w-full">
      <div>
        <p className="text-sm text-muted-foreground mb-2">Default (h-1)</p>
        <Progress value={60} />
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-2">Medium (h-2)</p>
        <Progress value={60} className="h-2" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-2">Large (h-3)</p>
        <Progress value={60} className="h-3" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-2">Extra Large (h-4)</p>
        <Progress value={60} className="h-4" />
      </div>
    </div>
  ),
};

export const Animated: Story = {
  render: function AnimatedProgress() {
    const [progress, setProgress] = React.useState(0);

    React.useEffect(() => {
      const timer = setTimeout(() => setProgress(80), 500);
      return () => clearTimeout(timer);
    }, []);

    return (
      <div className="w-full">
        <Progress value={progress} />
        <p className="text-sm text-muted-foreground mt-2">{progress}% complete</p>
      </div>
    );
  },
};

export const LoadingSimulation: Story = {
  render: function LoadingProgress() {
    const [progress, setProgress] = React.useState(0);

    React.useEffect(() => {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 500);

      return () => clearInterval(interval);
    }, []);

    return (
      <div className="w-full space-y-2">
        <div className="flex justify-between text-sm">
          <span>Loading...</span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} />
      </div>
    );
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="space-y-4 w-full">
      <div>
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium">Download Progress</span>
          <span className="text-sm text-muted-foreground">45%</span>
        </div>
        <Progress value={45} />
      </div>
      <div>
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium">Upload Progress</span>
          <span className="text-sm text-muted-foreground">75%</span>
        </div>
        <Progress value={75} />
      </div>
      <div>
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium">Processing</span>
          <span className="text-sm text-muted-foreground">20%</span>
        </div>
        <Progress value={20} />
      </div>
    </div>
  ),
};