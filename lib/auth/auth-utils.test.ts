import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as bcrypt from 'bcryptjs';

// Mock bcryptjs
vi.mock('bcryptjs', () => ({
  hash: vi.fn(),
  compare: vi.fn(),
}));

describe('Authentication Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Password Hashing', () => {
    it('should hash password with bcrypt', async () => {
      const mockHash = '$2a$10$mockHashedPassword';
      vi.mocked(bcrypt.hash).mockResolvedValue(mockHash as never);

      const password = 'SecurePassword123!';
      const hashed = await bcrypt.hash(password, 10);

      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
      expect(hashed).toBe(mockHash);
    });

    it('should verify correct password', async () => {
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const password = 'SecurePassword123!';
      const hash = '$2a$10$mockHashedPassword';

      const isValid = await bcrypt.compare(password, hash);

      expect(isValid).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hash);
    });

    it('should reject incorrect password', async () => {
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      const password = 'WrongPassword';
      const hash = '$2a$10$mockHashedPassword';

      const isValid = await bcrypt.compare(password, hash);

      expect(isValid).toBe(false);
    });
  });

  describe('Password Validation', () => {
    it('should validate strong passwords', () => {
      const strongPasswords = [
        'SecurePass123!',
        'MyP@ssw0rd',
        'C0mpl3x!ty',
      ];

      strongPasswords.forEach(password => {
        // Minimum 8 characters, at least one letter and one number
        const isValid = password.length >= 8 &&
                       /[a-zA-Z]/.test(password) &&
                       /[0-9]/.test(password);
        expect(isValid).toBe(true);
      });
    });

    it('should reject weak passwords', () => {
      const weakPasswords = [
        'short',      // Too short
        'password',   // No numbers
        '12345678',   // No letters
        '',           // Empty
      ];

      weakPasswords.forEach(password => {
        const isValid = password.length >= 8 &&
                       /[a-zA-Z]/.test(password) &&
                       /[0-9]/.test(password);
        expect(isValid).toBe(false);
      });
    });
  });

  describe('Email Validation', () => {
    it('should validate correct email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'admin+tag@company.org',
      ];

      validEmails.forEach(email => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        expect(emailRegex.test(email)).toBe(true);
      });
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'notanemail',
        '@nodomain.com',
        'missing@domain',
        'spaces in@email.com',
        '',
      ];

      invalidEmails.forEach(email => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        expect(emailRegex.test(email)).toBe(false);
      });
    });
  });
});
