# YustBoard Development Guidelines

This document contains important development guidelines and standards for the YustBoard project that should be followed by all contributors, including AI assistants.

## 🚀 Pre-Commit Requirements

### CRITICAL: Test, Lint, and Build Verification
**MANDATORY**: Before ANY commit, you MUST run and ensure ALL these commands pass without errors:

```bash
# 1. Run unit tests - ALL must pass
npm run test:unit

# 2. Run linting - 0 errors, 0 warnings
npm run lint

# 3. Run type checking - no type errors
npm run typecheck

# 4. Build the application - must complete successfully
npm run build
```

### Pre-Commit Checklist
Before committing, verify:
- ✅ **All 88 unit tests pass** (`npm run test:unit`)
- ✅ **0 lint errors, 0 lint warnings** (`npm run lint`)
- ✅ **No TypeScript errors** (`npm run typecheck`)
- ✅ **Build completes successfully** (`npm run build`)
- ✅ **No console.log statements in production code** (except in catch blocks for errors)
- ✅ **No TODO/FIXME comments in critical API routes**
- ✅ **All imports are used, no unused variables**

### Why These Checks Matter
- **Unit Tests**: Ensure functionality works correctly and regressions are caught
- **Lint**: Maintain code quality and consistency
- **Type Check**: Prevent runtime errors from type mismatches
- **Build**: Verify the application can be deployed to production

**If any check fails, DO NOT commit. Fix the issues first.**

## 📚 Storybook Requirements

### Component Stories
**MANDATORY**: Every new component must have a corresponding Storybook story.

#### Story Structure
```typescript
// components/ComponentName.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { ComponentName } from './ComponentName';

const meta: Meta<typeof ComponentName> = {
  title: 'Components/ComponentName',
  component: ComponentName,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    // Define component props here
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Default props
  },
};

export const Variant: Story = {
  args: {
    // Variant props
  },
};
```

#### Story Categories
- **UI Components**: `Components/UI/ComponentName`
- **Dashboard Widgets**: `Dashboard/Widgets/WidgetName`
- **Layout Components**: `Layout/ComponentName`
- **Page Components**: `Pages/PageName`

### Story Testing
- All stories must be browser-compatible (no Node.js specific code)
- Mock external dependencies (APIs, browser APIs)
- Use proper TypeScript types
- Include multiple variants when applicable

## 🎨 Design System Standards

### Glass Morphism Design
All dashboard components should follow the glass morphism design pattern:

```typescript
// Widget container
className="backdrop-blur-md bg-white/10 dark:bg-gray-900/10 border border-white/20 dark:border-gray-700/30 rounded-xl shadow-xl shadow-black/10 overflow-hidden"

// Widget header with gradient
className="p-4 bg-gradient-to-r from-[color]-500/80 to-[color]-600/80 backdrop-blur-sm text-white border-b border-white/20 dark:border-gray-700/30"

// Widget content
className="p-4 bg-white/5 backdrop-blur-sm"

// Widget footer
className="p-3 bg-white/5 dark:bg-gray-800/20 backdrop-blur-sm border-t border-white/10 dark:border-gray-700/30 text-center"
```

### Color Schemes by Widget Type
- **Timeline**: Indigo gradient (`from-indigo-500/80 to-indigo-600/80`)
- **Gmail**: Red gradient (`from-red-500/80 to-red-600/80`)
- **Calendar/Tasks**: Green gradient (`from-green-500/80 to-green-600/80`)
- **News**: Purple gradient (`from-purple-500/80 to-purple-600/80`)
- **Weather**: Blue gradient (`from-blue-500/80 to-blue-600/80`)
- **Banking**: Green gradient (`from-green-500/80 to-green-600/80`)
- **Blog**: Indigo gradient (`from-indigo-500/80 to-indigo-600/80`)
- **Social**: Purple gradient (`from-purple-500/80 to-purple-600/80`)
- **Fitness**: Orange gradient (`from-orange-500/80 to-orange-600/80`)
- **Files**: Blue gradient (`from-blue-500/80 to-blue-600/80`)

### Interactive Elements
```typescript
// Buttons and links
className="hover:bg-white/10 dark:hover:bg-gray-800/20 px-3 py-1 rounded-lg transition-all duration-200"

// Form inputs
className="bg-white/20 dark:bg-gray-800/20 border border-white/30 dark:border-gray-600/30 rounded-lg backdrop-blur-sm focus:ring-2 focus:ring-[color]-500/50"
```

## ⚛️ Next.js Standards

### File Structure
```
app/
├── (auth)/
│   └── login/
├── api/
│   └── route.ts
├── dashboard/
│   ├── layout.tsx
│   └── page.tsx
└── layout.tsx

components/
├── ui/
├── dashboard/
│   └── widgets/
└── providers/
```

### Component Conventions
- Use `'use client'` directive for client components
- Use `React.memo()` for performance optimization on widgets
- Export components as default when single export
- Use proper TypeScript interfaces for props

### API Routes
```typescript
// app/api/example/route.ts
export async function GET(request: Request) {
  try {
    // Implementation
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Error message' }, { status: 500 });
  }
}
```

### Error Handling
- Always implement proper error boundaries
- Use try-catch blocks in API routes
- Return meaningful error messages
- Log errors for debugging

### Performance
- Use `dynamic()` for code splitting large components
- Implement loading states for async operations
- Use `useCallback()` and `useMemo()` appropriately
- Optimize images with Next.js Image component

## 🔧 Code Quality Standards

### TypeScript
- Use strict TypeScript configuration
- Define interfaces for all props and data structures
- Avoid `any` type unless absolutely necessary
- Use proper generic types

### Imports
```typescript
// External libraries first
import React from 'react';
import { useSession } from 'next-auth/react';

// Internal components
import { Button } from '@/components/ui/button';
import { Widget } from '@/components/dashboard/Widget';

// Utils and types
import { formatDate } from '@/utils/date-utils';
import type { User } from '@/types/auth';
```

### Naming Conventions
- Components: PascalCase (`UserProfile`)
- Files: kebab-case (`user-profile.tsx`)
- Variables/Functions: camelCase (`handleSubmit`)
- Constants: UPPER_SNAKE_CASE (`API_BASE_URL`)

## 🎯 Development Workflow

### Before Starting Work
1. Check current todos with TodoRead tool
2. Plan tasks with TodoWrite tool
3. Understand existing codebase patterns

### During Development
1. Follow glass morphism design patterns
2. Create Storybook stories for new components
3. Test components in isolation
4. Ensure responsive design

### Before Committing
1. ✅ Run `npm run build` - must pass
2. ✅ Run `npm run lint` - must pass  
3. ✅ Run `npm run typecheck` - must pass
4. ✅ Create/update Storybook stories
5. ✅ Test in browser (development mode)
6. ✅ Check responsive design on mobile

### Commit Message Format
```
type: brief description

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## 🧪 Testing Guidelines

### Storybook Testing
- All components must have stories
- Stories should cover main use cases
- Mock external dependencies properly
- Ensure stories work in both light/dark modes

### Browser Compatibility
- Test in Chrome, Firefox, Safari
- Ensure mobile responsiveness
- Check touch interactions on mobile devices

## 📝 Documentation

### Component Documentation
- Document props with TypeScript interfaces
- Include usage examples in stories
- Document any special setup requirements

### API Documentation
- Document API endpoints and their parameters
- Include example requests and responses
- Document error responses

## 🔍 Common Patterns

### Widget Structure
```typescript
const WidgetName = React.memo(function WidgetName() {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Glass morphism container
  return (
    <div className="backdrop-blur-md bg-white/10 dark:bg-gray-900/10 border border-white/20 dark:border-gray-700/30 rounded-xl shadow-xl shadow-black/10 overflow-hidden">
      {/* Header with gradient */}
      <div className="p-4 bg-gradient-to-r from-[color]-500/80 to-[color]-600/80 backdrop-blur-sm text-white">
        {/* Header content */}
      </div>
      
      {/* Content */}
      <div className="p-4 bg-white/5 backdrop-blur-sm">
        {/* Widget content */}
      </div>
      
      {/* Footer */}
      <div className="p-3 bg-white/5 backdrop-blur-sm border-t border-white/10 dark:border-gray-700/30">
        {/* Footer content */}
      </div>
    </div>
  );
});
```

### Modal Structure
```typescript
// Use createPortal for modals
return createPortal(
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999]">
    <div className="backdrop-blur-md bg-white/90 dark:bg-gray-900/90 rounded-2xl border border-white/20 dark:border-gray-700/30">
      {/* Modal content */}
    </div>
  </div>,
  document.body
);
```

### React Query Pattern (PREFERRED for widgets)
```typescript
// hooks/queries/useYourData.ts
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/client';

async function fetchYourData(): Promise<YourData[]> {
  const response = await fetch('/api/your-endpoint');
  if (!response.ok) throw new Error('Failed to fetch');
  return response.json();
}

export function useYourData() {
  return useQuery({
    queryKey: queryKeys.yourFeature.list(),
    queryFn: fetchYourData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // Keep for 10 minutes
  });
}

// Widget component
const YourWidget = React.memo(function YourWidget() {
  const { data, isLoading, error, refetch } = useYourData();

  // No need for useState, useEffect, or manual loading states!
  // React Query handles all caching, loading, and error states
});
```

## ⚡ Performance Standards

### HTTP Caching (API Routes)
Always add Cache-Control headers to GET routes:

```typescript
// app/api/your-route/route.ts
export async function GET(request: Request) {
  const data = await fetchData();

  return NextResponse.json(data, {
    headers: {
      // Choose cache duration based on update frequency:
      // - 30-60s: Real-time data (notifications, live feeds)
      // - 120-300s: Frequent updates (tasks, timeline)
      // - 600s+: Slow updates (weather, news)
      'Cache-Control': 'private, max-age=300, stale-while-revalidate=600'
    }
  });
}
```

**Cache Duration Guidelines:**
- **30-60s**: Real-time data (notifications, messages)
- **120-300s**: Frequent updates (tasks, user content)
- **300-600s**: Moderate updates (calendar, emails)
- **600s+**: Slow updates (weather, news, external data)

### React Query (Client-Side Caching)
**ALWAYS use React Query for widgets** instead of useState + useEffect:

✅ **Benefits:**
- Automatic request deduplication (85-90% reduction)
- Instant cache hits on revisits
- Background refetching without loading states
- 30-40% less code per widget
- Eliminates manual loading/error state management

❌ **Don't do this:**
```typescript
const [data, setData] = useState();
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  async function fetchData() {
    try {
      setLoading(true);
      const response = await fetch('/api/data');
      setData(await response.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  fetchData();
}, []);
```

✅ **Do this instead:**
```typescript
const { data, isLoading, error, refetch } = useYourData();
// That's it! React Query handles everything.
```

### Database Query Optimization
When writing Prisma queries:

```typescript
// ✅ Use indexes for WHERE clauses
await prisma.post.findMany({
  where: {
    organizationId: orgId,  // Has index: @@index([organizationId, createdAt])
    createdAt: { gte: date }
  },
  orderBy: { createdAt: 'desc' }  // Covered by index
});

// ✅ Use batch operations
await prisma.task.createMany({
  data: tasks  // 12x faster than individual creates
});

// ❌ Avoid N+1 queries
// Bad: Loop with individual queries
for (const item of items) {
  await prisma.detail.create({ data: item });
}
```

### Code Splitting
Lazy load heavy components:

```typescript
import dynamic from 'next/dynamic';

// ✅ Lazy load heavy libraries (Stripe, Charts, etc.)
const HeavyComponent = dynamic(
  () => import('@/components/HeavyComponent'),
  {
    ssr: false,
    loading: () => <Spinner />
  }
);
```

### Image Optimization
**NEVER use unoptimized={true}** unless absolutely necessary:

```typescript
// ✅ Let Next.js optimize
<Image
  src={imageUrl}
  alt="Description"
  width={400}
  height={300}
  className="..."
/>

// ❌ Don't disable optimization
<Image src={imageUrl} alt="..." unoptimized={true} />
```

---

## 🚀 SaaS Transformation Progress

### ✅ **COMPLETED**

#### **Phase 1.1: Multi-tenant Database Design** (22 September 2024)
- ✅ Organization, OrganizationSettings, OrganizationInvite models
- ✅ User model met organizationId en organizationRole
- ✅ Alle models uitgebreid met organizationId
- ✅ Migration script en database migratie

#### **Phase 1.2: Organization Onboarding** (20 Oktober 2025)
- ✅ Organization creation & onboarding flow (`/app/onboarding`)
- ✅ 2-step wizard met auto-generated slugs
- ✅ OnboardingCheck provider voor auto-redirect
- ✅ POST/GET API routes (`/api/onboarding`)

#### **Phase 1.3: Role-Based Access Control** (20 Oktober 2025)
- ✅ Complete RBAC systeem (`lib/permissions/`)
- ✅ Permission types, middleware, helper functies
- ✅ Frontend hooks (`usePermissions`, PermissionGuard, RoleGuard)
- ✅ RBAC toegepast op kritieke API routes
- ✅ Session enrichment met organizationRole
- ✅ Documentatie: `lib/permissions/README.md`

#### **Phase 1.4: Team Invite System** (20 Oktober 2025)
- ✅ Invite acceptance UI (`/app/invite/[token]`)
- ✅ API routes (GET, accept, decline)
- ✅ Transaction-based acceptance
- ✅ RBAC security middleware
- ✅ Email notification placeholders
- ✅ Documentatie: `app/invite/README.md`

#### **Phase 1.5: Organization Management UI** (20 Oktober 2025)
- ✅ Organization Switcher component (`components/molecules/OrganizationSwitcher.tsx`)
- ✅ Switch API route (`/api/user/organizations/switch`) met organizationRole sync
- ✅ Organization Settings pagina (`/app/dashboard/settings` - Team tab)
  - ✅ Organization info met edit functionaliteit (naam, beschrijving)
  - ✅ Member list met role badges
  - ✅ Role management dropdown (OWNER/ADMIN/MEMBER/VIEWER)
  - ✅ Member removal functionaliteit
  - ✅ Team invite form met role selector
  - ✅ Pending invites overview met cancel optie
- ✅ RBAC protectie op alle management functies
- ✅ Glass morphism design consistency

#### **Phase 1.6: Email Notification System** (20 Oktober 2025)
- ✅ Resend integration met lazy initialization
- ✅ React Email templates met glass morphism design
- ✅ Email templates:
  - ✅ InviteEmail - Team invite met magic link
  - ✅ WelcomeEmail - Welcome email voor nieuwe members
- ✅ Email utilities (`lib/email/`)
  - ✅ `send-invite.ts` - Invite email functionaliteit
  - ✅ `send-welcome.ts` - Welcome email functionaliteit
  - ✅ `resend.ts` - Resend client met graceful degradation
- ✅ Automated email triggers
  - ✅ Invite email bij team invite
  - ✅ Welcome email bij invite acceptance
- ✅ Environment configuration (RESEND_API_KEY, RESEND_FROM_EMAIL)

#### **Phase 1.7: Notification Center** (20 Oktober 2025)
- ✅ Notification database model met NotificationType enum
- ✅ Notification API routes (`/api/notifications`)
  - ✅ GET - List notifications met unread count
  - ✅ POST - Mark all as read
  - ✅ PATCH - Mark single notification as read
- ✅ NotificationBell component (`components/molecules/NotificationBell.tsx`)
  - ✅ Real-time polling (30 sec intervals)
  - ✅ Unread count badge
  - ✅ Portal-based dropdown
  - ✅ Glass morphism design
  - ✅ Dutch relative time formatting
- ✅ Notification triggers voor alle key events:
  - ✅ MEMBER_JOINED - Admins notified when member accepts invite
  - ✅ ROLE_CHANGED - User notified on role update
  - ✅ MEMBER_REMOVED - User notified when removed
  - ✅ ANNOUNCEMENT_CREATED - All members notified on new announcement
- ✅ Bulk notification support voor organization-wide events

#### **Phase 1.8: User Profile Management** (20 Oktober 2025)
- ✅ User Profile Page (`/app/dashboard/profile`)
  - ✅ Avatar upload met camera button
  - ✅ Name editing met validation
  - ✅ Email display (read-only)
  - ✅ Account info (organization, role)
  - ✅ Glass morphism design
- ✅ Profile Update API (`/api/user/profile`)
  - ✅ PATCH route voor name en image updates
  - ✅ Session synchronization
  - ✅ RBAC protected
- ✅ Avatar Upload Enhancement
  - ✅ Avatar-specific upload type
  - ✅ Separate avatars/ folder
  - ✅ No organization required voor avatars
  - ✅ Image validation (type, size max 5MB)

#### **Phase 2.1: Organization Branding** (20 Oktober 2025)
- ✅ Database & API
  - ✅ OrganizationSettings.secondaryColor field
  - ✅ `/api/organization/settings` - GET/PATCH endpoints
  - ✅ Hex color validation (#RRGGBB)
  - ✅ Logo upload via `/api/upload` (type: 'logo')
- ✅ UI Components
  - ✅ ColorPicker component (`components/ui/ColorPicker.tsx`)
  - ✅ Native color picker + hex input
  - ✅ Live preview & reset functionality
  - ✅ Branding tab in organization settings
  - ✅ Logo upload met preview (5MB limit)
  - ✅ Primary & secondary color pickers
  - ✅ Enable/disable toggle
- ✅ BrandingContext Provider
  - ✅ `contexts/BrandingContext.tsx`
  - ✅ Fetches settings on mount
  - ✅ CSS custom properties (--branding-primary, --branding-secondary)
  - ✅ useBranding() hook
- ✅ Logo Display
  - ✅ Header: Logo naast page title (40x40px)
  - ✅ Sidebar: Logo in expanded/collapsed mode (32x32px)
  - ✅ Vervangt "YustBoard" text wanneer actief
  - ✅ Glass morphism containers

#### **Phase 2.2: Billing Integration (Stripe)** (20 Oktober 2025)
- ✅ Database & Schema
  - ✅ Organization.subscriptionStatus enum (6 states)
  - ✅ Organization.currentPeriodEnd DateTime
  - ✅ Organization.cancelAtPeriodEnd Boolean
- ✅ Stripe Backend (`lib/stripe/config.ts`)
  - ✅ Lazy initialization pattern
  - ✅ 4 plan tiers (FREE €0, STARTER €9, PRO €29, ENTERPRISE €99)
  - ✅ Feature limits per plan
  - ✅ 14-day trial configuratie
- ✅ API Routes
  - ✅ `/api/billing/status` - GET status, plan, usage
  - ✅ `/api/billing/create-checkout` - POST Stripe Checkout
  - ✅ `/api/billing/customer-portal` - POST Customer Portal
  - ✅ `/api/webhooks/stripe` - Stripe event handler
  - ✅ OWNER-only RBAC protection
- ✅ Webhook Handlers
  - ✅ subscription.created/updated - Update org
  - ✅ subscription.deleted - Downgrade to FREE
  - ✅ payment_succeeded/failed - Status updates
- ✅ Types & Hooks
  - ✅ `types/billing.ts` - TypeScript interfaces
  - ✅ `hooks/useBillingStatus.ts` - Billing state management
- ✅ UI Components
  - ✅ `components/billing/PlanCard.tsx` - Plan cards
  - ✅ `components/billing/BillingDashboard.tsx` - Complete dashboard
  - ✅ Billing tab in `/dashboard/settings`
- ✅ Dashboard Features
  - ✅ Current plan overview met pricing
  - ✅ Status badges (trial, past_due, canceled)
  - ✅ Usage tracking (users, widgets) met progress bars
  - ✅ Color-coded limits (groen → geel → rood)
  - ✅ 4-plan selection grid
  - ✅ Stripe Checkout integration
  - ✅ Customer Portal access
  - ✅ 14-day trial support
  - ✅ Nederlandse betaalmethodes (card, iDEAL)

#### **Phase 2.3: Branding Application & RBAC Enhancements** (20 Oktober 2025)
- ✅ Branding Theme Application
  - ✅ Sidebar active menu items use primaryColor from branding
  - ✅ Active state indicators (left/right bar) use primaryColor
  - ✅ Inline styles applied when branding enabled
  - ✅ Fallback to default Tailwind colors when disabled
  - ✅ All menu items styled (dashboard, admin, organization sections)
- ✅ Organization Settings RBAC
  - ✅ Branding tab visible to all (OWNER/ADMIN can edit)
  - ✅ Organization details editing restricted to OWNER/ADMIN
  - ✅ Team invite management restricted to OWNER/ADMIN
  - ✅ Member role management restricted to OWNER/ADMIN
  - ✅ Regular members can view but not modify
- ✅ Profile Management Improvements
  - ✅ Profile link added to Header dropdown menu
  - ✅ Easy access to `/dashboard/profile` for all users
  - ✅ Avatar upload, name editing, account info display
- ✅ Auth Method Differentiation
  - ✅ Google API features hidden for credentials users
  - ✅ Middleware route protection for OAuth-only features
  - ✅ Sidebar filtering based on authMethod

### 🔄 **VOLGENDE PRIORITEITEN**
**Referentie**: Zie `SAAS-ROADMAP.md` voor volledige details

1. **Team Collaboration Features** (Week 8) 🔄 **IN PROGRESS**
   - [ ] Real-time collaborative editing
   - [x] Comments op timeline posts (fully implemented with React Query)
   - [x] @mentions in comments (autocomplete, parsing, styling, notifications)
   - [x] Activity feed voor team acties (ActivityWidget met aggregatie)
   - [x] **Team Agenda zonder Google** (22 December 2025)
     - [x] CalendarEvent database model met organization-scoped events
     - [x] `/api/calendar/events` CRUD routes met RBAC
     - [x] Merged view: lokale events + Google Calendar (indien gekoppeld)
     - [x] Agenda widget en pagina werken zonder Google koppeling
   - [ ] Shared widgets configuratie

2. **Admin Dashboard Enhancements** (Week 8-9)
   - [ ] Organization analytics dashboard
   - [ ] User activity monitoring
   - [ ] System health dashboard

3. **Marketing Website** (Week 9-10)
   - [ ] Landing page
   - [ ] Pricing page
   - [ ] Features showcase

### 🔧 **Technical Implementation Notes**
- **Database**: Multi-tenant schema met organizationId
- **RBAC**: 4 roles (OWNER, ADMIN, MEMBER, VIEWER) met granular permissions
- **Security**: Transaction-based operations, token validation, expiration checking
- **Documentation**: README's voor onboarding, RBAC, en invite systeem
- **Next Steps**: Organization management UI, billing integration

**BELANGRIJK**: Raadpleeg altijd `SAAS-ROADMAP.md` voor de meest actuele status en gedetailleerde technische informatie.

---

Remember: **Quality over speed**. Always ensure the build passes and components have stories before committing!