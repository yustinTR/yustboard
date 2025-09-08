import type { Meta, StoryObj } from '@storybook/nextjs';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './card';
import { Label } from '@/components/atoms/label';
import { Button } from '@/components/atoms/button';

const meta = {
  title: 'UI/Tabs',
  component: Tabs,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="account" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Make changes to your account here. Click save when you&apos;re done.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="name">Name</Label>
              <input id="name" defaultValue="John Doe" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="username">Username</Label>
              <input id="username" defaultValue="@johndoe" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="password">
        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>
              Change your password here. After saving, you&apos;ll be logged out.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="current">Current password</Label>
              <input id="current" type="password" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="new">New password</Label>
              <input id="new" type="password" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  ),
};

export const WithThreeTabs: Story = {
  render: () => (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="space-y-4">
        <h3 className="text-lg font-medium">Overview</h3>
        <p className="text-sm text-muted-foreground">
          Welcome to your dashboard. Here&apos;s a quick overview of your account.
        </p>
      </TabsContent>
      <TabsContent value="analytics" className="space-y-4">
        <h3 className="text-lg font-medium">Analytics</h3>
        <p className="text-sm text-muted-foreground">
          View detailed analytics and insights about your performance.
        </p>
      </TabsContent>
      <TabsContent value="reports" className="space-y-4">
        <h3 className="text-lg font-medium">Reports</h3>
        <p className="text-sm text-muted-foreground">
          Generate and download comprehensive reports for your records.
        </p>
      </TabsContent>
    </Tabs>
  ),
};

export const DisabledTab: Story = {
  render: () => (
    <Tabs defaultValue="general" className="w-full">
      <TabsList>
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="advanced" disabled>Advanced</TabsTrigger>
      </TabsList>
      <TabsContent value="general">
        <p>General settings content</p>
      </TabsContent>
      <TabsContent value="security">
        <p>Security settings content</p>
      </TabsContent>
      <TabsContent value="advanced">
        <p>Advanced settings content (This tab is disabled)</p>
      </TabsContent>
    </Tabs>
  ),
};

export const SettingsExample: Story = {
  render: () => (
    <Tabs defaultValue="profile" className="w-full max-w-3xl">
      <TabsList>
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="privacy">Privacy</TabsTrigger>
        <TabsTrigger value="billing">Billing</TabsTrigger>
      </TabsList>
      <TabsContent value="profile" className="mt-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Profile Information</h3>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="fullname">Full Name</Label>
              <input id="fullname" placeholder="Enter your full name" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <input id="email" type="email" placeholder="Enter your email" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <Button className="w-fit">Save Changes</Button>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="notifications" className="mt-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Notification Preferences</h3>
          <p className="text-sm text-muted-foreground">
            Choose how you want to be notified about updates and activities.
          </p>
        </div>
      </TabsContent>
      <TabsContent value="privacy" className="mt-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Privacy Settings</h3>
          <p className="text-sm text-muted-foreground">
            Manage your privacy preferences and data sharing options.
          </p>
        </div>
      </TabsContent>
      <TabsContent value="billing" className="mt-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Billing Information</h3>
          <p className="text-sm text-muted-foreground">
            Manage your subscription and payment methods.
          </p>
        </div>
      </TabsContent>
    </Tabs>
  ),
};