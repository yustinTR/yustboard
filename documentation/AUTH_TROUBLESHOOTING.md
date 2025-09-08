# Authentication Troubleshooting Guide

This guide covers common authentication issues and their solutions in YustBoard.

## RefreshAccessTokenError on Production

### Problem
Users see `RefreshAccessTokenError` in the URL when trying to log in on production:
```
https://yourdomain.com/login?error=RefreshAccessTokenError
```

### Causes
1. **Expired Refresh Tokens**: Google refresh tokens can expire after 7 days of inactivity or when user changes password
2. **Invalid Grant Error**: The `invalid_grant` error from Google OAuth API indicates the refresh token is no longer valid
3. **Missing Environment Variables**: Incorrect `GOOGLE_CLIENT_ID` or `GOOGLE_CLIENT_SECRET` on production

### Solutions

#### 1. Environment Variables Check
Ensure these are correctly set in production:
```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=strong_random_secret
```

#### 2. Google OAuth Console Configuration
Verify in [Google Cloud Console](https://console.cloud.google.com/):
- **Authorized JavaScript origins**: `https://yourdomain.com`
- **Authorized redirect URIs**: `https://yourdomain.com/api/auth/callback/google`

#### 3. Force Fresh Tokens
The auth configuration now includes `approval_prompt: "force"` to ensure fresh refresh tokens on each login.

#### 4. Clean Up Expired Tokens
Run the cleanup script to remove stale tokens:
```bash
npm run script scripts/cleanup-expired-tokens.ts
```

### Error Handling Flow

1. **JWT Callback**: Detects expired tokens and attempts refresh
2. **Refresh Function**: Makes request to Google OAuth API
3. **Session Callback**: Handles refresh failures gracefully
4. **Dashboard Layout**: Detects session errors and redirects to login
5. **Error Page**: Shows user-friendly message

### User Experience

When refresh fails:
1. User is automatically signed out
2. Redirected to login page with clear error message
3. Can immediately sign in again to get fresh tokens
4. All Google integrations will work normally after re-authentication

## Other Common Authentication Issues

### OAuthAccountNotLinked
**Problem**: "Email already exists with a different provider"
**Solution**: Enable `allowDangerousEmailAccountLinking: true` (already configured)

### TokenExpired
**Problem**: Session expires after inactivity
**Solution**: Increase session `maxAge` or implement auto-refresh

### Callback Errors
**Problem**: OAuth callback fails
**Solution**: Check redirect URIs match exactly in Google Console

## Debugging Authentication

### Enable Debug Mode
Set in environment variables:
```env
NEXTAUTH_DEBUG=true
```

### Check Logs
Monitor these log messages:
- `JWT callback: Token expired, attempting refresh`
- `Token refresh failed:` (shows Google API response)
- `Session callback: RefreshAccessTokenError detected`

### Database Inspection
Check the `accounts` table for:
- `expires_at` values (Unix timestamp)
- `access_token` and `refresh_token` presence
- `provider` set to "google"

## Prevention

### Regular Token Maintenance
1. Monitor token expiration dates
2. Run cleanup script monthly
3. Encourage regular user activity (< 7 days)

### Health Checks
Add monitoring for:
- Authentication success rates
- Token refresh failure rates
- User login patterns

## Manual Recovery

If users are stuck in an error loop:

1. **Clear User Session**:
```sql
DELETE FROM sessions WHERE userId = 'user_id';
```

2. **Remove Expired Tokens**:
```sql
DELETE FROM accounts WHERE provider = 'google' AND expires_at < UNIX_TIMESTAMP();
```

3. **Force Re-authentication**:
User needs to sign in again to get fresh tokens.

## Production Checklist

- [ ] Environment variables are correctly set
- [ ] Google OAuth redirect URIs match production domain
- [ ] NEXTAUTH_URL points to production domain
- [ ] NEXTAUTH_SECRET is strong and unique
- [ ] Error handling is working (test by manually expiring tokens)
- [ ] Cleanup script is scheduled to run monthly

## Additional Resources

- [NextAuth.js JWT Documentation](https://next-auth.js.org/configuration/callbacks#jwt-callback)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Refresh Token Best Practices](https://auth0.com/blog/refresh-tokens-what-are-they-and-when-to-use-them/)