import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/auth/auth";
import { fetchTransactionsFromGmail, getTransactionStats } from '@/utils/google/gmail-transactions';

export async function GET(request: Request) {
  try {
    // Get the user's session
    const session = await getServerSession(authOptions);
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized - No access token available' },
        { status: 401 }
      );
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
      return NextResponse.json({ stats });
    }
    
    // Otherwise, return both transactions and stats
    const stats = getTransactionStats(transactions);
    return NextResponse.json({ transactions, stats });
  } catch (error) {
    console.error('Error in banking transactions API route:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}