import { UserRole } from '../types';

export const ADMIN_ROLES: readonly UserRole[] = ['admin', 'super_admin', 'manager'] as const;

export interface AuthValidationResult {
  isValid: boolean;
  error?: string;
  cleanEmail: string;
  cleanPassword?: string;
}

export function validateAuthInputs(email?: string, password?: string): AuthValidationResult {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPassword = (password || '').trim();

  if (!cleanEmail && !cleanPassword) {
    return { isValid: false, error: 'Email and password are required.', cleanEmail, cleanPassword };
  }

  if (!cleanEmail) {
    return { isValid: false, error: 'Email is required.', cleanEmail, cleanPassword };
  }

  if (!cleanPassword) {
    return { isValid: false, error: 'Password is required.', cleanEmail, cleanPassword };
  }

  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(cleanEmail) || cleanEmail.includes('..') || cleanEmail.endsWith('.') || cleanEmail.includes('@.')) {
    return { isValid: false, error: 'Please enter a valid email address.', cleanEmail, cleanPassword };
  }

  return { isValid: true, cleanEmail, cleanPassword };
}

export function isAuthorizedAdminRole(role?: string | null): boolean {
  if (!role) return false;
  return (ADMIN_ROLES as readonly string[]).includes(role);
}

export function sanitizeUserRole(rawRole?: string | null): UserRole {
  if (!rawRole) return 'customer';
  if ((ADMIN_ROLES as readonly string[]).includes(rawRole)) {
    return rawRole as UserRole;
  }
  return 'customer';
}
