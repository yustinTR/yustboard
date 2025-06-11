import type { Meta, StoryObj } from '@storybook/nextjs';
import { Switch } from './switch';
import { Label } from './label';
import React from 'react';

const meta = {
  title: 'UI/Switch',
  component: Switch,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Checked: Story = {
  args: {
    checked: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  args: {
    checked: true,
    disabled: true,
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Switch id="airplane-mode" />
      <Label htmlFor="airplane-mode">Airplane Mode</Label>
    </div>
  ),
};

export const Controlled: Story = {
  render: function ControlledSwitch() {
    const [checked, setChecked] = React.useState(false);

    return (
      <div className="flex flex-col items-center space-y-4">
        <div className="flex items-center space-x-2">
          <Switch id="controlled" checked={checked} onCheckedChange={setChecked} />
          <Label htmlFor="controlled">Enable notifications</Label>
        </div>
        <p className="text-sm text-muted-foreground">
          Notifications are {checked ? 'enabled' : 'disabled'}
        </p>
      </div>
    );
  },
};

export const FormExample: Story = {
  render: () => (
    <form className="w-80 space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="marketing" className="flex flex-col space-y-1">
              <span>Marketing emails</span>
              <span className="font-normal text-sm text-muted-foreground">
                Receive emails about new products and features
              </span>
            </Label>
            <Switch id="marketing" />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="security" className="flex flex-col space-y-1">
              <span>Security alerts</span>
              <span className="font-normal text-sm text-muted-foreground">
                Receive alerts about your account security
              </span>
            </Label>
            <Switch id="security" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="updates" className="flex flex-col space-y-1">
              <span>Automatic updates</span>
              <span className="font-normal text-sm text-muted-foreground">
                Keep your app up to date automatically
              </span>
            </Label>
            <Switch id="updates" defaultChecked />
          </div>
        </div>
      </div>
    </form>
  ),
};

export const MultipleStates: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch id="s1" />
        <Label htmlFor="s1">Default unchecked</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="s2" defaultChecked />
        <Label htmlFor="s2">Default checked</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="s3" disabled />
        <Label htmlFor="s3" className="opacity-50">Disabled unchecked</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="s4" disabled defaultChecked />
        <Label htmlFor="s4" className="opacity-50">Disabled checked</Label>
      </div>
    </div>
  ),
};