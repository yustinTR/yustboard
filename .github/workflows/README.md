# GitHub Actions Workflows

This directory contains CI/CD workflows for automated testing and deployment.

## Workflows Overview

### 🧪 E2E Tests (`e2e-tests.yml`)

**Triggers**: Push to `main`/`develop`, PRs to `main`/`develop`

Runs Playwright end-to-end tests against a PostgreSQL database.

**Features**:
- PostgreSQL service container
- Full database setup with Prisma
- Playwright browser installation
- Next.js build
- E2E test execution
- Artifact uploads (reports, screenshots, traces)
- PR comments on failure

**Duration**: ~10-15 minutes

**Requirements**:
- No secrets needed (uses default test credentials)
- PostgreSQL service automatically provisioned

### 🎯 Full Test Suite (`test-all.yml`)

**Triggers**: Push to `main`, PRs to `main`, manual dispatch

Comprehensive testing workflow that runs all tests in parallel.

**Jobs**:
1. **Build & Type Check**
   - TypeScript type checking
   - ESLint
   - Next.js build

2. **E2E Tests** (Sharded)
   - Runs Playwright tests in 3 parallel shards
   - Faster execution (~5 min per shard vs 15 min sequential)
   - Blob report merging

3. **Storybook Tests**
   - Component interaction tests
   - Visual regression (via Storybook test runner)

4. **Test Status**
   - Final status check
   - Fails if any job fails

**Duration**: ~15-20 minutes (parallel execution)

### 🎨 Storybook Tests (`storybook-tests.yml`)

**Triggers**: Push to `main`/`develop`, PRs to `main`/`develop`

Runs Storybook component interaction tests.

**Duration**: ~5-7 minutes

### 🌈 Chromatic (`chromatic.yml`)

**Triggers**: Push to `main`/`develop`, PRs to `main`/`develop`

Visual regression testing with Chromatic.

**Requirements**:
- `CHROMATIC_PROJECT_TOKEN` secret must be set

**Duration**: ~8-10 minutes

---

## Workflow Usage

### Running Tests Locally (Simulate CI)

```bash
# Simulate E2E test workflow
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/yustboard_test" \
NEXTAUTH_URL="http://localhost:3000" \
NEXTAUTH_SECRET="test-secret" \
CI=true \
npm run test:e2e

# Simulate Storybook test workflow
npm run build-storybook
npx http-server storybook-static --port 6006 &
npx wait-on tcp:6006
npm run test-storybook
```

### Viewing Test Reports

After workflow completion:

1. Go to Actions tab
2. Click on workflow run
3. Scroll to "Artifacts" section
4. Download `playwright-report` or `test-results`
5. Extract and open `index.html` or run:
   ```bash
   npx playwright show-report path/to/playwright-report
   ```

### Debugging Failed Tests

**E2E Tests**:
```bash
# Download artifacts from failed run
# Extract playwright-report.zip
npx playwright show-report ./playwright-report

# Check screenshots in test-results/
```

**Storybook Tests**:
```bash
# Run locally with same setup
npm run build-storybook
npx http-server storybook-static --port 6006 &
npm run test-storybook
```

---

## Configuration

### Environment Variables

All workflows use these environment variables in CI:

```yaml
DATABASE_URL: postgresql://postgres:postgres@localhost:5432/yustboard_test
NEXTAUTH_URL: http://localhost:3000
NEXTAUTH_SECRET: test-secret-key-for-ci-only
CI: true
```

### Secrets Required

| Secret | Used By | Required |
|--------|---------|----------|
| `CHROMATIC_PROJECT_TOKEN` | chromatic.yml | Yes |
| None for E2E tests | e2e-tests.yml | No |

### Services

**PostgreSQL** (E2E Tests):
```yaml
services:
  postgres:
    image: postgres:16
    env:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: yustboard_test
    ports:
      - 5432:5432
```

---

## Optimization Tips

### Faster E2E Tests

**Option 1: Sharding** (Already implemented in `test-all.yml`)
```yaml
strategy:
  matrix:
    shard: [1, 2, 3]
steps:
  - run: npx playwright test --shard=${{ matrix.shard }}/3
```

**Option 2: Only Chromium in CI**
```yaml
- run: npx playwright install --with-deps chromium
- run: npx playwright test --project=chromium
```

**Option 3: Skip Build Cache**
```yaml
- uses: actions/cache@v4
  with:
    path: |
      ~/.npm
      .next/cache
    key: ${{ runner.os }}-nextjs-${{ hashFiles('**/package-lock.json') }}
```

### Reduce Artifact Storage

Artifacts consume GitHub storage. Adjust retention:

```yaml
- uses: actions/upload-artifact@v4
  with:
    retention-days: 7  # Default is 30
```

Or only upload on failure:
```yaml
- uses: actions/upload-artifact@v4
  if: failure()
```

---

## Troubleshooting

### PostgreSQL Connection Issues

**Error**: `ECONNREFUSED localhost:5432`

**Solution**: Ensure service is healthy before tests
```yaml
services:
  postgres:
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5
```

### Playwright Browser Installation Timeout

**Error**: `browserType.launch: Timeout 30000ms exceeded`

**Solution**: Increase timeout
```yaml
- run: npx playwright install --with-deps
  timeout-minutes: 10
```

### Out of Memory

**Error**: `JavaScript heap out of memory`

**Solution**: Increase Node memory
```yaml
- run: NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### Database Schema Mismatch

**Error**: `Invalid `prisma.user.findUnique()` invocation`

**Solution**: Ensure Prisma push runs before tests
```yaml
- run: |
    npx prisma generate
    npx prisma db push --skip-generate
```

---

## Adding New Workflows

### Template for New Test Workflow

```yaml
name: My New Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    name: Run My Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run my-test-command
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-results
          path: test-results/
```

---

## Best Practices

1. **Always use `npm ci`** instead of `npm install` in CI
2. **Cache dependencies** with `actions/setup-node` cache option
3. **Upload artifacts on failure** for debugging
4. **Use timeouts** to prevent hung jobs
5. **Run tests in parallel** when possible (sharding)
6. **Clean up old artifacts** with retention policies
7. **Comment on PRs** with test results for visibility

---

## Status Badges

Add to your README.md:

```markdown
[![E2E Tests](https://github.com/YOUR_USERNAME/yustboard/actions/workflows/e2e-tests.yml/badge.svg)](https://github.com/YOUR_USERNAME/yustboard/actions/workflows/e2e-tests.yml)
[![Storybook Tests](https://github.com/YOUR_USERNAME/yustboard/actions/workflows/storybook-tests.yml/badge.svg)](https://github.com/YOUR_USERNAME/yustboard/actions/workflows/storybook-tests.yml)
```

---

For more information, see [TESTING.md](../../TESTING.md) in the project root.
