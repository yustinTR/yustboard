# 🚀 YustBoard SaaS Transformation Roadmap

## 🎯 **Vision: From Personal Dashboard to SaaS Tool**

Transform YustBoard from a personal dashboard into a multi-tenant SaaS platform that enables teams and organizations to create and manage their custom dashboards.

---

## 🏗️ **Technical Architecture Aanpassingen**

### **1. Multi-Tenant Database Design**
```sql
-- Nieuwe tabellen toevoegen aan je Prisma schema
model Organization {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  plan        Plan     @default(FREE)
  stripeId    String?
  users       User[]
  widgets     Widget[]
  settings    OrgSettings?
  createdAt   DateTime @default(now())
}

model User {
  // Bestaande fields...
  organizationId String?
  organization   Organization? @relation(fields: [organizationId], references: [id])
  role          UserRole      @default(MEMBER)
}

enum Plan {
  FREE
  STARTER
  PRO
  ENTERPRISE
}

enum UserRole {
  OWNER
  ADMIN
  MEMBER
  VIEWER
}
```

### **2. API Aanpassingen voor Tenancy**
```typescript
// Middleware voor tenant isolation
export async function tenantMiddleware(req: NextRequest) {
  const subdomain = req.headers.get('host')?.split('.')[0]
  const orgSlug = subdomain === 'app' ?
    req.nextUrl.searchParams.get('org') : subdomain

  // Inject organization context
  req.headers.set('x-organization-slug', orgSlug || '')
}

// Updated API calls with org context
async function getWidgets(orgId: string) {
  return prisma.widget.findMany({
    where: { organizationId: orgId }
  })
}
```

---

## 💰 **Business Model & Pricing**

### **Freemium Model (Aanbevolen)**
```typescript
const PLANS = {
  FREE: {
    price: 0,
    widgets: 3,
    users: 1,
    dataRetention: 30, // days
    features: ['basic-widgets', 'personal-dashboard']
  },

  STARTER: {
    price: 9, // per month
    widgets: 10,
    users: 3,
    dataRetention: 90,
    features: ['all-widgets', 'team-sharing', 'custom-themes']
  },

  PRO: {
    price: 29,
    widgets: 'unlimited',
    users: 10,
    dataRetention: 365,
    features: ['api-access', 'custom-integrations', 'advanced-analytics']
  },

  ENTERPRISE: {
    price: 99,
    widgets: 'unlimited',
    users: 'unlimited',
    dataRetention: 'unlimited',
    features: ['sso', 'white-label', 'dedicated-support', 'on-premise']
  }
}
```

---

## 🎯 **Roadmap naar SaaS**

### **Phase 1: Multi-User Foundation (v2.0)**
```typescript
// 1. Onboarding Flow
- Account creation met organization setup
- Team invites systeem
- Role-based permissions
- Billing integratie (Stripe)

// 2. Tenant Isolation
- Database queries gefilterd op organizationId
- URL structuur: app.yustboard.com/acme-corp
- Widget sharing binnen organizaties
```

### **Phase 2: Commercial Features (v2.1)**
```typescript
// 1. Subscription Management
- Plan upgrades/downgrades
- Usage tracking (API calls, storage)
- Feature flags per plan
- Payment processing

// 2. Admin Dashboard
- User management
- Usage analytics
- Billing overview
- Organization settings
```

### **Phase 3: Enterprise Ready (v2.2)**
```typescript
// 1. Advanced Security
- Single Sign-On (SSO)
- Two-factor authentication
- Audit logging
- Data encryption at rest

// 2. Customization
- White-label branding
- Custom domains
- API webhooks
- Advanced integrations
```

---

## 🔧 **Implementatie Prioriteiten**

### **Week 1-2: Database Restructure**
```bash
# 1. Prisma schema updates
npx prisma generate
npx prisma db push

# 2. Data migration scripts
node scripts/migrate-to-multi-tenant.js

# 3. API middleware updates
# Update alle API routes met organization context
```

### **Week 3-4: Authentication & Onboarding**
```typescript
// Organization creation tijdens signup
async function createOrganization(userData) {
  const org = await prisma.organization.create({
    data: {
      name: userData.companyName,
      slug: generateSlug(userData.companyName),
      plan: 'FREE',
      users: {
        create: {
          ...userData,
          role: 'OWNER'
        }
      }
    }
  })

  // Setup default widgets
  await setupDefaultWidgets(org.id)
}
```

### **Week 5-6: Billing Integration**
```typescript
// Stripe integration
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Subscription creation
async function createSubscription(orgId: string, planId: string) {
  const subscription = await stripe.subscriptions.create({
    customer: organization.stripeCustomerId,
    items: [{ price: PLAN_PRICE_IDS[planId] }],
    metadata: { organizationId: orgId }
  })
}
```

---

## 🎨 **UI/UX Aanpassingen**

### **1. New Landing Page**
```typescript
// Marketing site structuur
/
├── pricing
├── features
├── demo
├── about
├── contact
└── app (dashboard)
```

### **2. Onboarding Wizard**
```typescript
const OnboardingFlow = () => {
  const steps = [
    'Account Creation',
    'Organization Setup',
    'Team Invites',
    'Widget Selection',
    'Integration Setup'
  ]

  // Guided setup process
}
```

### **3. Organization Switcher**
```typescript
// Header component voor multi-org users
const OrgSwitcher = () => {
  const { organizations } = useUserOrganizations()

  return (
    <Select onValueChange={switchOrganization}>
      {organizations.map(org => (
        <SelectItem key={org.id} value={org.slug}>
          {org.name}
        </SelectItem>
      ))}
    </Select>
  )
}
```

---

## 📊 **Success Metrics & Analytics**

### **Product Metrics**
```typescript
// Track key SaaS metrics
const metrics = {
  // Acquisition
  signups: 'Daily/Monthly signups',
  trials: 'Free trial conversions',

  // Activation
  onboarding: 'Onboarding completion rate',
  firstValue: 'Time to first widget configured',

  // Retention
  dau_mau: 'Daily/Monthly active users',
  churn: 'Monthly churn rate',

  // Revenue
  mrr: 'Monthly Recurring Revenue',
  arpu: 'Average Revenue Per User',
  ltv: 'Customer Lifetime Value'
}
```

---

## 🚀 **Go-to-Market Strategy**

### **1. Beta Launch (Month 1-2)**
- 50 beta users uit je netwerk
- Feedback verzamelen en itereren
- Case studies en testimonials

### **2. Public Launch (Month 3)**
- Product Hunt launch
- Content marketing (blog, tutorials)
- Freemium onboarding

### **3. Growth (Month 4-6)**
- Referral programma
- Integration partnerships
- Enterprise sales outreach

---

## 💡 **Implementation Timeline**

### **Phase 1: Foundation (Weeks 1-4) - VOLTOOID ✅**
- [x] Multi-tenant database design ✅ (2024-09-22)
- [x] Organization onboarding system ✅ (2025-10-20)
- [x] User roles & permissions (RBAC) ✅ (2025-10-20)
- [x] Team invite system ✅ (2025-10-20)
- [x] Organization management UI ✅ (2025-10-20)
- [x] Email notification system ✅ (2025-10-20)
- [x] In-app notification center ✅ (2025-10-20)
- [x] User profile management ✅ (2025-10-20)

### **Phase 2: Core SaaS Features (Weeks 5-8)**
- [x] Organization branding (logo, colors) ✅ (2025-10-20)
- [x] Basic billing integration (Stripe) ✅ (2025-10-20)
- [x] Subscription management ✅ (2025-10-20)
- [x] Usage tracking & limits ✅ (2025-10-20)
- [ ] Team collaboration features 🔄 **SUGGESTED NEXT**
- [ ] Admin dashboard enhancements

### **Phase 3: Go-to-Market (Weeks 9-12)**
- [ ] Marketing website
- [ ] Onboarding optimization
- [ ] Customer support system
- [ ] Analytics & monitoring

### **Phase 4: Scale & Growth (Weeks 13-16)**
- [ ] Enterprise features
- [ ] API & integrations
- [ ] Performance optimization
- [ ] Customer success program

---

## 🎯 **Success Criteria**

### **MVP Goals (Month 1)**
- 10 paying customers
- $500 MRR
- <5% churn rate
- 4.5+ customer satisfaction

### **Growth Goals (Month 3)**
- 100 paying customers
- $5k MRR
- Product-market fit indicators
- Referral program launched

### **Scale Goals (Month 6)**
- $25k MRR
- Enterprise customers
- Team of 3-5 people
- Established market position

---

## 📝 **Voortgang & Next Actions**

### ✅ **Voltooid**

#### **Phase 1.1: Multi-tenant Database Design** (22 September 2024)
   - ✅ Organization, OrganizationSettings, OrganizationInvite models toegevoegd
   - ✅ User model uitgebreid met organizationId en organizationRole
   - ✅ Alle bestaande models (Task, Transaction, Post, UserWidgetPreference, BlogPost) uitgebreid met organizationId
   - ✅ Plan en OrganizationRole enums toegevoegd
   - ✅ API routes aangepast voor multi-tenancy (blog, timeline, widgets)
   - ✅ Migration script gemaakt (scripts/migrate-to-multi-tenant.js)
   - ✅ Prisma schema validates en build slaagt
   - ✅ Database migratie uitgevoerd

#### **Phase 1.2: Organization Onboarding** (20 Oktober 2025)
   - ✅ Organization creation & onboarding flow
     - `/app/onboarding/page.tsx` - 2-step wizard met glass morphism design
     - `/api/onboarding` - POST/GET endpoints voor org creatie
     - `components/providers/OnboardingCheck.tsx` - Auto-redirect naar onboarding
   - ✅ Onboarding wizard features:
     - Auto-generated organization slugs
     - Organization name en slug validatie
     - Default FREE plan setup
     - User krijgt automatisch OWNER role

#### **Phase 1.3: Role-Based Access Control** (20 Oktober 2025)
   - ✅ RBAC systeem volledig geïmplementeerd
     - `lib/permissions/types.ts` - Permission types en ROLE_PERMISSIONS mapping
     - `lib/permissions/check.ts` - Helper functies (hasPermission, canManageOrganization, etc.)
     - `lib/permissions/middleware.ts` - API middleware (requireAuth, requirePermission, requireAdmin, etc.)
     - `lib/permissions/index.ts` - Central exports
     - `lib/permissions/README.md` - Complete documentatie
   - ✅ Frontend permission checking
     - `hooks/usePermissions.ts` - React hook met PermissionGuard en RoleGuard
     - Session enrichment met organizationRole
   - ✅ RBAC toegepast op kritieke routes:
     - Organization invites (POST, DELETE)
     - Organization members (PATCH, DELETE)
     - Announcements (GET, PATCH, DELETE)
     - Tasks (PATCH, DELETE met resource ownership)
   - ✅ Code reductie: 86 lines boilerplate vervangen door middleware

#### **Phase 1.4: Team Invite System** (20 Oktober 2025)
   - ✅ Team invite systeem volledig werkend
     - `/app/invite/[token]/page.tsx` - Invite acceptance UI
     - `/api/invite/[token]` - GET invite details
     - `/api/invite/[token]/accept` - POST accept invite
     - `/api/invite/[token]/decline` - POST decline invite
   - ✅ Invite acceptance features:
     - Glass morphism design matching app aesthetic
     - Complete state handling (loading, expired, accepted, invalid, success)
     - Auto-redirect naar login voor unauthenticated users
     - Transaction-based acceptance voor data consistentie
     - Email notification placeholders voor toekomstige uitbreiding
   - ✅ Security:
     - RBAC requireAuth middleware
     - Expiration checking
     - Duplicate acceptance prevention
     - Organization membership creation in transaction

#### **Phase 1.5: Organization Management UI** (20 Oktober 2025)
   - ✅ Organization Management UI volledig geïmplementeerd
     - `/app/dashboard/settings` - Team tab met complete management interface
     - Organization info editing (naam, beschrijving)
     - Member list met avatar, email, en role badges
     - Role management dropdown met RBAC protectie
     - Member removal met confirmatie
     - Team invite form (email + role selector)
     - Pending invites overview met cancel functionaliteit
   - ✅ Organization Switcher component
     - `components/molecules/OrganizationSwitcher.tsx` - Header dropdown
     - Auto-hide bij single organization
     - Portal-based dropdown voor z-index management
     - Page reload na switch voor data consistency
   - ✅ Organization Switch API
     - `/api/user/organizations` - GET: List user's organizations
     - `/api/user/organizations/switch` - POST: Switch active org + sync role
     - Membership verification en validation
   - ✅ RBAC enforcement
     - Organization editing: OWNER/ADMIN only
     - Member role updates: Permission-based
     - Member removal: Cannot remove OWNER
     - Invite management: Permission-based
   - ✅ Glass morphism design met backdrop-blur
   - ✅ Toast notifications voor alle acties
   - ✅ Loading states en error handling

#### **Phase 1.6: Email Notification System** (20 Oktober 2025)
   - ✅ Resend email service integratie
     - `lib/email/resend.ts` - Lazy initialization met graceful degradation
     - Environment variables voor RESEND_API_KEY en FROM_EMAIL
   - ✅ React Email templates
     - `emails/InviteEmail.tsx` - Team invite emails met glass morphism design
     - `emails/WelcomeEmail.tsx` - Welcome emails voor nieuwe leden
   - ✅ Email trigger implementaties
     - Team invites: Automatische email bij invite creatie
     - Welcome emails: Bij invite acceptance
   - ✅ Error handling
     - Graceful degradation als email service niet beschikbaar
     - Console warnings ipv crashes
     - Email send niet-blocking voor core functionaliteit

#### **Phase 1.7: In-App Notification Center** (20 Oktober 2025)
   - ✅ Notification database model
     - `Notification` model in Prisma schema
     - `NotificationType` enum (10 types)
     - Indexen voor userId, read status, organizationId
   - ✅ Notification API routes
     - `/api/notifications` - GET met limit/offset, unread count
     - `/api/notifications/[id]/read` - PATCH voor mark as read
   - ✅ NotificationBell component
     - `components/molecules/NotificationBell.tsx`
     - Real-time polling (30 seconden)
     - Portal-based dropdown voor z-index management
     - Unread count badge
     - Dutch locale voor datum formatting
     - Mark as read functionaliteit
   - ✅ Notification triggers
     - MEMBER_JOINED: Bij invite acceptance
     - ROLE_CHANGED: Bij role updates
     - MEMBER_REMOVED: Bij member verwijdering
     - ANNOUNCEMENT_CREATED: Bij nieuwe announcements
   - ✅ Bulk notification helpers
     - `lib/notifications/create.ts` - createNotification, createBulkNotifications

#### **Phase 1.8: User Profile Management** (20 Oktober 2025)
   - ✅ Profile management page
     - `/app/dashboard/profile/page.tsx`
     - Avatar upload met camera button overlay
     - Name editing met live preview
     - Email display (read-only)
     - Account info (organization, role)
   - ✅ Profile API
     - `/api/user/profile` - PATCH voor name en image updates
     - Session update na profile save
   - ✅ Avatar upload systeem
     - Enhanced `/api/upload` met 'avatar' type support
     - Aparte 'avatars/' prefix in Supabase storage
     - Geen organizationId vereist voor avatars
     - 5MB file size limit
     - Image type validation
   - ✅ UI/UX features
     - Glass morphism design
     - File upload met drag-drop support
     - Loading states tijdens upload
     - Toast notifications voor feedback
     - Session synchronisatie na updates

#### **Phase 2.1: Organization Branding** (20 Oktober 2025)
   - ✅ Database schema updates
     - `OrganizationSettings.secondaryColor` field toegevoegd
     - Support voor logo, primary, en secondary colors
   - ✅ Branding settings API
     - `/api/organization/settings` - GET/PATCH voor branding
     - Hex color validatie (#RRGGBB format)
     - Auto-create settings indien niet bestaat
   - ✅ Logo upload systeem
     - Enhanced `/api/upload` met 'logo' type support
     - Aparte 'logos/' prefix in Supabase storage
     - 5MB file size limit
     - Image type validation
   - ✅ ColorPicker component
     - `components/ui/ColorPicker.tsx`
     - Native HTML5 color picker integration
     - Hex code input met validation
     - Live preview box
     - Reset to default functionaliteit
   - ✅ Branding settings UI
     - Nieuwe "Branding" tab in organization settings
     - Logo upload met preview (vierkant formaat aanbevolen)
     - Primary & secondary color pickers
     - Enable/disable branding toggle
     - Live preview sectie met gradient showcase
     - Preview buttons met custom colors
   - ✅ BrandingContext provider
     - `contexts/BrandingContext.tsx`
     - Fetches settings on mount
     - Sets CSS custom properties (--branding-primary, --branding-secondary)
     - useBranding() hook voor alle components
     - Auto-update bij session changes
   - ✅ Logo display integration
     - Header: Logo naast page title (desktop only, 40x40px)
     - Sidebar: Logo in expanded mode (32x32px)
     - Sidebar: Logo in collapsed mode
     - Vervangt "YustBoard" text wanneer logo aanwezig
     - Glass morphism containers
   - ✅ Branding application
     - CSS variabelen op document root
     - Beschikbaar voor alle UI components
     - Respecteert brandingEnabled toggle
     - Werkt met organization switching

#### **Phase 2.2: Billing Integration (Stripe)** (20 Oktober 2025)
   - ✅ Database schema updates
     - `Organization.subscriptionStatus` enum field (ACTIVE, TRIALING, PAST_DUE, CANCELED, UNPAID, INCOMPLETE)
     - `Organization.currentPeriodEnd` DateTime field
     - `Organization.cancelAtPeriodEnd` Boolean field
   - ✅ Stripe SDK integration
     - Dependencies: `stripe`, `@stripe/stripe-js`, `lucide-react`
     - Lazy initialization pattern voor build-time errors
     - Proxy pattern voor convenient stripe export
   - ✅ Stripe configuration (`lib/stripe/config.ts`)
     - Plan configuratie met pricing en features:
       - FREE: €0, 1 user, 3 widgets, 30 dagen retention
       - STARTER: €9/maand, 3 users, 10 widgets, 90 dagen retention
       - PRO: €29/maand, 10 users, unlimited widgets, 365 dagen retention
       - ENTERPRISE: €99/maand, unlimited users/widgets/retention
     - Type-safe helpers (getPlanConfig, isValidPlan)
     - 14-day trial configuration
   - ✅ Billing API routes
     - `/api/billing/status` - GET billing status, plan, usage, limits
     - `/api/billing/create-checkout` - POST create Stripe Checkout session
     - `/api/billing/customer-portal` - POST open Stripe Customer Portal
     - Alle routes met OWNER-only RBAC protection
   - ✅ Stripe webhook handler (`/api/webhooks/stripe`)
     - Webhook signature verification
     - Event handlers:
       - customer.subscription.created/updated - Update org subscription
       - customer.subscription.deleted - Auto-downgrade to FREE
       - invoice.payment_succeeded - Mark subscription ACTIVE
       - invoice.payment_failed - Mark subscription PAST_DUE
     - Price ID to plan mapping
   - ✅ Billing types & interfaces (`types/billing.ts`)
     - PlanType, SubscriptionStatus types
     - BillingOrganization, PlanConfig interfaces
     - UsageInfo, SubscriptionDetails interfaces
   - ✅ Billing custom hook (`hooks/useBillingStatus.ts`)
     - fetchBillingStatus() - Ophalen huidige status
     - createCheckoutSession(plan) - Stripe Checkout redirect
     - openCustomerPortal() - Stripe Portal redirect
   - ✅ Billing UI components
     - `components/billing/PlanCard.tsx` - Plan card met glass morphism
     - `components/billing/BillingDashboard.tsx` - Complete billing dashboard
   - ✅ Billing Dashboard features
     - Current plan overview met pricing
     - Status badges (Trial actief, Betaling mislukt, Geannuleerd)
     - Renewal/trial expiry date display
     - Usage indicators met progress bars:
       - Users: current vs limit met color-coding (groen → geel → rood)
       - Widgets: current vs limit met color-coding
     - Plan selection grid (4 plans)
     - "Aanbevolen" badge voor PRO plan
     - Manage billing button (Stripe Customer Portal)
     - OWNER-only access met permission guards
   - ✅ Settings integration
     - Nieuwe "Billing" tab in `/dashboard/settings`
     - FiCreditCard icon voor tab
     - Fully integrated met bestaande settings UI
   - ✅ Payment features
     - 14-day trial voor nieuwe subscriptions
     - Nederlandse betaalmethodes (card, iDEAL)
     - Promotion codes support
     - Success/cancel redirect URLs
     - Stripe Customer auto-creation
   - ✅ Usage tracking & limits
     - Real-time user count (OrganizationMembership)
     - Real-time widget count (UserWidgetPreference)
     - Plan-based limits enforcing
     - Visual indicators bij 70% en 90% usage

### 🔄 **Volgende Stappen (Prioriteit)**

**🎉 Phase 1 (Foundation) is VOLLEDIG AFGEROND! 🎉**
**🎉 Phase 2.1 (Organization Branding) is VOLLEDIG AFGEROND! 🎉**
**🎉 Phase 2.2 (Billing Integration) is VOLLEDIG AFGEROND! 🎉**

Aanbevolen volgorde voor Phase 2 (vervolg):

1. **Performance & Caching Optimalisatie** - Week 8 🔄 **HIGH PRIORITY**
   - [ ] Next.js caching strategie implementeren
     - [ ] Static page caching voor publieke pagina's
     - [ ] Incremental Static Regeneration (ISR) voor blog/news
     - [ ] Route segment caching configuratie
   - [ ] API response caching
     - [ ] Redis integratie voor session caching
     - [ ] API response cache met revalidation tags
     - [ ] Database query optimization
   - [ ] Client-side caching
     - [ ] React Query/SWR voor data fetching
     - [ ] Local storage voor user preferences
     - [ ] Service Worker voor offline support
   - [ ] Image optimalisatie
     - [ ] Next.js Image component overal gebruiken
     - [ ] CDN integratie (Vercel/Cloudflare)
     - [ ] Lazy loading voor images
     - [ ] WebP/AVIF formaat conversie
   - [ ] Bundle optimalisatie
     - [ ] Code splitting per route
     - [ ] Dynamic imports voor large components
     - [ ] Tree shaking verificatie
     - [ ] Bundle analyzer gebruiken
   - [ ] Database optimalisatie
     - [ ] Query indexing (Prisma indexes)
     - [ ] Connection pooling configuratie
     - [ ] N+1 query problemen oplossen
     - [ ] Database query monitoring
   - [ ] Lighthouse performance score > 90
     - [ ] Core Web Vitals optimalisatie (LCP, FID, CLS)
     - [ ] Time to First Byte (TTFB) verbeteren
     - [ ] Total Blocking Time (TBT) reduceren

2. **Team Collaboration Features** - Week 8-9
   - [ ] Real-time collaborative editing
   - [ ] Comments op timeline posts (already partially implemented)
   - [ ] @mentions in comments
   - [ ] Activity feed voor team acties
   - [ ] Shared widgets configuratie

3. **Admin Dashboard Enhancements** - Week 9
   - [ ] Organization analytics dashboard
   - [ ] User activity monitoring
   - [ ] System health dashboard
   - [ ] Advanced reporting

4. **Marketing Website** - Week 10-11
   - [ ] Landing page
   - [ ] Pricing page
   - [ ] Features showcase
   - [ ] Blog/documentation
   - [ ] Contact/support forms

### 🔧 **Technische Details & Notities**

#### **Performance Optimization Implementation Guide**

**1. Next.js Caching Strategie**
```typescript
// app/blog/page.tsx - ISR met revalidation
export const revalidate = 3600; // Revalidate every hour

export default async function BlogPage() {
  const posts = await getBlogPosts();
  return <BlogList posts={posts} />;
}

// app/api/news/route.ts - API Route caching
export async function GET() {
  const news = await fetchNews();

  return NextResponse.json(news, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
    }
  });
}

// Route Segment Config
export const dynamic = 'force-static'; // For static pages
export const fetchCache = 'force-cache'; // Force cache for fetches
```

**2. Redis Caching Layer**
```typescript
// lib/cache/redis.ts
import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});

export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 3600
): Promise<T> {
  const cached = await redis.get<T>(key);
  if (cached) return cached;

  const data = await fetcher();
  await redis.setex(key, ttl, JSON.stringify(data));
  return data;
}

// Usage in API route
export async function GET(req: Request) {
  const orgId = req.headers.get('x-organization-id');

  const data = await getCached(
    `widgets:${orgId}`,
    () => prisma.widget.findMany({ where: { organizationId: orgId } }),
    300 // 5 minutes
  );

  return NextResponse.json(data);
}
```

**3. React Query Integration**
```typescript
// lib/query/client.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// hooks/useWidgets.ts
import { useQuery } from '@tanstack/react-query';

export function useWidgets(orgId: string) {
  return useQuery({
    queryKey: ['widgets', orgId],
    queryFn: () => fetch(`/api/settings/widgets`).then(r => r.json()),
    staleTime: 5 * 60 * 1000,
  });
}
```

**4. Database Query Optimization**
```typescript
// Before: N+1 query problem
const posts = await prisma.post.findMany();
for (const post of posts) {
  const author = await prisma.user.findUnique({ where: { id: post.userId } });
}

// After: Include relation
const posts = await prisma.post.findMany({
  include: {
    user: {
      select: { id: true, name: true, image: true }
    },
    _count: { select: { comments: true, likes: true } }
  }
});

// Add indexes in schema.prisma
model Post {
  @@index([organizationId, createdAt(sort: Desc)])
  @@index([userId])
}
```

**5. Image Optimization**
```typescript
// components/ui/OptimizedImage.tsx
import Image from 'next/image';

export function OptimizedImage({ src, alt, ...props }) {
  return (
    <Image
      src={src}
      alt={alt}
      loading="lazy"
      placeholder="blur"
      blurDataURL="data:image/svg+xml;base64,..."
      quality={85}
      formats={['image/webp', 'image/avif']}
      {...props}
    />
  );
}
```

**6. Bundle Optimization**
```typescript
// Dynamic imports voor large components
import dynamic from 'next/dynamic';

const StripeDashboard = dynamic(
  () => import('@/components/billing/BillingDashboard'),
  {
    loading: () => <LoadingSkeleton />,
    ssr: false
  }
);

// Route-based code splitting is automatic in Next.js 15
```

**7. Performance Monitoring**
```typescript
// lib/monitoring/performance.ts
export function reportWebVitals(metric: NextWebVitalsMetric) {
  const { id, name, label, value } = metric;

  // Send to analytics
  if (typeof window !== 'undefined') {
    window.gtag?.('event', name, {
      event_category: label === 'web-vital' ? 'Web Vitals' : 'Next.js Metric',
      value: Math.round(name === 'CLS' ? value * 1000 : value),
      event_label: id,
      non_interaction: true,
    });
  }
}

// app/layout.tsx
export { reportWebVitals } from '@/lib/monitoring/performance';
```

**Target Performance Metrics:**
- **Lighthouse Score**: > 90 voor alle categorieën
- **First Contentful Paint (FCP)**: < 1.8s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **First Input Delay (FID)**: < 100ms
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Time to First Byte (TTFB)**: < 600ms
- **Total Blocking Time (TBT)**: < 300ms

#### **Database Schema Changes**
```sql
-- Nieuwe tabellen:
- Organization (met plan, stripe fields, indexen)
- OrganizationSettings (max users/widgets, branding)
- OrganizationInvite (team invites met tokens)

-- Updated bestaande tabellen:
- User: +organizationId, +organizationRole
- Task: +organizationId
- Transaction: +organizationId
- Post: +organizationId
- UserWidgetPreference: +organizationId (unique constraint updated)
- BlogPost: +organizationId
```

#### **API Changes Made**
- `/api/blog`: Requires organizationId, checks user.organizationId
- `/api/timeline`: Adds organizationId to posts
- `/api/settings/widgets`: Uses new compound unique key (userId+widgetId+organizationId)

#### **Migration Script**
- Locatie: `scripts/migrate-to-multi-tenant.js`
- Maakt default organization aan voor bestaande data
- Zet bestaande users als OWNER van default org
- Werkt alle gerelateerde data bij

#### **Volgende Implementatie Stappen**
1. Run migration script (met backup!)
2. Maak organization management UI components
3. Implementeer middleware voor tenant isolation
4. Voeg organization context toe aan alle queries
5. Test met meerdere organizations

---

*This roadmap is a living document and should be updated as we learn and iterate based on customer feedback and market demands.*