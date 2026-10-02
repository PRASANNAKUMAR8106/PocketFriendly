import { describe, it, expect } from 'vitest';
import { indianMobileRegex, indianPincodeRegex, checkoutSchema } from '../utils/validation';
import { slugify } from '../utils/slugify';
import { formatINR, getDiscountBadge } from '../utils/currency';

describe('Validation and Formatting Utilities', () => {
  describe('Indian Mobile Number Validation', () => {
    it('accepts valid 10-digit Indian numbers starting with 6, 7, 8, 9', () => {
      expect(indianMobileRegex.test('9876543210')).toBe(true);
      expect(indianMobileRegex.test('8123456789')).toBe(true);
      expect(indianMobileRegex.test('7001234567')).toBe(true);
      expect(indianMobileRegex.test('6998877665')).toBe(true);
    });

    it('rejects invalid mobile numbers', () => {
      expect(indianMobileRegex.test('1234567890')).toBe(false); // starts with 1
      expect(indianMobileRegex.test('987654321')).toBe(false);  // 9 digits
      expect(indianMobileRegex.test('98765432101')).toBe(false); // 11 digits
      expect(indianMobileRegex.test('abcdefghij')).toBe(false); // non-digits
    });
  });

  describe('Indian Postal PIN Code Validation', () => {
    it('accepts valid 6-digit Indian PIN codes', () => {
      expect(indianPincodeRegex.test('560038')).toBe(true); // Bangalore
      expect(indianPincodeRegex.test('395002')).toBe(true); // Surat
      expect(indianPincodeRegex.test('110001')).toBe(true); // New Delhi
    });

    it('rejects invalid PIN codes', () => {
      expect(indianPincodeRegex.test('012345')).toBe(false); // starts with 0
      expect(indianPincodeRegex.test('56003')).toBe(false);  // 5 digits
      expect(indianPincodeRegex.test('5600389')).toBe(false); // 7 digits
    });
  });

  describe('Checkout Zod Schema Validation', () => {
    it('validates a complete and legitimate Indian delivery checkout payload', () => {
      const payload = {
        fullName: 'Ananya Sharma',
        email: 'ananya@example.com',
        phone: '9876543210',
        addressLine1: 'Flat 402, Royal Gardens',
        city: 'Surat',
        state: 'Gujarat',
        pincode: '395002',
        paymentMethod: 'cod',
      };

      const result = checkoutSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('fails when Indian phone number is incorrect', () => {
      const payload = {
        fullName: 'Ananya Sharma',
        email: 'ananya@example.com',
        phone: '12345',
        addressLine1: 'Flat 402, Royal Gardens',
        city: 'Surat',
        state: 'Gujarat',
        pincode: '395002',
        paymentMethod: 'cod',
      };

      const result = checkoutSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });

  describe('Currency and Discount Formatting', () => {
    it('formats numbers into Indian Rupee format', () => {
      expect(formatINR(1999)).toBe('₹1,999');
      expect(formatINR(125000)).toBe('₹1,25,000');
    });

    it('generates discount badges accurately', () => {
      expect(getDiscountBadge(2499, 1999)).toBe('20% OFF');
      expect(getDiscountBadge(2499, 1999, 'fixed', 500)).toBe('₹500 OFF');
      expect(getDiscountBadge(1500, 1500)).toBeNull();
    });
  });

  describe('Slug Generator', () => {
    it('generates clean SEO-friendly slugs', () => {
      expect(slugify('Royal Crimson Banarasi Katan Silk Saree')).toBe('royal-crimson-banarasi-katan-silk-saree');
      expect(slugify('Kanjeevaram Temple Gold / Zari #101')).toBe('kanjeevaram-temple-gold-zari-101');
    });
  });
});
