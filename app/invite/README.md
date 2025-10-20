# Team Invite System

Complete implementation of the team invitation and acceptance flow for YustBoard's multi-tenant SaaS architecture.

## Overview

The team invite system allows organization owners and admins to invite new members to their organizations via email invitations with secure token-based acceptance.

## Architecture

### Components

#### 1. Invite Acceptance Page
**Location**: `/app/invite/[token]/page.tsx`

A client-side page that handles the complete invite acceptance flow with beautiful glass morphism design.

**Features**:
- Token-based invite validation
- Multiple state handling:
  - Loading state while fetching invite
  - Expired invite detection
  - Already accepted invite detection
  - Invalid invite error handling
  - Success state with auto-redirect
- Auto-redirect to login for unauthenticated users
- Glass morphism design matching app aesthetic

**States**:
```typescript
interface InviteData {
  id: string
  email: string
  role: string
  organization: {
    name: string
    slug: string
  }
  expiresAt: string
  isExpired: boolean
  isAccepted: boolean
}
```

#### 2. API Routes

##### GET /api/invite/[token]
Fetches invite details by token.

**Response**:
```json
{
  "invite": {
    "id": "cuid",
    "email": "user@example.com",
    "role": "MEMBER",
    "organization": {
      "name": "Acme Inc",
      "slug": "acme-inc"
    },
    "expiresAt": "2025-11-20T00:00:00.000Z",
    "isExpired": false,
    "isAccepted": false
  }
}
```

**Errors**:
- `404` - Invite not found
- `404` - Invalid invite (organization not found)

##### POST /api/invite/[token]/accept
Accepts an invite and creates organization membership.

**Security**:
- Requires authentication (uses `requireAuth` RBAC middleware)
- Validates invite exists and is not expired
- Prevents duplicate acceptance
- Transaction-based for data consistency

**Process**:
1. Validates user is authenticated
2. Fetches invite and checks validity
3. Creates `OrganizationMembership` record
4. Updates user's `organizationId` and `organizationRole`
5. Marks invite as accepted (`acceptedAt`)

**Response**:
```json
{
  "message": "Invite accepted successfully",
  "organization": {
    "id": "cuid",
    "name": "Acme Inc",
    "slug": "acme-inc"
  },
  "membership": {
    "userId": "user-id",
    "organizationId": "org-id",
    "role": "MEMBER"
  }
}
```

**Errors**:
- `404` - Invite not found
- `400` - Invite expired
- `400` - Invite already accepted
- `400` - Invalid invite (no organization)

##### POST /api/invite/[token]/decline
Declines and deletes an invite.

**Process**:
1. Validates invite exists and is not expired
2. Prevents declining already accepted invites
3. Deletes the invite record

**Response**:
```json
{
  "message": "Invite declined successfully"
}
```

**Errors**:
- `404` - Invite not found
- `400` - Invite expired
- `400` - Invite already accepted

## Database Schema

The invite system uses the `OrganizationInvite` model:

```prisma
model OrganizationInvite {
  id             String             @id @default(cuid())
  organizationId String?
  email          String
  role           OrganizationRole   @default(MEMBER)
  token          String             @unique
  expiresAt      DateTime
  acceptedAt     DateTime?
  createdAt      DateTime           @default(now())
  organization   Organization?      @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@unique([organizationId, email])
  @@index([token])
  @@index([email])
}
```

## Usage Flow

### 1. Creating an Invite (Admin/Owner)
```typescript
// POST /api/organization/invite
const response = await fetch('/api/organization/invite', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'newmember@example.com',
    role: 'MEMBER'
  })
})
```

### 2. Invite Email (TODO: Future Implementation)
```typescript
// TODO: Send email with invite link
const inviteUrl = `https://yustboard.com/invite/${token}`
await sendInviteEmail(email, inviteUrl, organization)
```

### 3. Accepting an Invite (User)
User clicks invite link → Auto-redirects to login if needed → Shows invite details → User clicks "Accept" → Membership created → Redirect to dashboard

### 4. Declining an Invite (User)
User clicks invite link → Shows invite details → User clicks "Decline" → Invite deleted → Redirect to home

## Security Features

1. **Token-based Security**
   - Cryptographically secure tokens
   - Single-use (marked as accepted)
   - Time-limited expiration

2. **Authentication**
   - RBAC `requireAuth` middleware
   - Session validation
   - Auto-redirect to login

3. **Validation**
   - Expiration checking
   - Duplicate acceptance prevention
   - Organization existence validation

4. **Data Integrity**
   - Transaction-based acceptance
   - Atomic membership creation
   - Cascade delete on organization removal

## UI/UX Features

### Glass Morphism Design
```typescript
// Container
className="backdrop-blur-md bg-white/90 dark:bg-gray-900/90 border-white/20 dark:border-gray-700/30 shadow-xl"

// Organization info card
className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700/30 rounded-lg p-4"

// Accept button with gradient
className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
```

### State-based UI
- **Loading**: Animated spinner with backdrop
- **Expired**: Orange gradient background with warning icon
- **Accepted**: Blue gradient background with success icon
- **Success**: Green gradient background with checkmark and auto-redirect
- **Error**: Red gradient background with error icon

## Future Enhancements

### Email Notifications (TODO)
```typescript
// In accept route
await sendInviteAcceptedEmail(invite.organizationId, user?.email)

// In decline route
await sendInviteDeclinedEmail(invite.organizationId, invite.email)
```

### Invite Management UI
- List pending invites in organization settings
- Resend invite emails
- Cancel/revoke invites
- Invite expiration customization

### Advanced Features
- Bulk invites (CSV upload)
- Custom invite messages
- Role-specific onboarding
- Invite link sharing restrictions

## Testing

### Manual Testing Checklist
- [ ] Create invite as admin
- [ ] Access invite link while logged out (should redirect to login)
- [ ] Access invite link while logged in
- [ ] Accept valid invite (should create membership)
- [ ] Try to accept same invite again (should show already accepted)
- [ ] Access expired invite (should show expired state)
- [ ] Decline invite (should delete invite)
- [ ] Check dashboard shows correct organization after acceptance

### Edge Cases
- [ ] Invalid token (should show error)
- [ ] Deleted organization (should show error)
- [ ] User already member of organization
- [ ] Multiple pending invites for same user

## Related Documentation
- [RBAC System](../../lib/permissions/README.md)
- [Organization Onboarding](../onboarding/README.md)
- [SaaS Roadmap](../../SAAS-ROADMAP.md)

## Changelog

### 2025-10-20
- Initial implementation of team invite system
- Created invite acceptance page with glass morphism design
- Implemented GET/accept/decline API routes
- Added RBAC security middleware
- Added email notification placeholders
