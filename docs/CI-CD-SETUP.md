# 🚀 CI/CD Pipeline Setup Guide

## Overview

YustBoard uses a comprehensive GitHub Actions CI/CD pipeline that ensures code quality, security, and reliable deployments.

## Pipeline Features

### ✅ **Automated Quality Checks**
- **ESLint**: Code style and quality validation
- **TypeScript**: Type checking across the entire codebase
- **Security Audit**: npm audit for vulnerability scanning
- **Bundle Analysis**: Build size monitoring and optimization

### 🧪 **Testing Suite**
- **Unit Tests**: Component and utility function testing with Jest
- **Integration Tests**: API route testing with mocked database
- **E2E Tests**: Full user journey testing with Playwright
- **Coverage Reports**: Automatic coverage reporting to Codecov

### 🏗️ **Build & Deploy**
- **Production**: Automatic deployment to Vercel on `main` branch
- **Staging**: Preview deployments on `develop` branch
- **Storybook**: Component library deployed to GitHub Pages
- **Performance**: Lighthouse CI for performance monitoring

### 📊 **Monitoring & Notifications**
- **Slack Integration**: Deployment notifications
- **Release Management**: Automatic GitHub releases
- **Performance Tracking**: Lighthouse scores and metrics

## GitHub Secrets Setup

Add these secrets to your GitHub repository settings:

### Required Secrets
```bash
# NextAuth Configuration
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=https://yourdomain.com

# Vercel Deployment
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-vercel-org-id
VERCEL_PROJECT_ID=your-vercel-project-id

# Database (for testing)
DATABASE_URL=postgresql://user:pass@localhost:5432/yustboard_test

# Optional: Notifications
SLACK_WEBHOOK=your-slack-webhook-url

# Optional: Code Coverage
CODECOV_TOKEN=your-codecov-token
```

### How to get these secrets:

1. **Vercel Tokens**:
   - Go to Vercel Dashboard → Settings → Tokens
   - Create a new token with deployment permissions

2. **Org/Project IDs**:
   ```bash
   npx vercel link
   # This will show your org and project IDs
   ```

3. **Slack Webhook**:
   - Create a Slack app
   - Add incoming webhook integration
   - Copy webhook URL

## Workflow Triggers

### Automatic Triggers
- **Push to `main`**: Full pipeline + production deployment
- **Push to `develop`**: Full pipeline + staging deployment
- **Pull Requests**: Quality checks + testing (no deployment)

### Manual Triggers
- **Repository Dispatch**: Custom workflow triggers
- **Workflow Dispatch**: Manual pipeline runs

## Branch Strategy

```
main (production)
├── develop (staging)
│   ├── feature/new-widget
│   ├── feature/dashboard-improvements
│   └── bugfix/auth-issue
└── hotfix/critical-security-fix
```

### Workflow:
1. Create feature branch from `develop`
2. Open PR to `develop` → triggers quality checks
3. Merge to `develop` → deploys to staging
4. Open PR from `develop` to `main` → final review
5. Merge to `main` → deploys to production + creates release

## Quality Gates

### Pipeline must pass these checks:
- ✅ ESLint (no errors)
- ✅ TypeScript compilation
- ✅ Unit tests (>80% coverage)
- ✅ Integration tests
- ✅ Build succeeds
- ✅ Security audit (no high/critical vulnerabilities)

### Performance Requirements:
- 🚀 Lighthouse Performance Score: >80
- ♿ Accessibility Score: >90
- 🔧 Best Practices Score: >90
- 🔍 SEO Score: >90

## Local Testing

Run the same checks locally before pushing:

```bash
# Quality checks
npm run lint
npm run typecheck
npm run security:audit

# Testing
npm run test:unit
npm run test:integration
npm run test:e2e

# Build verification
npm run build
npm run build-storybook
```

## Deployment Environments

### Production (`main` branch)
- **URL**: https://yustboard.com
- **Database**: Production PostgreSQL
- **Monitoring**: Full error tracking + analytics
- **Caching**: Redis enabled
- **Security**: Rate limiting + security headers

### Staging (`develop` branch)
- **URL**: https://staging.yustboard.com
- **Database**: Staging PostgreSQL (sanitized prod data)
- **Monitoring**: Error tracking enabled
- **Features**: Feature flags for testing

### Preview (Pull Requests)
- **URL**: Auto-generated Vercel preview URL
- **Database**: Separate test database
- **Purpose**: Review changes before merge

## Monitoring & Alerts

### Slack Notifications
Automatic notifications for:
- ✅ Successful deployments
- ❌ Failed builds
- 🚀 New releases
- 📊 Performance degradation

### GitHub Integration
- ✅ Status checks on PRs
- 📊 Build status badges
- 📝 Automatic release notes
- 🏷️ Version tagging

## Troubleshooting

### Common Issues:

**Build fails on dependencies:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Tests fail in CI but pass locally:**
```bash
# Run tests in CI environment
CI=true npm test
```

**Deployment fails:**
```bash
# Check Vercel logs
npx vercel logs
```

**Security audit fails:**
```bash
# Fix vulnerabilities
npm audit fix
# Or for breaking changes:
npm audit fix --force
```

### Getting Help:
- Check GitHub Actions logs for detailed error messages
- Review Vercel deployment logs
- Consult the team in #development Slack channel

## Performance Optimization

### Bundle Analysis:
```bash
npm run analyze
```

### Lighthouse Testing:
```bash
npx lhci autorun
```

### Coverage Reports:
```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

## Security

### Automated Security:
- npm audit on every push
- Dependency vulnerability scanning
- Secret scanning (GitHub Advanced Security)
- CodeQL analysis for security issues

### Manual Security Reviews:
- Review all external dependencies
- Audit environment variables
- Check API security headers
- Validate authentication flows

---

## Next Steps

1. **Setup secrets** in GitHub repository settings
2. **Create first PR** to test the pipeline
3. **Monitor deployments** and performance
4. **Iterate** on feedback from quality gates

For questions or improvements to this CI/CD setup, please open an issue or contact the development team.