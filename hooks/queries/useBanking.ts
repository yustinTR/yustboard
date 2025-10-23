import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/client';
import { Transaction } from '@/utils/google/gmail-transactions';

interface BankingStats {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactionCount: number;
}

interface BankingData {
  transactions: Transaction[];
  stats: BankingStats;
}

async function fetchBanking(params: { days?: number; max?: number; statsOnly?: boolean }): Promise<BankingData> {
  const searchParams = new URLSearchParams();
  if (params.days) searchParams.append('days', String(params.days));
  if (params.max) searchParams.append('max', String(params.max));
  if (params.statsOnly) searchParams.append('statsOnly', 'true');

  const response = await fetch(`/api/banking/transactions?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch banking data');
  }
  return response.json();
}

export function useBanking(params: { days?: number; max?: number; statsOnly?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.banking.transactions(params),
    queryFn: () => fetchBanking(params),
    staleTime: 5 * 60 * 1000, // 5 minutes (banking data changes slowly)
    gcTime: 15 * 60 * 1000, // Keep for 15 minutes
  });
}
