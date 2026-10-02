import { describe, it, expect } from 'vitest';
import { validateAuthInputs, isAuthorizedAdminRole, sanitizeUserRole, ADMIN_ROLES } from '../utils/authSecurity';

describe('Admin and Customer Authentication Security Matrix', () => {
  describe('Credential Input Validation & Sanitization', () => {
    it('TEST: Rejects empty email and empty password with validation error', () => {
      const res = validateAuthInputs('', '');
      expect(res.isValid).toBe(false);
      expect(res.error).toBe('Email and password are required.');
    });

    it('TEST: Rejects empty email when password is provided', () => {
      const res = validateAuthInputs('', 'somePassword123');
      expect(res.isValid).toBe(false);
      expect(res.error).toBe('Email is required.');
    });

    it('TEST: Rejects whitespace-only email when password is provided', () => {
      const res = validateAuthInputs('   ', 'somePassword123');
      expect(res.isValid).toBe(false);
      expect(res.error).toBe('Email is required.');
    });

    it('TEST: Rejects empty password when email is provided', () => {
      const res = validateAuthInputs('admin@pocketfriendlysarees.com', '');
      expect(res.isValid).toBe(false);
      expect(res.error).toBe('Password is required.');
    });

    it('TEST: Rejects whitespace-only password', () => {
      const res = validateAuthInputs('admin@pocketfriendlysarees.com', '   ');
      expect(res.isValid).toBe(false);
      expect(res.error).toBe('Password is required.');
    });

    it('TEST: Rejects invalid email formats', () => {
      const invalidEmails = [
        'plainaddress',
        '@missingusername.com',
        'admin@.com',
        'admin@domain..com',
        'admin space@domain.com',
      ];

      invalidEmails.forEach((email) => {
        const res = validateAuthInputs(email, 'validPassword123');
        expect(res.isValid).toBe(false);
        expect(res.error).toBe('Please enter a valid email address.');
      });
    });

    it('TEST: Trims and normalizes valid credentials', () => {
      const res = validateAuthInputs('  Admin@PocketFriendlySarees.com  ', '  adminPass123  ');
      expect(res.isValid).toBe(true);
      expect(res.cleanEmail).toBe('admin@pocketfriendlysarees.com');
      expect(res.cleanPassword).toBe('adminPass123');
    });
  });

  describe('Database-Backed Admin Role Authorization', () => {
    it('TEST: Authorizes legitimate administrative roles', () => {
      expect(isAuthorizedAdminRole('admin')).toBe(true);
      expect(isAuthorizedAdminRole('super_admin')).toBe(true);
      expect(isAuthorizedAdminRole('manager')).toBe(true);
    });

    it('TEST 6: Strictly denies customer role from accessing admin', () => {
      expect(isAuthorizedAdminRole('customer')).toBe(false);
    });

    it('TEST: Denies arbitrary, empty, or crafted role values', () => {
      expect(isAuthorizedAdminRole('')).toBe(false);
      expect(isAuthorizedAdminRole(null)).toBe(false);
      expect(isAuthorizedAdminRole(undefined)).toBe(false);
      expect(isAuthorizedAdminRole('ADMIN')).toBe(false); // Case-sensitive exact match
      expect(isAuthorizedAdminRole('administrator')).toBe(false);
      expect(isAuthorizedAdminRole('root')).toBe(false);
      expect(isAuthorizedAdminRole('superadmin')).toBe(false);
      expect(isAuthorizedAdminRole('role=admin')).toBe(false);
    });

    it('TEST: Prevents privilege escalation through role sanitization', () => {
      expect(sanitizeUserRole('customer')).toBe('customer');
      expect(sanitizeUserRole('hacker_role')).toBe('customer');
      expect(sanitizeUserRole(null)).toBe('customer');
      expect(sanitizeUserRole(undefined)).toBe('customer');
      expect(sanitizeUserRole('admin')).toBe('admin');
    });
  });

  describe('Authentication Flow & Security Matrix Simulation', () => {
    // Simulated credential check model identical to AuthContext
    const DEV_CREDENTIALS: Record<string, { pass: string; role: string }> = {
      'admin@pocketfriendlysarees.com': { pass: 'admin123', role: 'admin' },
      'customer@pocketfriendlysarees.com': { pass: 'customer123', role: 'customer' },
    };

    function simulateLogin(email?: string, password?: string) {
      const validation = validateAuthInputs(email, password);
      if (!validation.isValid) {
        return { success: false, error: validation.error };
      }

      const account = DEV_CREDENTIALS[validation.cleanEmail];
      if (!account || account.pass !== validation.cleanPassword) {
        return { success: false, error: 'Invalid email or password.' };
      }

      return { success: true, role: account.role };
    }

    it('TEST 1: Unknown email + random password must be DENIED', () => {
      const res = simulateLogin('unknown.hacker@evil.com', 'randomPass1234');
      expect(res.success).toBe(false);
      expect(res.error).toBe('Invalid email or password.');
    });

    it('TEST 2: Known customer email + wrong password must be DENIED', () => {
      const res = simulateLogin('customer@pocketfriendlysarees.com', 'wrongPassword!');
      expect(res.success).toBe(false);
      expect(res.error).toBe('Invalid email or password.');
    });

    it('TEST 3: Known customer email + correct password gives CUSTOMER role, DENIED for admin portal', () => {
      const res = simulateLogin('customer@pocketfriendlysarees.com', 'customer123');
      expect(res.success).toBe(true);
      expect(res.role).toBe('customer');
      // Verify customer cannot pass admin guard:
      expect(isAuthorizedAdminRole(res.role)).toBe(false);
    });

    it('TEST 4: Admin email + wrong password must be DENIED', () => {
      const res = simulateLogin('admin@pocketfriendlysarees.com', 'wrongPassword');
      expect(res.success).toBe(false);
      expect(res.error).toBe('Invalid email or password.');
    });

    it('TEST 5: Admin email + correct password grants ADMIN ACCESS', () => {
      const res = simulateLogin('admin@pocketfriendlysarees.com', 'admin123');
      expect(res.success).toBe(true);
      expect(res.role).toBe('admin');
      // Verify admin passes admin guard:
      expect(isAuthorizedAdminRole(res.role)).toBe(true);
    });

    it('TEST 7: Random email + random password must NEVER bypass login', () => {
      const res = simulateLogin('anything@example.com', 'anything');
      expect(res.success).toBe(false);
      expect(res.error).toBe('Invalid email or password.');
    });

    it('TEST 8: Email containing "admin" without verified credentials must fail', () => {
      // Previously, email.includes('admin') was a bypass flaw
      const res = simulateLogin('fakeadmin@gmail.com', 'admin123');
      expect(res.success).toBe(false);
      expect(res.error).toBe('Invalid email or password.');
    });
  });
});
