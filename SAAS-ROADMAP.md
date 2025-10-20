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

### **Phase 1: Foundation (Weeks 1-4)**
- [x] Multi-tenant database design ✅ (2024-09-22)
- [x] Organization onboarding system ✅ (2025-10-20)
- [x] User roles & permissions (RBAC) ✅ (2025-10-20)
- [x] Team invite system ✅ (2025-10-20)
- [x] Organization management UI ✅ (2025-10-20)
- [ ] Basic billing integration 🔄 **NEXT**

### **Phase 2: Core SaaS Features (Weeks 5-8)**
- [ ] Subscription management
- [ ] Usage tracking & limits
- [ ] Team collaboration features
- [ ] Admin dashboard

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

### 🔄 **Volgende Stappen (Prioriteit)**

1. **Basic Billing Integration** - Week 5-6
   - [ ] Stripe setup en webhooks
   - [ ] Subscription model implementeren
   - [ ] Plan upgrade/downgrade flow
   - [ ] Usage limits enforcing
   - [ ] Billing dashboard

### 🔧 **Technische Details & Notities**

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