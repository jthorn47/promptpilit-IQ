import { describe, it, expect, beforeEach } from 'vitest';
import {
  sanitizeHtml,
  sanitizeText,
  isValidEmail,
  sanitizePhone,
  isValidFileUpload,
  RateLimiter,
  generateCSRFToken,
  sanitizeNumeric,
  sanitizeJson,
} from '../security';

describe('Security Utils', () => {
  describe('sanitizeHtml', () => {
    it('should sanitize HTML tags', () => {
      const maliciousHtml = '<script>alert("xss")</script>';
      const result = sanitizeHtml(maliciousHtml);
      expect(result).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
    });

    it('should handle empty or null input', () => {
      expect(sanitizeHtml('')).toBe('');
      expect(sanitizeHtml(null as any)).toBe('');
      expect(sanitizeHtml(undefined as any)).toBe('');
    });

    it('should sanitize quotes and special characters', () => {
      const input = '"test\'s & more"';
      const result = sanitizeHtml(input);
      expect(result).toBe('&quot;test&#x27;s &amp; more&quot;');
    });
  });

  describe('sanitizeText', () => {
    it('should sanitize SQL injection attempts', () => {
      const sqlInjection = "'; DROP TABLE users; --";
      const result = sanitizeText(sqlInjection);
      expect(result).toContain('\\');
    });

    it('should trim whitespace', () => {
      const input = '  test  ';
      const result = sanitizeText(input);
      expect(result).toBe('test');
    });

    it('should handle empty input', () => {
      expect(sanitizeText('')).toBe('');
      expect(sanitizeText(null as any)).toBe('');
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user+tag@domain.co.uk')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail(null as any)).toBe(false);
    });

    it('should reject emails over 254 characters', () => {
      const longEmail = 'a'.repeat(250) + '@test.com';
      expect(isValidEmail(longEmail)).toBe(false);
    });
  });

  describe('sanitizePhone', () => {
    it('should remove non-numeric characters except allowed ones', () => {
      const phone = '(123) 456-7890';
      const result = sanitizePhone(phone);
      expect(result).toBe('(123) 456-7890');
    });

    it('should remove invalid characters', () => {
      const phone = '123-456-7890abc!@#';
      const result = sanitizePhone(phone);
      expect(result).toBe('123-456-7890');
    });

    it('should handle international format', () => {
      const phone = '+1 (555) 123-4567';
      const result = sanitizePhone(phone);
      expect(result).toBe('+1 (555) 123-4567');
    });
  });

  describe('isValidFileUpload', () => {
    beforeEach(() => {
      global.File = class extends Blob {
        name: string;
        constructor(bits: BlobPart[], name: string, options?: FilePropertyBag) {
          super(bits, options);
          this.name = name;
        }
      } as any;
    });

    it('should accept valid file types', () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const result = isValidFileUpload(file);
      expect(result.valid).toBe(true);
    });

    it('should reject files that are too large', () => {
      const file = new File(['x'.repeat(51 * 1024 * 1024)], 'large.pdf', { type: 'application/pdf' });
      const result = isValidFileUpload(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('50MB');
    });

    it('should reject dangerous file types', () => {
      const file = new File(['content'], 'malware.exe', { type: 'application/octet-stream' });
      const result = isValidFileUpload(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('not allowed');
    });

    it('should reject dangerous file extensions', () => {
      const file = new File(['content'], 'script.js', { type: 'application/pdf' });
      const result = isValidFileUpload(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('extension not allowed');
    });
  });

  describe('RateLimiter', () => {
    beforeEach(() => {
      // Clear all rate limits
      (RateLimiter as any).submissions.clear();
    });

    it('should allow requests within limit', () => {
      expect(RateLimiter.isAllowed('test-key', 5, 60000)).toBe(true);
      expect(RateLimiter.isAllowed('test-key', 5, 60000)).toBe(true);
    });

    it('should block requests over limit', () => {
      // Use up all attempts
      for (let i = 0; i < 5; i++) {
        expect(RateLimiter.isAllowed('test-key', 5, 60000)).toBe(true);
      }
      // This should be blocked
      expect(RateLimiter.isAllowed('test-key', 5, 60000)).toBe(false);
    });

    it('should clear specific keys', () => {
      RateLimiter.isAllowed('test-key', 1, 60000);
      expect(RateLimiter.isAllowed('test-key', 1, 60000)).toBe(false);
      
      RateLimiter.clear('test-key');
      expect(RateLimiter.isAllowed('test-key', 1, 60000)).toBe(true);
    });
  });

  describe('generateCSRFToken', () => {
    it('should generate a valid UUID', () => {
      const token = generateCSRFToken();
      expect(token).toBe('mock-uuid'); // Mocked in setup
    });
  });

  describe('sanitizeNumeric', () => {
    it('should parse valid numbers', () => {
      expect(sanitizeNumeric('123')).toBe(123);
      expect(sanitizeNumeric(456)).toBe(456);
      expect(sanitizeNumeric('123.45')).toBe(123.45);
    });

    it('should reject invalid numbers', () => {
      expect(sanitizeNumeric('abc')).toBe(null);
      expect(sanitizeNumeric('')).toBe(null);
      expect(sanitizeNumeric('123abc')).toBe(null);
    });

    it('should enforce bounds', () => {
      expect(sanitizeNumeric('5', 0, 10)).toBe(5);
      expect(sanitizeNumeric('-1', 0, 10)).toBe(null);
      expect(sanitizeNumeric('15', 0, 10)).toBe(null);
    });
  });

  describe('sanitizeJson', () => {
    it('should clean valid JSON', () => {
      const input = { name: 'test', value: 123 };
      const result = sanitizeJson(input);
      expect(result).toEqual({ name: 'test', value: 123 });
    });

    it('should remove dangerous keys', () => {
      const input = { 
        name: 'test', 
        __proto__: { dangerous: true },
        constructor: 'hack',
        prototype: 'exploit'
      };
      const result = sanitizeJson(input);
      expect(result).toEqual({ name: 'test' });
    });

    it('should handle null and invalid input', () => {
      expect(sanitizeJson(null)).toBe(null);
      expect(sanitizeJson(undefined)).toBe(null);
    });

    it('should clean nested objects', () => {
      const input = {
        user: {
          name: 'test',
          __proto__: { hack: true }
        }
      };
      const result = sanitizeJson(input);
      expect(result).toEqual({
        user: { name: 'test' }
      });
    });
  });
});