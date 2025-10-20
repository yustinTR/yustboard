import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/server';
import { stripe, PLAN_CONFIG, isValidPlan } from '@/lib/stripe/config';
import prisma from '@/lib/database/prisma';

// POST - Create Stripe Checkout Session
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan } = await request.json();

    if (!isValidPlan(plan) || plan === 'FREE') {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
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

    // Only OWNER can manage billing
    if (user.organizationRole !== 'OWNER') {
      return NextResponse.json({ error: 'Only organization owners can manage billing' }, { status: 403 });
    }

    const organization = user.organization;
    const planConfig = PLAN_CONFIG[plan];

    if (!planConfig.priceId) {
      return NextResponse.json({ error: 'Price ID not configured for this plan' }, { status: 400 });
    }

    // Create or get Stripe customer
    let customerId = organization.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        name: organization.name,
        metadata: {
          organizationId: organization.id,
        },
      });

      customerId = customer.id;

      // Save customer ID
      await prisma.organization.update({
        where: { id: organization.id },
        data: {
          stripeCustomerId: customerId,
        },
      });
    }

    // Create Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card', 'ideal'], // Common Dutch payment methods
      line_items: [
        {
          price: planConfig.priceId,
          quantity: 1,
        },
      ],
      success_url: `${request.nextUrl.origin}/dashboard/settings?tab=billing&success=true`,
      cancel_url: `${request.nextUrl.origin}/dashboard/settings?tab=billing&canceled=true`,
      metadata: {
        organizationId: organization.id,
        plan: plan,
      },
      subscription_data: {
        metadata: {
          organizationId: organization.id,
          plan: plan,
        },
        trial_period_days: organization.trialEndsAt ? undefined : 14, // 14 day trial if no previous trial
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
