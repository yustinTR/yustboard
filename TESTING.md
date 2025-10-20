# Testing Guide

Complete testing documentation for YustBoard's onboarding, invite, and RBAC systems.

## Test Stack

- **Storybook** - Component testing and visual regression
- **Playwright** - End-to-end testing
- **Storybook Test Runner** - Interaction testing

## Quick Start

```bash
# Run Storybook (component testing)
npm run storybook

# Run Storybook tests
npm run test-storybook

# Run Playwright E2E tests
npm run test:e2e

# Run Playwright E2E tests in UI mode
npm run test:e2e:ui

# Run specific test file
npx playwright test e2e/onboarding.spec.ts
```

---

## Storybook Testing

### Overview

Storybook stories serve as:
1. **Visual Documentation** - Interactive component showcase
2. **Interaction Testing** - Test user interactions
3. **Regression Testing** - Visual regression with Chromatic
4. **Development Environment** - Isolated component development

### Available Stories

#### Onboarding Page Stories
**Location**: `app/onboarding/page.stories.tsx`

Stories:
- `Default` - Normal onboarding flow
- `Loading` - Loading state
- `CreatingOrganization` - Submitting state
- `SlugAlreadyExists` - Error: duplicate slug
- `InvalidSlugFormat` - Error: invalid format
- `Unauthenticated` - Redirect to login

**Usage**:
```bash
npm run storybook
# Navigate to Pages > Onboarding
```

#### Invite Page Stories
**Location**: `app/invite/[token]/page.stories.tsx`

Stories:
- `ValidInvite` - Ready to accept/decline
- `Loading` - Loading state
- `ExpiredInvite` - Expired invitation
- `AlreadyAccepted` - Already accepted
- `InvalidInvite` - Invalid token
- `SuccessAccepted` - Success state
- `Accepting` - Accepting in progress
- `AcceptFailed` - Accept failed
- `AdminRoleInvite` - Admin role
- `Unauthenticated` - Redirect to login

**Usage**:
```bash
npm run storybook
# Navigate to Pages > Invite
```

### Writing New Stories

Template:
```typescript
import type { Meta, StoryObj } from '@storybook/nextjs';
import YourComponent from './YourComponent';

const meta = {
  title: 'Category/YourComponent',
  component: YourComponent,
  parameters: {
    layout: 'fullscreen', // or 'centered', 'padded'
  },
  tags: ['autodocs'],
} satisfies Meta<typeof YourComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithMockData: Story = {
  decorators: [
    (Story) => {
      global.fetch = ((url: string) => {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: 'mock' }),
        } as Response);
      }) as typeof globalThis.fetch;

      return <Story />;
    },
  ],
};
```

### Mocking in Storybook

#### Mock Fetch Requests
```typescript
export const WithData: Story = {
  decorators: [
    (Story) => {
      global.fetch = ((url: string) => {
        if (url.includes('/api/data')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ data: [] }),
          } as Response);
        }
        return Promise.reject(new Error('Not found'));
      }) as typeof globalThis.fetch;

      return <Story />;
    },
  ],
};
```

#### Mock NextAuth Session
```typescript
import { SessionProvider } from 'next-auth/react';

export const Authenticated: Story = {
  decorators: [
    (Story) => (
      <SessionProvider
        session={{
          user: {
            id: 'user-123',
            name: 'Test User',
            email: 'test@example.com',
          },
          expires: '2025-12-31',
        }}
      >
        <Story />
      </SessionProvider>
    ),
  ],
};
```

---

## Playwright E2E Testing

### Overview

Playwright tests cover complete user flows across real browsers:
- Chrome/Chromium
- Firefox
- Safari/WebKit
- Mobile browsers

### Test Files

#### Onboarding Tests
**Location**: `e2e/onboarding.spec.ts`

Tests:
- ✅ New user redirect to onboarding
- ✅ Complete onboarding flow
- ✅ Auto-generate slug from name
- ✅ Custom slug editing
- ✅ Slug format validation
- ✅ Duplicate slug error
- ✅ Back button navigation
- ✅ Prevent org users from accessing onboarding
- ✅ Loading states

#### Invite Tests
**Location**: `e2e/invite.spec.ts`

Tests:
- ✅ Display invite details
- ✅ Accept invite successfully
- ✅ Decline invite successfully
- ✅ Expired invite state
- ✅ Already accepted state
- ✅ Invalid token error
- ✅ Redirect unauthenticated users
- ✅ ADMIN role invite
- ✅ Loading states

#### RBAC Tests
**Location**: `e2e/rbac.spec.ts`

Tests:
- ✅ OWNER can send invites
- ✅ ADMIN can send invites
- ✅ MEMBER cannot send invites
- ✅ VIEWER cannot send invites
- ✅ OWNER can delete organization
- ✅ ADMIN cannot delete organization
- ✅ MEMBER can create/edit own tasks
- ✅ VIEWER cannot create tasks

### Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run in UI mode (recommended for development)
npm run test:e2e:ui

# Run specific test file
npx playwright test e2e/onboarding.spec.ts

# Run specific test
npx playwright test e2e/onboarding.spec.ts -g "should complete onboarding"

# Run in headed mode (see browser)
npx playwright test --headed

# Run in debug mode
npx playwright test --debug

# Run only on chromium
npx playwright test --project=chromium

# Generate test report
npx playwright show-report
```

### Writing E2E Tests

Template:
```typescript
import { test, expect } from '@playwright/test';
import {
  createTestUser,
  cleanupTestUser,
  disconnect,
} from './helpers/database';

test.describe('Feature Name', () => {
  const testUser = {
    email: `test-${Date.now()}@example.com`,
    name: 'Test User',
  };

  test.beforeEach(async () => {
    await cleanupTestUser(testUser.email);
  });

  test.afterEach(async () => {
    await cleanupTestUser(testUser.email);
  });

  test.afterAll(async () => {
    await disconnect();
  });

  test('should do something', async ({ page }) => {
    // Setup
    await createTestUser(testUser);

    // Navigate
    await page.goto('/your-page');

    // Interact
    await page.fill('input[name="field"]', 'value');
    await page.click('button[type="submit"]');

    // Assert
    await expect(page).toHaveURL('/expected-url');
    await expect(page.locator('text=Success')).toBeVisible();
  });
});
```

### Database Helpers

Located in `e2e/helpers/database.ts`:

```typescript
// Create test user
const user = await createTestUser({
  email: 'test@example.com',
  name: 'Test User',
});

// Create test organization
const org = await createTestOrganization({
  name: 'Test Org',
  slug: 'test-org',
  ownerId: user.id,
});

// Create test invite
const invite = await createTestInvite({
  organizationId: org.id,
  email: 'member@test.com',
  role: 'MEMBER',
  expiresInDays: 7,
});

// Cleanup
await cleanupTestUser('test@example.com');
await cleanupTestOrganization('test-org');
await disconnect();
```

### Authentication Helpers

Located in `e2e/helpers/auth.ts`:

```typescript
import { login, logout, isAuthenticated } from './helpers/auth';

// Login
await login(page, {
  email: 'test@example.com',
  password: 'password123',
});

// Logout
await logout(page);

// Check auth status
const authenticated = await isAuthenticated(page);
```

---

## Test Data Management

### Database Isolation

Each test should:
1. Clean up before running (`beforeEach`)
2. Clean up after running (`afterEach`)
3. Use unique identifiers (timestamps, random values)

```typescript
const testData = {
  email: `test-${Date.now()}@example.com`,
  slug: `test-org-${Date.now()}`,
};
```

### Avoiding Conflicts

- Use unique emails and slugs with timestamps
- Clean up in both `beforeEach` and `afterEach`
- Use transactions where possible
- Don't rely on specific database state

---

## CI/CD Integration

### GitHub Actions

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

### Chromatic (Visual Regression)

```bash
# Run Chromatic build
npm run chromatic

# Environment variable needed
CHROMATIC_PROJECT_TOKEN=your-token
```

---

## Best Practices

### Storybook

1. **Cover All States** - Loading, error, empty, success
2. **Mock External Dependencies** - APIs, auth, etc.
3. **Use Decorators** - For common wrappers (session, router)
4. **Document Props** - Use `tags: ['autodocs']`
5. **Test Interactions** - User clicks, form submissions

### Playwright

1. **Clean Up Data** - Always clean before and after
2. **Use Helpers** - Reuse database and auth helpers
3. **Wait for Elements** - Use `waitForSelector`, `waitForURL`
4. **Test Multiple Browsers** - Don't just test Chromium
5. **Screenshot on Failure** - Configured automatically
6. **Unique Test Data** - Use timestamps for uniqueness

### General

1. **Test User Flows** - Not implementation details
2. **Avoid Flaky Tests** - Use proper waits, not timeouts
3. **Keep Tests Fast** - Parallelize where possible
4. **Document Test Intent** - Clear test names and comments
5. **Update Tests with Features** - Keep in sync with code

---

## Debugging

### Storybook

```bash
# Run Storybook in dev mode
npm run storybook

# Open specific story
# Navigate to story and inspect in browser DevTools
```

### Playwright

```bash
# Debug mode (step through tests)
npx playwright test --debug

# UI mode (interactive)
npm run test:e2e:ui

# Headed mode (see browser)
npx playwright test --headed

# Trace viewer (after test with trace)
npx playwright show-trace trace.zip
```

### Common Issues

#### "Test timed out"
- Increase timeout in test
- Check network requests are mocked
- Verify selectors are correct

#### "Element not found"
- Use `page.waitForSelector()` before interacting
- Check if element is in viewport
- Verify correct selector

#### "Database conflict"
- Ensure cleanup is running
- Use unique test data (timestamps)
- Check for orphaned data in database

---

## Coverage

### Current Coverage

- ✅ Onboarding flow (8 tests)
- ✅ Invite system (10 tests)
- ✅ RBAC permissions (8 tests)
- ✅ All UI states (Storybook)

### Areas to Expand

- [ ] Organization settings
- [ ] Member management
- [ ] Billing flows
- [ ] Dashboard widgets
- [ ] Multi-organization switching

---

## Resources

- [Storybook Docs](https://storybook.js.org/docs)
- [Playwright Docs](https://playwright.dev)
- [Testing Best Practices](https://playwright.dev/docs/best-practices)
- [Storybook Testing](https://storybook.js.org/docs/writing-tests/introduction)

---

## Getting Help

If tests are failing:

1. Check test output for specific errors
2. Run in debug/UI mode to see what's happening
3. Verify database state in Prisma Studio
4. Check if recent code changes affected tested functionality
5. Review this documentation for common issues
