'use client';

import { useEffect, useState } from 'react';
import { FiArrowUp, FiArrowDown, FiRefreshCw } from 'react-icons/fi';
import { format } from 'date-fns';
import { useSession } from 'next-auth/react';
import { Transaction } from '@/utils/gmail-transactions';

interface BankingWidgetProps {
  initialTransactions?: Transaction[];
  initialBalance?: number;
}

export default function BankingWidget({ initialTransactions = [], initialBalance = 0 }: BankingWidgetProps) {
  const { data: session } = useSession();
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [balance, setBalance] = useState<number>(initialBalance);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTransactions = async () => {
    if (!session?.accessToken) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/banking/transactions?days=30&statsOnly=false');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch transactions: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setTransactions(data.transactions || []);
      setBalance(data.stats?.balance || 0);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Failed to load transactions');
      
      // If we have initial data, use it as fallback
      if (initialTransactions.length > 0) {
        setTransactions(initialTransactions);
        setBalance(initialBalance);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.accessToken) {
      fetchTransactions();
    }
  }, [session]);

  // Sort and limit transactions for display
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 bg-green-500 text-white flex justify-between items-center">
        <h3 className="font-medium">Banking</h3>
        <button 
          onClick={fetchTransactions} 
          disabled={isLoading}
          className="text-white hover:text-gray-200 dark:hover:text-gray-300 disabled:opacity-50 cursor-pointer"
          aria-label="Refresh transactions"
        >
          <FiRefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      <div className="p-4">
        <div className="mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Current Balance</p>
          <p className="text-2xl font-bold">${balance.toFixed(2)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Based on Gmail transaction analysis</p>
        </div>
        
        {error && (
          <div className="mb-4 p-2 bg-red-50 text-red-600 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <div>
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Recent Transactions</h4>
          {isLoading ? (
            <div className="py-4 flex justify-center">
              <FiRefreshCw className="animate-spin text-green-500" />
            </div>
          ) : recentTransactions.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-2">No recent transactions found</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {recentTransactions.map((transaction) => (
                <li key={transaction.id} className="py-2 flex justify-between items-center">
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="font-medium truncate">{transaction.description}</p>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <span className="truncate">{transaction.merchant}</span>
                      <span className="mx-1">•</span>
                      <span>{format(new Date(transaction.date), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                  <div className={`flex items-center whitespace-nowrap ${transaction.amount < 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {transaction.amount < 0 ? <FiArrowDown className="mr-1" /> : <FiArrowUp className="mr-1" />}
                    <span className="font-medium">{transaction.currency === 'USD' ? '$' : transaction.currency}{Math.abs(transaction.amount).toFixed(2)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="p-3 bg-gray-50 dark:bg-gray-800 text-center">
        <a href="/dashboard/banking" className="text-green-500 hover:text-green-600 text-sm font-medium">
          View all transactions
        </a>
      </div>
    </div>
  );
}