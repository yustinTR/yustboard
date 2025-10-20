'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { FiArrowUp, FiArrowDown, FiRefreshCw } from 'react-icons/fi';
import { format } from 'date-fns';
import { useSession } from 'next-auth/react';
import { Transaction } from '@/utils/google/gmail-transactions';

interface BankingWidgetProps {
  initialTransactions?: Transaction[];
  initialBalance?: number;
}

const BankingWidget = React.memo(function BankingWidget({ initialTransactions = [], initialBalance = 0 }: BankingWidgetProps) {
  const { data: session } = useSession();
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [balance, setBalance] = useState<number>(initialBalance);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const hasFetchedRef = useRef(false);

  const fetchTransactions = useCallback(async () => {
    if (!session?.accessToken) return;

    setIsLoading(true);
    setError('');
    hasFetchedRef.current = true;
    
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
  }, [session?.accessToken, initialTransactions, initialBalance]);

  useEffect(() => {
    if (session?.accessToken && transactions.length === 0 && !isLoading && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchTransactions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken]); // Only depend on accessToken to prevent infinite loops

  // Sort and limit transactions for display
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="h-full backdrop-blur-xl bg-white/15 dark:bg-gray-900/15 border border-white/25 dark:border-gray-700/25 rounded-3xl shadow-2xl shadow-black/20 overflow-hidden flex flex-col">
      {/* Header with emerald gradient for banking */}
      <div className="px-6 py-4 bg-gradient-to-r from-emerald-500/90 to-green-500/90 backdrop-blur-sm text-white flex justify-between items-center">
        <h3 className="text-lg font-medium tracking-wide flex items-center gap-2">
          <FiArrowUp className="h-5 w-5" />
          Banking
        </h3>
        <button
          onClick={fetchTransactions}
          disabled={isLoading}
          className="text-white/90 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all duration-300 disabled:opacity-50 cursor-pointer hover:scale-105"
          aria-label="Refresh transactions"
        >
          <FiRefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 px-6 py-4 bg-white/5 dark:bg-gray-900/5 backdrop-blur-sm space-y-6">
        {/* Balance Card */}
        <div className="bg-white/20 dark:bg-gray-800/20 rounded-2xl p-4 backdrop-blur-sm border border-white/30 dark:border-gray-600/30">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Current Balance</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            ${balance.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Based on Gmail transaction analysis
          </p>
        </div>

        {error && (
          <div className="bg-red-500/15 border border-red-400/30 text-red-600 dark:text-red-400 p-4 rounded-2xl backdrop-blur-sm">
            {error}
          </div>
        )}

        {/* Recent Transactions */}
        <div>
          <h4 className="text-sm font-semibold mb-3 text-gray-900 dark:text-gray-100">
            Recent Transactions
          </h4>
          {isLoading ? (
            <div className="py-8 flex justify-center items-center">
              <FiRefreshCw className="animate-spin h-6 w-6 text-emerald-500 mr-3" />
              <span className="text-gray-600 dark:text-gray-400 text-sm">Loading transactions...</span>
            </div>
          ) : recentTransactions.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8 text-sm">No recent transactions found</p>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="bg-white/20 dark:bg-gray-800/20 rounded-2xl p-4 backdrop-blur-sm border border-white/30 dark:border-gray-600/30 hover:bg-white/30 dark:hover:bg-gray-700/30 transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className="flex justify-between items-start">
                    <div className="min-w-0 flex-1 pr-3">
                      <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-1 leading-snug">
                        {transaction.description}
                      </p>
                      <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                        <span className="truncate">{transaction.merchant}</span>
                        <span className="mx-2">•</span>
                        <span>{format(new Date(transaction.date), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                    <div className={`flex items-center whitespace-nowrap font-semibold ${transaction.amount < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                      {transaction.amount < 0 ? <FiArrowDown className="mr-1 h-4 w-4" /> : <FiArrowUp className="mr-1 h-4 w-4" />}
                      <span>{transaction.currency === 'USD' ? '$' : transaction.currency}{Math.abs(transaction.amount).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer with Material button */}
      <div className="px-6 py-4 bg-white/10 dark:bg-gray-800/15 backdrop-blur-sm border-t border-white/20 dark:border-gray-600/20">
        <a
          href="/dashboard/banking"
          className="block w-full text-center bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 text-sm font-medium py-3 px-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] border border-emerald-400/30 backdrop-blur-sm"
        >
          View all transactions
        </a>
      </div>
    </div>
  );
});

export default BankingWidget;