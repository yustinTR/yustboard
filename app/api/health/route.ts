import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';

export const dynamic = 'force-dynamic';

/**
 * Health check endpoint for monitoring
 *
 * Checks:
 * - API is responding
 * - Database connection is working
 * - Prisma is configured correctly
 *
 * Used by:
 * - Vercel monitoring
 * - Uptime monitors (UptimeRobot, etc.)
 * - Load balancers
 * - CI/CD pipelines
 */
export async function GET() {
  const startTime = Date.now();

  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    const responseTime = Date.now() - startTime;

    return NextResponse.json(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        checks: {
          api: 'ok',
          database: 'ok',
          prisma: 'ok',
        },
        performance: {
          responseTime: `${responseTime}ms`,
        },
        version: process.env.VERCEL_GIT_COMMIT_SHA || 'development',
        environment: process.env.NODE_ENV || 'development',
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
        },
      }
    );
  } catch (error) {
    const responseTime = Date.now() - startTime;

    console.error('Health check failed:', error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        checks: {
          api: 'ok',
          database: 'error',
          prisma: error instanceof Error ? 'error' : 'unknown',
        },
        performance: {
          responseTime: `${responseTime}ms`,
        },
        error: error instanceof Error ? error.message : 'Unknown error',
        version: process.env.VERCEL_GIT_COMMIT_SHA || 'development',
        environment: process.env.NODE_ENV || 'development',
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
        },
      }
    );
  }
}
