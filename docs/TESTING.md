# Testing Documentation

This document provides comprehensive information about the testing infrastructure for YustBoard.

## Table of Contents

- [Overview](#overview)
- [Test Types](#test-types)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [CI/CD Integration](#cicd-integration)
- [Coverage Reports](#coverage-reports)
- [Best Practices](#best-practices)

## Overview

YustBoard uses a multi-layered testing strategy to ensure code quality, security, accessibility, and performance:

- **Unit Tests** - Test individual functions and components in isolation
- **Integration Tests** - Test API endpoints and database interactions
- **E2E Tests** - Test complete user flows with Playwright
- **Accessibility Tests** - Test components for WCAG compliance
- **Security Scans** - Automated vulnerability and secret scanning
- **Performance Audits** - Lighthouse CI for web vitals monitoring

## Test Types

### 1. Unit Tests (Vitest)

**Location**: `**/*.test.ts`, `**/*.test.tsx`

**Framework**: [Vitest](https://vitest.dev/) with happy-dom environment

**Coverage**: 60% minimum threshold (lines, functions, branches, statements)

**Examples**:
- `lib/permissions/check.test.ts` - RBAC permission logic (29 tests)
- `lib/stripe/config.test.ts` - Billing plan configuration (28 tests)

**Run commands**:
```bash
npm run test:unit              # Run once
npm run test:unit:watch        # Watch mode
npm run test:unit:ui           # UI mode (interactive)
npm run test:coverage          # With coverage report
```

### 2. Integration Tests (API Routes)

**Location**: `app/api/**/*.test.ts`

**Purpose**: Test API endpoints with mocked database and authentication

**Examples**:
- `app/api/organization/route.test.ts` - Organization CRUD operations
- `app/api/organization/invite/route.test.ts` - Team invite system

**Key features**:
- Mock next-auth sessions
- Mock Prisma database calls
- Test authentication/authorization
- Validate request/response formats

### 3. E2E Tests (Playwright)

**Location**: `e2e/**/*.spec.ts`

**Framework**: [Playwright](https://playwright.dev/)

**Run commands**:
```bash
npm run test:e2e               # Run all E2E tests
npm run test:e2e:ui            # Interactive UI mode
npm run test:e2e:headed        # With browser visible
npm run test:e2e:debug         # Debug mode
```

**Features**:
- Multi-browser testing (Chromium, Firefox, WebKit)
- Parallel execution with sharding
- Visual regression testing
- Network mocking

### 4. Accessibility Tests (jest-axe)

**Location**: `components/**/*.test.tsx`

**Framework**: [jest-axe](https://github.com/nickcolley/jest-axe)

**Standards**: WCAG 2.1 Level AA

**Examples**:
- `components/organisms/Sidebar.test.tsx` - Navigation accessibility
- `components/organisms/Header.test.tsx` - Header landmarks and headings

**What we test**:
- ARIA attributes and roles
- Keyboard navigation
- Color contrast
- Heading hierarchy
- Form labels
- Alt text for images

### 5. Component Tests (Storybook)

**Location**: `**/*.stories.tsx`

**Framework**: [Storybook](https://storybook.js.org/)

**Run commands**:
```bash
npm run storybook              # Start dev server
npm run build-storybook        # Build static version
npm run test-storybook         # Run interaction tests
```

### 6. Security Scanning

**Workflow**: `.github/workflows/security-scan.yml`

**Tools**:
- **NPM Audit** - Checks for known vulnerabilities in dependencies
- **CodeQL** - Static analysis for security issues
- **TruffleHog** - Secret scanning in git history
- **Dependency Review** - Analyzes new dependencies in PRs
- **Prisma Validation** - Schema validation and security

**Schedule**: Runs on every push/PR + weekly on Mondays

### 7. Performance Audits (Lighthouse CI)

**Workflow**: `.github/workflows/lighthouse.yml`

**Configuration**: `lighthouserc.json`

**Thresholds**:
- Performance: ≥80
- Accessibility: ≥90
- Best Practices: ≥85
- SEO: ≥85

**Metrics**:
- First Contentful Paint (FCP): ≤2000ms
- Largest Contentful Paint (LCP): ≤2500ms
- Cumulative Layout Shift (CLS): ≤0.1
- Total Blocking Time (TBT): ≤300ms
- Speed Index: ≤3000ms

## Running Tests

### Local Development

```bash
# Run all tests
npm run test:all

# Run specific test types
npm run test:unit
npm run test:e2e
npm run test-storybook

# Watch mode for TDD
npm run test:unit:watch

# Interactive UI mode
npm run test:unit:ui
npm run test:e2e:ui

# Coverage reports
npm run test:coverage
```

### CI/CD Pipelines

**Main Branch** (`test-all.yml`):
1. Build & Type Check
2. Unit Tests (with coverage)
3. E2E Tests (sharded 3-way)
4. Storybook Tests
5. Report aggregation

**Develop Branch** (`e2e-tests.yml`):
1. Unit Tests
2. E2E Tests

**Pull Requests**:
- All test suites run automatically
- Lighthouse CI comments on PRs
- Security scans check new dependencies
- Test results posted as PR comments

## Writing Tests

### Unit Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { hasPermission } from './check';

describe('Permission Checks', () => {
  it('should allow OWNER all permissions', () => {
    expect(hasPermission('OWNER', 'organization:update')).toBe(true);
  });

  it('should deny MEMBER from managing organization', () => {
    expect(hasPermission('MEMBER', 'organization:update')).toBe(false);
  });
});
```

### Accessibility Test Example

```typescript
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { MyComponent } from './MyComponent';

expect.extend(toHaveNoViolations);

describe('MyComponent Accessibility', () => {
  it('should not have accessibility violations', async () => {
    const { container } = render(<MyComponent />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### API Integration Test Example

```typescript
import { describe, it, expect, vi } from 'vitest';
import { GET } from './route';
import { getServerSession } from 'next-auth';

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

describe('API Route', () => {
  it('should return 401 if not authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });
});
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test';

test('user can login and view dashboard', async ({ page }) => {
  await page.goto('/login');

  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('h1')).toContainText('Dashboard');
});
```

## CI/CD Integration

### GitHub Actions Workflows

**1. Full Test Suite** (`.github/workflows/test-all.yml`)
- Runs on: Push to main, PRs to main
- Jobs: Build, Unit, E2E (sharded), Storybook, Status
- Artifacts: Coverage reports, Playwright reports

**2. E2E Tests** (`.github/workflows/e2e-tests.yml`)
- Runs on: Push to main/develop, PRs
- Jobs: Unit tests, E2E tests
- Artifacts: Test results, Playwright reports

**3. Security Scan** (`.github/workflows/security-scan.yml`)
- Runs on: Push, PRs, Weekly schedule, Manual trigger
- Jobs: NPM Audit, CodeQL, Secret Scan, Dependency Review
- Reports: GitHub Security tab

**4. Lighthouse CI** (`.github/workflows/lighthouse.yml`)
- Runs on: PRs, Manual trigger
- Jobs: Performance audit on key pages
- Output: PR comments with scores, Artifact reports

### Environment Variables for CI

```yaml
DATABASE_URL: postgresql://postgres:postgres@localhost:5432/yustboard_test
DIRECT_URL: postgresql://postgres:postgres@localhost:5432/yustboard_test
NEXTAUTH_URL: http://localhost:3000
NEXTAUTH_SECRET: test-secret-key-for-ci-only
CI: true
```

## Coverage Reports

### Viewing Coverage Locally

```bash
npm run test:coverage
```

Coverage reports are generated in:
- `coverage/` - HTML report (open `coverage/index.html`)
- Console output with summary

### Coverage Thresholds

```json
{
  "lines": 60,
  "functions": 60,
  "branches": 60,
  "statements": 60
}
```

### Coverage in CI

- Unit test coverage is uploaded as GitHub Actions artifact
- Available for 30 days
- Download from workflow run page

## Best Practices

### General Testing Principles

1. **Test Behavior, Not Implementation**
   - Focus on what users see and do
   - Avoid testing internal state

2. **Arrange-Act-Assert (AAA) Pattern**
   ```typescript
   it('should do something', () => {
     // Arrange - Set up test data
     const input = { name: 'Test' };

     // Act - Execute the code
     const result = myFunction(input);

     // Assert - Verify the result
     expect(result).toBe(expected);
   });
   ```

3. **One Assertion Per Test** (when possible)
   - Makes failures easier to debug
   - Tests remain focused

4. **Use Descriptive Test Names**
   - `it('should allow OWNER to update organization')`
   - Not: `it('test owner permissions')`

### Unit Testing

- **Mock External Dependencies**
  - Database calls (Prisma)
  - API calls (fetch)
  - Authentication (next-auth)

- **Test Edge Cases**
  - Empty inputs
  - Invalid data
  - Boundary values
  - Error conditions

- **Keep Tests Fast**
  - No real database connections
  - No network calls
  - Mock time-dependent code

### Integration Testing

- **Test Happy Path First**
  - Successful operations
  - Expected workflows

- **Then Test Error Cases**
  - Authentication failures
  - Authorization failures
  - Validation errors
  - Database errors

- **Validate Response Shapes**
  - Correct status codes
  - Expected fields in response
  - Error message formats

### E2E Testing

- **Test Critical User Flows**
  - Registration → Login → Dashboard
  - Creating/editing content
  - Payment flows

- **Use Data Test IDs**
  ```tsx
  <button data-testid="submit-button">Submit</button>
  ```
  ```typescript
  await page.getByTestId('submit-button').click();
  ```

- **Handle Async Operations**
  ```typescript
  await expect(page.locator('.success')).toBeVisible();
  ```

### Accessibility Testing

- **Test Every Component**
  - Run axe on all UI components
  - Check keyboard navigation
  - Verify ARIA attributes

- **Test Different States**
  - Default state
  - Disabled state
  - Error state
  - Loading state

- **Manual Testing**
  - Use screen reader (VoiceOver, NVDA)
  - Navigate with keyboard only
  - Check color contrast tools

### Security Testing

- **Never Commit Secrets**
  - Use environment variables
  - Add secrets to .gitignore
  - Use .env.example for templates

- **Review Dependencies**
  - Check npm audit regularly
  - Keep dependencies updated
  - Review security advisories

- **Validate Input**
  - Test SQL injection attempts
  - Test XSS vectors
  - Test authentication bypass

## Troubleshooting

### Common Issues

**1. Tests Pass Locally But Fail in CI**
- Check environment variables
- Verify Node.js version matches
- Check for race conditions
- Look for absolute paths

**2. Flaky E2E Tests**
- Add explicit waits: `await page.waitForSelector()`
- Use `waitForLoadState('networkidle')`
- Increase timeout for slow operations
- Check for animation timing issues

**3. Coverage Not Meeting Threshold**
- Identify uncovered lines: Check HTML report
- Add missing test cases
- Consider excluding test utilities from coverage

**4. Accessibility Violations**
- Read axe error message carefully
- Check WCAG guidelines
- Use browser DevTools accessibility panel
- Test with real screen readers

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [jest-axe Documentation](https://github.com/nickcolley/jest-axe)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)
- [Testing Library Best Practices](https://testing-library.com/docs/queries/about)

## Contributing

When adding new features:

1. ✅ Write unit tests for business logic
2. ✅ Write integration tests for API endpoints
3. ✅ Write accessibility tests for UI components
4. ✅ Add E2E tests for critical flows
5. ✅ Create Storybook stories for reusable components
6. ✅ Ensure all tests pass locally
7. ✅ Verify build succeeds: `npm run build`
8. ✅ Check coverage meets threshold

## Support

If you have questions about testing:
- Check this documentation
- Review existing test examples
- Ask in team discussions
- Create an issue for test infrastructure bugs
