# Organization Onboarding System

Complete implementation of the organization creation and onboarding flow for new YustBoard users.

## Overview

The onboarding system guides new users through creating their organization, automatically setting them up as the OWNER, and preparing their account for team collaboration.

## Architecture

### Components

#### 1. Onboarding Page
**Location**: `/app/onboarding/page.tsx`

A beautiful 2-step wizard that guides users through organization setup.

**Features**:
- Auto-generated organization slugs from names
- Real-time slug validation
- Glass morphism design with progress indicator
- Auto-redirect for users who already have an organization
- Auto-redirect to login for unauthenticated users

**Steps**:
1. **Basic Information**
   - Organization name input
   - Organization slug input (auto-generated, editable)
   - Slug format validation (lowercase, alphanumeric, hyphens)

2. **Confirmation**
   - Review organization details
   - Shows organization URL
   - Shows assigned role (OWNER)
   - Shows plan (FREE)
   - Back button to edit
   - Create organization button

#### 2. Onboarding Check Provider
**Location**: `/components/providers/OnboardingCheck.tsx`

A React provider that enforces onboarding completion for authenticated users.

**Functionality**:
- Wraps protected routes (dashboard, etc.)
- Checks if user has an organization
- Auto-redirects to `/onboarding` if needed
- Shows loading state during check
- Skips check on onboarding page itself

**Usage**:
```tsx
// In layout.tsx
<OnboardingCheck>
  <DashboardLayout />
</OnboardingCheck>
```

#### 3. API Routes

##### POST /api/onboarding
Creates a new organization and assigns the user as OWNER.

**Request Body**:
```json
{
  "organizationName": "Acme Inc",
  "organizationSlug": "acme-inc"
}
```

**Process** (Transaction-based):
1. Validates slug format (`/^[a-z0-9-]+$/`)
2. Checks slug uniqueness
3. Creates `Organization` with FREE plan
4. Creates `OrganizationMembership` with OWNER role
5. Updates user's `organizationId` and `organizationRole`

**Response**:
```json
{
  "organization": {
    "id": "cuid",
    "name": "Acme Inc",
    "slug": "acme-inc",
    "plan": "FREE"
  },
  "membership": {
    "userId": "user-id",
    "organizationId": "org-id",
    "role": "OWNER"
  }
}
```

**Errors**:
- `401` - Unauthorized (not authenticated)
- `400` - Invalid slug format
- `400` - Slug already exists
- `500` - Server error

##### GET /api/onboarding
Checks if the current user needs onboarding.

**Response**:
```json
{
  "needsOnboarding": false,
  "authenticated": true,
  "organization": {
    "id": "org-id",
    "name": "Acme Inc",
    "slug": "acme-inc"
  }
}
```

**States**:
- `authenticated: false` - User not logged in
- `needsOnboarding: true` - User has no organization
- `needsOnboarding: false` - User has organization

## Database Schema

### Organization Model
```prisma
model Organization {
  id        String    @id @default(cuid())
  name      String
  slug      String    @unique
  plan      Plan      @default(FREE)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  members   OrganizationMembership[]
  settings  OrganizationSettings?
}
```

### OrganizationMembership Model
```prisma
model OrganizationMembership {
  id             String           @id @default(cuid())
  userId         String
  organizationId String
  role           OrganizationRole @default(MEMBER)
  createdAt      DateTime         @default(now())

  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@unique([userId, organizationId])
}
```

### User Updates
```prisma
model User {
  // ... existing fields
  organizationId   String?
  organizationRole OrganizationRole? @default(MEMBER)

  organization     Organization?     @relation(fields: [organizationId], references: [id])
  memberships      OrganizationMembership[]
}
```

## User Flow

### New User Journey
1. User signs up/logs in via NextAuth
2. OnboardingCheck detects no organization
3. User redirected to `/onboarding`
4. User enters organization name
   - Slug auto-generated from name
   - User can customize slug
5. User reviews and confirms
6. Organization created (transaction)
7. User redirected to `/dashboard`

### Existing User Journey
1. User logs in via NextAuth
2. OnboardingCheck detects existing organization
3. User allowed to proceed to dashboard
4. No onboarding interruption

## Slug Generation

### Auto-generation Logic
```typescript
const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')  // Remove special chars
    .replace(/\s+/g, '-')           // Spaces to hyphens
    .replace(/-+/g, '-')            // Multiple hyphens to single
    .trim()
}
```

### Validation
- Pattern: `^[a-z0-9-]+$`
- Lowercase only
- Alphanumeric and hyphens
- No spaces or special characters
- Must be unique across all organizations

### Examples
- "Acme Inc." → `acme-inc`
- "My Startup 2024!" → `my-startup-2024`
- "Tech--Solutions" → `tech-solutions`

## UI/UX Features

### Glass Morphism Design
```typescript
// Main container
className="backdrop-blur-md bg-white/90 dark:bg-gray-900/90 border-white/20 dark:border-gray-700/30 rounded-2xl shadow-xl"

// Header with gradient
className="bg-gradient-to-r from-indigo-500/80 to-purple-500/80 backdrop-blur-sm text-white"

// Progress bar
className="h-2 bg-gray-200 dark:bg-gray-700"
// Progress fill
className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
```

### Progress Indicator
- Step 1/2: 50% progress bar
- Step 2/2: 100% progress bar
- Visual step labels
- Smooth transitions

### Form Features
- Auto-focus on organization name
- Live slug generation
- Pattern validation on slug input
- Disabled submit until valid
- Loading state during creation
- Error message display

## Security & Data Integrity

### Transaction Safety
All organization creation happens in a single Prisma transaction:
```typescript
await prisma.$transaction(async (tx) => {
  const organization = await tx.organization.create({...})
  await tx.organizationMembership.create({...})
  await tx.user.update({...})
})
```

Benefits:
- Atomic operation (all or nothing)
- No orphaned organizations
- No users without organizations after creation
- Guaranteed OWNER membership

### Authentication
- NextAuth session required
- Auto-redirect to login if unauthenticated
- Session-based user identification
- No organization creation without valid session

## Configuration

### Default Settings
```typescript
const DEFAULT_ORG_SETTINGS = {
  maxUsers: 5,        // FREE plan limit
  maxWidgets: 10,     // FREE plan limit
  allowPublicSharing: false,
  customDomain: null,
  branding: {}
}
```

### Plan Features
```typescript
const FREE_PLAN = {
  name: 'FREE',
  maxUsers: 5,
  maxWidgets: 10,
  features: ['basic-widgets', 'personal-dashboard']
}
```

## Testing

### Manual Testing Checklist
- [ ] New user signup flow
- [ ] Auto-redirect to onboarding
- [ ] Organization name input
- [ ] Slug auto-generation
- [ ] Custom slug editing
- [ ] Slug validation (lowercase, no special chars)
- [ ] Duplicate slug rejection
- [ ] Back button functionality
- [ ] Organization creation
- [ ] Redirect to dashboard after creation
- [ ] Existing user skips onboarding

### Edge Cases
- [ ] User with organization accesses /onboarding (should redirect to dashboard)
- [ ] Unauthenticated user accesses /onboarding (should redirect to login)
- [ ] Network error during creation (should show error, not create partial data)
- [ ] Multiple clicks on create button (loading state prevents)
- [ ] Invalid characters in slug
- [ ] Extremely long organization names

## Future Enhancements

### Multi-step Expansion
```typescript
const steps = [
  'Account Creation',
  'Organization Setup',
  'Team Invites',        // TODO: Add team invite during onboarding
  'Widget Selection',    // TODO: Choose initial widgets
  'Integration Setup'    // TODO: Connect external services
]
```

### Wizard Improvements
- Company size selection
- Industry selection
- Use case selection
- Initial widget recommendations
- Team size estimation
- Invite teammates during onboarding

### Personalization
- Custom welcome messages
- Role-based onboarding paths
- Organization type templates
- Industry-specific defaults

## Related Documentation
- [Team Invite System](../invite/README.md)
- [RBAC System](../../lib/permissions/README.md)
- [SaaS Roadmap](../../SAAS-ROADMAP.md)

## Changelog

### 2025-10-20
- Initial implementation of organization onboarding
- Created 2-step wizard with glass morphism design
- Implemented POST/GET API routes
- Added OnboardingCheck provider
- Auto-generated slug functionality
- Transaction-based organization creation
