import { getServerSession } from '@/lib/auth/server';
import { fetchTransactionsFromGmail, getTransactionStats } from '@/utils/google/gmail-transactions';
import { ApiResponse } from '@/lib/api/response-helpers';

export async function GET(request: Request) {
  try {
  // Get the user's session
  const session = await getServerSession();

  if (!session?.accessToken) {
    return ApiResponse.unauthorized('No access token available');
  }

  // Parse query parameters
  const { searchParams } = new URL(request.url);
  const daysBack = searchParams.get('days') ? parseInt(searchParams.get('days') as string, 10) : 30;
  const maxResults = searchParams.get('max') ? parseInt(searchParams.get('max') as string, 10) : 100;
  const statsOnly = searchParams.get('statsOnly') === 'true';
  const debug = searchParams.get('debug') === 'true';

  // Fetch transactions from Gmail
  const transactions = await fetchTransactionsFromGmail(
    session.accessToken,
    daysBack,
    maxResults,
    debug
  );

  // If statsOnly parameter is true, return only the stats
  if (statsOnly) {
    const stats = getTransactionStats(transactions);
    return ApiResponse.success({ stats });
  }

  // Otherwise, return both transactions and stats
  const stats = getTransactionStats(transactions);
  return ApiResponse.success({ transactions, stats });
  } catch (error) {
    if (error instanceof Error) {
      return ApiResponse.serverError(error.message);
    }
    return ApiResponse.serverError();
  }
}