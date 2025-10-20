import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/server';
import { stripe } from '@/lib/stripe/config';
import prisma from '@/lib/database/prisma';

// POST - Create Customer Portal Session
export async function POST(request: NextRequest) {
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

    // Only OWNER can manage billing
    if (user.organizationRole !== 'OWNER') {
      return NextResponse.json({ error: 'Only organization owners can manage billing' }, { status: 403 });
    }

    const organization = user.organization;

    if (!organization.stripeCustomerId) {
      return NextResponse.json({ error: 'No Stripe customer found' }, { status: 400 });
    }

    // Create portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: organization.stripeCustomerId,
      return_url: `${request.nextUrl.origin}/dashboard/settings?tab=billing`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    return NextResponse.json({ error: 'Failed to create portal session' }, { status: 500 });
  }
}
