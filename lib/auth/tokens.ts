import crypto from 'crypto';

/**
 * Generate a secure random token for email verification or password reset
 */
export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Get expiry date for email verification token (24 hours)
 */
export function getEmailVerificationExpiry(): Date {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 24);
  return expiry;
}

/**
 * Get expiry date for password reset token (1 hour)
 */
export function getPasswordResetExpiry(): Date {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 1);
  return expiry;
}

/**
 * Check if a token has expired
 */
export function isTokenExpired(expiry: Date | null): boolean {
  if (!expiry) return true;
  return new Date() > expiry;
}
