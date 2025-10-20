import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe/config';
import prisma from '@/lib/database/prisma';

// Disable body parsing, need raw body for webhook signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err) {
    console.error('⚠️  Webhook signature verification failed.', err);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  console.log('✅ Stripe webhook received:', event.type);

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  // Find organization by Stripe customer ID
  const organization = await prisma.organization.findUnique({
    where: { stripeCustomerId: customerId },
  });

  if (!organization) {
    console.error('Organization not found for customer:', customerId);
    return;
  }

  // Map Stripe subscription status to our status enum
  const statusMap: Record<string, string> = {
    active: 'ACTIVE',
    trialing: 'TRIALING',
    past_due: 'PAST_DUE',
    canceled: 'CANCELED',
    unpaid: 'UNPAID',
    incomplete: 'INCOMPLETE',
  };

  // Type assertion for Stripe subscription fields
  const sub = subscription as unknown as {
    id: string;
    status: string;
    current_period_end: number;
    cancel_at_period_end: boolean;
    items: { data: Array<{ price: { id: string } }> };
  };

  // Get plan from subscription metadata or price
  const priceId = sub.items.data[0]?.price.id;
  let plan = organization.plan; // Default to current plan

  // Map price ID to plan
  if (priceId === process.env.STRIPE_PRICE_STARTER) plan = 'STARTER';
  else if (priceId === process.env.STRIPE_PRICE_PRO) plan = 'PRO';
  else if (priceId === process.env.STRIPE_PRICE_ENTERPRISE) plan = 'ENTERPRISE';

  // Update organization
  await prisma.organization.update({
    where: { id: organization.id },
    data: {
      stripeSubscriptionId: sub.id,
      subscriptionStatus: statusMap[sub.status] as 'ACTIVE' | 'TRIALING' | 'PAST_DUE' | 'CANCELED' | 'UNPAID' | 'INCOMPLETE',
      plan: plan as 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE',
      currentPeriodEnd: new Date(sub.current_period_end * 1000),
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    },
  });

  console.log(`✅ Subscription updated for organization: ${organization.name}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  const organization = await prisma.organization.findUnique({
    where: { stripeCustomerId: customerId },
  });

  if (!organization) {
    console.error('Organization not found for customer:', customerId);
    return;
  }

  // Downgrade to FREE plan when subscription is deleted
  await prisma.organization.update({
    where: { id: organization.id },
    data: {
      plan: 'FREE',
      subscriptionStatus: 'CANCELED',
      stripeSubscriptionId: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    },
  });

  console.log(`✅ Subscription canceled, downgraded to FREE: ${organization.name}`);
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  const organization = await prisma.organization.findUnique({
    where: { stripeCustomerId: customerId },
  });

  if (!organization) {
    console.error('Organization not found for customer:', customerId);
    return;
  }

  // If subscription status is not active, update it
  if (organization.subscriptionStatus !== 'ACTIVE') {
    await prisma.organization.update({
      where: { id: organization.id },
      data: {
        subscriptionStatus: 'ACTIVE',
      },
    });
  }

  console.log(`✅ Payment succeeded for organization: ${organization.name}`);
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  const organization = await prisma.organization.findUnique({
    where: { stripeCustomerId: customerId },
  });

  if (!organization) {
    console.error('Organization not found for customer:', customerId);
    return;
  }

  // Mark subscription as past due
  await prisma.organization.update({
    where: { id: organization.id },
    data: {
      subscriptionStatus: 'PAST_DUE',
    },
  });

  console.log(`⚠️  Payment failed for organization: ${organization.name}`);
  // TODO: Send email notification to organization owner
}
