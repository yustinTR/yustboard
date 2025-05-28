'use client';

import { useState, useEffect } from 'react';
import { FiFilter, FiArrowUp, FiArrowDown, FiRefreshCw } from 'react-icons/fi';
import { format } from 'date-fns';
import { useSession } from 'next-auth/react';
import { Transaction } from '@/utils/gmail-transactions';

// Mock accounts (would come from API in real app)
const accounts = [
  { id: '1', name: 'Detected Account', balance: 0, number: 'Gmail Analysis' },
];

export default function BankingPage() {
  const { data: session } = useSession();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState({
    balance: 0,
    totalIncome: 0,
    totalExpenses: 0,
    categories: [] as { name: string; amount: number }[]
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [daysBack, setDaysBack] = useState(30);

  // Fetch transactions from API
  const fetchTransactions = async () => {
    if (!session?.accessToken) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/banking/transactions?days=${daysBack}&statsOnly=false`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch transactions: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setTransactions(data.transactions || []);
      setStats({
        balance: data.stats?.balance || 0,
        totalIncome: data.stats?.totalIncome || 0,
        totalExpenses: Math.abs(data.stats?.totalExpenses || 0),
        categories: data.stats?.categories || []
      });
      
      // Update mock account balance
      accounts[0].balance = data.stats?.balance || 0;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Failed to load transactions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.accessToken) {
      fetchTransactions();
    }
  }, [session, daysBack]);

  // Filter transactions by category if a filter is selected
  const filteredTransactions = filterCategory
    ? transactions.filter(t => t.category === filterCategory)
    : transactions;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Banking</h1>
        <div className="flex space-x-3">
          <div className="relative">
            <select
              className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md appearance-none pr-10 pl-8"
              value={daysBack.toString()}
              onChange={(e) => setDaysBack(Number(e.target.value))}
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="180">Last 6 months</option>
              <option value="365">Last year</option>
            </select>
            <FiFilter className="absolute left-2 top-1/2 transform -translate-y-1/2" />
          </div>
          <button 
            onClick={fetchTransactions}
            disabled={isLoading}
            className="bg-green-500 text-white hover:bg-green-600 px-4 py-2 rounded-md flex items-center disabled:opacity-50"
          >
            <FiRefreshCw className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
          <p className="text-sm mt-1">This feature analyzes your Gmail for transaction data. Make sure you&apos;ve granted the necessary permissions.</p>
        </div>
      )}

      {/* Account Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-sm text-gray-500 mb-2">Total Balance</h2>
          {isLoading ? (
            <div className="flex items-center h-10">
              <FiRefreshCw className="animate-spin text-green-500" />
            </div>
          ) : (
            <>
              <p className="text-3xl font-bold">${stats.balance.toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-2">Based on Gmail analysis</p>
            </>
          )}
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-sm text-gray-500 mb-2">Income</h2>
          {isLoading ? (
            <div className="flex items-center h-10">
              <FiRefreshCw className="animate-spin text-green-500" />
            </div>
          ) : (
            <>
              <div className="flex items-center">
                <FiArrowUp className="text-green-500 mr-2" />
                <p className="text-3xl font-bold text-green-500">${stats.totalIncome.toFixed(2)}</p>
              </div>
              <p className="text-sm text-gray-500 mt-2">Last {daysBack} days</p>
            </>
          )}
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-sm text-gray-500 mb-2">Expenses</h2>
          {isLoading ? (
            <div className="flex items-center h-10">
              <FiRefreshCw className="animate-spin text-green-500" />
            </div>
          ) : (
            <>
              <div className="flex items-center">
                <FiArrowDown className="text-red-500 mr-2" />
                <p className="text-3xl font-bold text-red-500">${stats.totalExpenses.toFixed(2)}</p>
              </div>
              <p className="text-sm text-gray-500 mt-2">Last {daysBack} days</p>
            </>
          )}
        </div>
      </div>

      {/* Categories and Accounts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Categories List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Spending by Category</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {isLoading ? (
              <div className="p-8 flex justify-center">
                <FiRefreshCw className="animate-spin text-green-500" />
              </div>
            ) : stats.categories.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No category data available.</p>
            ) : (
              <div className="divide-y divide-gray-200">
                {stats.categories.slice(0, 6).map((category, index) => (
                  <div 
                    key={index} 
                    className="p-4 hover:bg-gray-50 flex justify-between items-center cursor-pointer"
                    onClick={() => setFilterCategory(category.name === filterCategory ? null : category.name)}
                  >
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        filterCategory === category.name ? 'bg-green-500' : 'bg-gray-300'
                      }`}></div>
                      <p className="font-medium">{category.name}</p>
                    </div>
                    <p className="font-bold">${category.amount.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Accounts List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Accounts</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {accounts.map((account) => (
              <div key={account.id} className="p-4 hover:bg-gray-50 flex justify-between items-center">
                <div>
                  <p className="font-medium">{account.name}</p>
                  <p className="text-sm text-gray-500">{account.number}</p>
                </div>
                {isLoading ? (
                  <FiRefreshCw className="animate-spin text-green-500" />
                ) : (
                  <p className="font-bold">${account.balance.toFixed(2)}</p>
                )}
              </div>
            ))}
            <div className="p-4 text-center text-sm text-gray-500">
              Account data is analyzed from your Gmail
            </div>
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {filterCategory ? `Transactions: ${filterCategory}` : 'Recent Transactions'}
          </h2>
          {filterCategory && (
            <button 
              onClick={() => setFilterCategory(null)}
              className="text-sm text-green-600 hover:text-green-800"
            >
              Clear filter
            </button>
          )}
        </div>
        <div>
          {isLoading ? (
            <div className="py-16 flex justify-center">
              <FiRefreshCw className="animate-spin text-green-500 w-8 h-8" />
            </div>
          ) : filteredTransactions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No transactions found.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <li key={transaction.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full mr-4 ${
                        transaction.amount < 0 ? 'bg-red-100 text-red-500' : 'bg-green-100 text-green-500'
                      }`}>
                        {transaction.amount < 0 ? <FiArrowDown /> : <FiArrowUp />}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <div className="flex text-sm text-gray-500">
                          <span>{transaction.merchant}</span>
                          <span className="mx-1">•</span>
                          <span>{transaction.category}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${
                        transaction.amount < 0 ? 'text-red-500' : 'text-green-500'
                      }`}>
                        {transaction.amount < 0 ? '-' : '+'}
                        {transaction.currency === 'USD' ? '$' : transaction.currency}
                        {Math.abs(transaction.amount).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">{format(new Date(transaction.date), 'MMM dd, yyyy')}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}