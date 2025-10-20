import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/server';
import { stripe, PLAN_CONFIG } from '@/lib/stripe/config';
import prisma from '@/lib/database/prisma';

// GET - Get billing status for current organization
export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        organization: true,
      },
    });

    if (!user?.organizationId || !user.organization) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 });
    }

    const organization = user.organization;
    const planConfig = PLAN_CONFIG[organization.plan];

    // Get usage info
    const userCount = await prisma.organizationMembership.count({
      where: { organizationId: organization.id },
    });

    const widgetCount = await prisma.userWidgetPreference.count({
      where: {
        organizationId: organization.id,
        enabled: true,
      },
    });

    // Get subscription details from Stripe if exists
    let subscriptionDetails: {
      id: string;
      status: string;
      currentPeriodEnd: number;
      cancelAtPeriodEnd: boolean;
      canceledAt: number | null;
    } | null = null;

    if (organization.stripeSubscriptionId) {
      try {
        const subscription = await stripe.subscriptions.retrieve(organization.stripeSubscriptionId);
        // Type assertion for Stripe API response
        const sub = subscription as unknown as {
          id: string;
          status: string;
          current_period_end: number;
          cancel_at_period_end: boolean;
          canceled_at: number | null;
        };

        subscriptionDetails = {
          id: sub.id,
          status: sub.status,
          currentPeriodEnd: sub.current_period_end,
          cancelAtPeriodEnd: sub.cancel_at_period_end,
          canceledAt: sub.canceled_at,
        };
      } catch (error) {
        console.error('Error fetching subscription from Stripe:', error);
      }
    }

    return NextResponse.json({
      organization: {
        id: organization.id,
        name: organization.name,
        plan: organization.plan,
        subscriptionStatus: organization.subscriptionStatus,
        currentPeriodEnd: organization.currentPeriodEnd,
        cancelAtPeriodEnd: organization.cancelAtPeriodEnd,
        trialEndsAt: organization.trialEndsAt,
      },
      planConfig: {
        name: planConfig.name,
        price: planConfig.price,
        currency: planConfig.currency,
        features: planConfig.features,
      },
      usage: {
        users: {
          current: userCount,
          limit: planConfig.features.maxUsers,
        },
        widgets: {
          current: widgetCount,
          limit: planConfig.features.maxWidgets,
        },
      },
      subscription: subscriptionDetails,
      canManageBilling: user.organizationRole === 'OWNER',
    });
  } catch (error) {
    console.error('Error fetching billing status:', error);
    return NextResponse.json({ error: 'Failed to fetch billing status' }, { status: 500 });
  }
}
