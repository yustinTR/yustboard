import type { Meta, StoryObj } from '@storybook/nextjs';
import { SessionProvider } from 'next-auth/react';
import BankingWidget from './BankingWidget';
import type { Transaction } from '@/utils/google/gmail-transactions';

// Mock transaction data for Storybook
const mockTransactions: Transaction[] = [
  {
    id: 'txn1',
    amount: -23.50,
    description: 'Grocery Store Purchase',
    merchant: 'Albert Heijn',
    date: new Date(Date.now() - 86400000), // 1 day ago
    currency: 'EUR',
    category: 'Food & Dining',
    status: 'completed' as const,
    type: 'expense' as const,
    source: 'email' as const,
    sourceDetails: {
      emailId: 'email1',
      from: 'noreply@albertheijn.nl',
      subject: 'Transaction Receipt',
      timestamp: new Date(Date.now() - 86400000)
    }
  },
  {
    id: 'txn2',
    amount: -45.00,
    description: 'Gas Station Payment',
    merchant: 'Shell',
    date: new Date(Date.now() - 86400000 * 2), // 2 days ago
    currency: 'EUR',
    category: 'Transportation',
    status: 'completed' as const,
    type: 'expense' as const,
    source: 'email' as const,
    sourceDetails: {
      emailId: 'email2',
      from: 'noreply@shell.com',
      subject: 'Payment Receipt',
      timestamp: new Date(Date.now() - 86400000 * 2)
    }
  },
  {
    id: 'txn3',
    amount: 2500.00,
    description: 'Salary Deposit',
    merchant: 'ACME Corp',
    date: new Date(Date.now() - 86400000 * 3), // 3 days ago
    currency: 'EUR',
    category: 'Income',
    status: 'completed' as const,
    type: 'income' as const,
    source: 'email' as const,
    sourceDetails: {
      emailId: 'email3',
      from: 'payroll@acmecorp.com',
      subject: 'Salary Payment',
      timestamp: new Date(Date.now() - 86400000 * 3)
    }
  },
  {
    id: 'txn4',
    amount: -12.99,
    description: 'Netflix Subscription',
    merchant: 'Netflix',
    date: new Date(Date.now() - 86400000 * 5), // 5 days ago
    currency: 'EUR',
    category: 'Entertainment',
    status: 'completed' as const,
    type: 'expense' as const,
    source: 'email' as const,
    sourceDetails: {
      emailId: 'email4',
      from: 'info@netflix.com',
      subject: 'Netflix Subscription Receipt',
      timestamp: new Date(Date.now() - 86400000 * 5)
    }
  },
  {
    id: 'txn5',
    amount: -89.99,
    description: 'Online Shopping',
    merchant: 'Amazon',
    date: new Date(Date.now() - 86400000 * 7), // 1 week ago
    currency: 'EUR',
    category: 'Shopping',
    status: 'completed' as const,
    type: 'expense' as const,
    source: 'email' as const,
    sourceDetails: {
      emailId: 'email5',
      from: 'auto-confirm@amazon.com',
      subject: 'Your Amazon order',
      timestamp: new Date(Date.now() - 86400000 * 7)
    }
  }
];

const mockSession = {
  user: {
    id: 'user123',
    name: 'Test User',
    email: 'test@example.com',
    image: null,
    role: 'USER' as const
  },
  accessToken: 'mock-access-token',
  expires: '2024-12-31'
};

const meta: Meta<typeof BankingWidget> = {
  title: 'Dashboard/Widgets/BankingWidget',
  component: BankingWidget,
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
      <SessionProvider session={mockSession}>
        <div className="w-96 h-[600px]">
          <Story />
        </div>
      </SessionProvider>
    )
  ],
  argTypes: {
    initialTransactions: {
      description: 'Initial transactions to display in the widget',
      control: 'object'
    },
    initialBalance: {
      description: 'Initial account balance to display',
      control: { type: 'number' }
    }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    initialTransactions: mockTransactions,
    initialBalance: 1247.58
  }
};

export const HighBalance: Story = {
  args: {
    initialTransactions: mockTransactions,
    initialBalance: 15750.42
  }
};

export const LowBalance: Story = {
  args: {
    initialTransactions: mockTransactions.map(t => ({
      ...t,
      amount: Math.abs(t.amount) * -1, // Ensure all amounts are negative
      type: 'expense' as const
    })),
    initialBalance: 82.15
  }
};

export const EmptyTransactions: Story = {
  args: {
    initialTransactions: [],
    initialBalance: 500.00
  }
};

export const OnlyExpenses: Story = {
  args: {
    initialTransactions: mockTransactions.filter(t => t.amount < 0),
    initialBalance: 750.25
  }
};