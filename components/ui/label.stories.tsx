import type { Meta, StoryObj } from '@storybook/react';
import { Label } from './label';

const meta = {
  title: 'UI/Label',
  component: Label,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Label',
  },
};

export const ForInput: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="email">Email</Label>
      <input
        type="email"
        id="email"
        placeholder="Email"
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
      />
    </div>
  ),
};

export const WithRequiredField: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="name">
        Name <span className="text-destructive">*</span>
      </Label>
      <input
        type="text"
        id="name"
        placeholder="Enter your name"
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        required
      />
    </div>
  ),
};

export const DisabledState: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="disabled">Disabled Field</Label>
      <input
        type="text"
        id="disabled"
        placeholder="Disabled input"
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
        disabled
      />
    </div>
  ),
};

export const WithHelperText: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="password">Password</Label>
      <input
        type="password"
        id="password"
        placeholder="Enter password"
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
      />
      <p className="text-sm text-muted-foreground">
        Must be at least 8 characters long
      </p>
    </div>
  ),
};

export const FormExample: Story = {
  render: () => (
    <form className="w-full max-w-sm space-y-4">
      <div className="grid gap-1.5">
        <Label htmlFor="username">Username</Label>
        <input
          type="text"
          id="username"
          placeholder="johndoe"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="email2">Email</Label>
        <input
          type="email"
          id="email2"
          placeholder="john@example.com"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="bio">Bio</Label>
        <textarea
          id="bio"
          placeholder="Tell us about yourself"
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
    </form>
  ),
};