// Security utilities for input validation and sanitization
import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks by escaping HTML entities
 */
export const sanitizeHtml = (input: string | null | undefined): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Sanitize text input for safe database storage and display
 */
export const sanitizeText = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, (char) => {
      switch (char) {
        case '\0': return '\\0';
        case '\x08': return '\\b';
        case '\x09': return '\\t';
        case '\x1a': return '\\z';
        case '\n': return '\\n';
        case '\r': return '\\r';
        case '"': case "'": case '\\': case '%': 
          return '\\' + char;
        default: return char;
      }
    });
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

/**
 * Validate and sanitize phone number
 */
export const sanitizePhone = (phone: string): string => {
  if (!phone || typeof phone !== 'string') return '';
  
  // Remove all non-digits
  return phone.replace(/\D/g, '');
};

/**
 * Validate phone number format
 */
export const isValidPhone = (phone: string): boolean => {
  if (!phone || typeof phone !== 'string') return true; // Empty is allowed
  
  const sanitized = sanitizePhone(phone);
  // US phone numbers should have exactly 10 digits
  return sanitized.length === 10;
};

/**
 * Format phone number as user types
 */
export const formatPhoneAsYouType = (value: string): string => {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');
  
  // Limit to 10 digits
  const limitedDigits = digits.slice(0, 10);
  
  // Format as user types
  if (limitedDigits.length === 0) return '';
  if (limitedDigits.length <= 3) return `(${limitedDigits}`;
  if (limitedDigits.length <= 6) return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3)}`;
  return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3, 6)}-${limitedDigits.slice(6)}`;
};

/**
 * Validate file upload security
 */
export const isValidFileUpload = (file: File): { valid: boolean; error?: string } => {
  // Check file size - different limits for different file types
  const isVideoFile = file.type.startsWith('video/');
  
  if (isVideoFile) {
    // For video files, allow up to 10GB since we upload directly to Vimeo
    const maxVideoSize = 10 * 1024 * 1024 * 1024; // 10GB
    if (file.size > maxVideoSize) {
      return { valid: false, error: 'Video file size exceeds 10GB limit' };
    }
  } else {
    // For other files, keep the 50MB limit
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return { valid: false, error: 'File size exceeds 50MB limit' };
    }
  }
  
  // Check file type - allow specific training-related files
  const allowedTypes = [
    'application/pdf',
    'video/mp4',
    'video/webm',
    'video/ogg',
    'application/zip',
    'application/x-zip-compressed',
    'image/jpeg',
    'image/png',
    'image/webp',
    'text/plain',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File type not allowed' };
  }
  
  // Check for dangerous file extensions
  const dangerousExtensions = ['.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js'];
  const fileName = file.name.toLowerCase();
  
  for (const ext of dangerousExtensions) {
    if (fileName.endsWith(ext)) {
      return { valid: false, error: 'File extension not allowed' };
    }
  }
  
  return { valid: true };
};

/**
 * Rate limiting utility for form submissions
 */
export class RateLimiter {
  private static submissions = new Map<string, number[]>();
  
  static isAllowed(key: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
    const now = Date.now();
    const attempts = this.submissions.get(key) || [];
    
    // Remove old attempts outside the time window
    const recentAttempts = attempts.filter(time => now - time < windowMs);
    
    if (recentAttempts.length >= maxAttempts) {
      return false;
    }
    
    // Add current attempt
    recentAttempts.push(now);
    this.submissions.set(key, recentAttempts);
    
    return true;
  }
  
  static clear(key: string): void {
    this.submissions.delete(key);
  }
}

/**
 * Generate CSRF token for form security
 */
export const generateCSRFToken = (): string => {
  return crypto.randomUUID();
};

/**
 * CSRF Token validation and management
 */
export class CSRFProtection {
  private static tokens = new Map<string, { token: string; expires: number }>();
  
  static generateToken(sessionId: string): string {
    const token = crypto.randomUUID();
    const expires = Date.now() + (60 * 60 * 1000); // 1 hour
    
    this.tokens.set(sessionId, { token, expires });
    return token;
  }
  
  static validateToken(sessionId: string, token: string): boolean {
    const stored = this.tokens.get(sessionId);
    if (!stored || stored.expires < Date.now()) {
      this.tokens.delete(sessionId);
      return false;
    }
    
    return stored.token === token;
  }
  
  static clearToken(sessionId: string): void {
    this.tokens.delete(sessionId);
  }
  
  static cleanup(): void {
    const now = Date.now();
    for (const [sessionId, data] of this.tokens.entries()) {
      if (data.expires < now) {
        this.tokens.delete(sessionId);
      }
    }
  }
}

/**
 * Validate numeric input with bounds
 */
export const sanitizeNumeric = (input: string | number | null | undefined, min?: number, max?: number): number | null => {
  if (input === null || input === undefined) return null;
  
  if (typeof input === 'string') {
    // Only allow pure numeric strings, not mixed strings like "123abc"
    if (!/^\d*\.?\d+$/.test(input.trim())) return null;
    const num = parseFloat(input);
    if (isNaN(num) || !isFinite(num)) return null;
    
    if (min !== undefined && num < min) return null;
    if (max !== undefined && num > max) return null;
    
    return num;
  }
  
  if (typeof input === 'number') {
    if (isNaN(input) || !isFinite(input)) return null;
    
    if (min !== undefined && input < min) return null;
    if (max !== undefined && input > max) return null;
    
    return input;
  }
  
  return null;
};

/**
 * Sanitize JSON input to prevent injection
 */
export const sanitizeJson = (input: any): any => {
  if (input === null || input === undefined) return null;
  
  try {
    const jsonString = JSON.stringify(input);
    const parsed = JSON.parse(jsonString);
    
    // Remove potentially dangerous keys
    const dangerousKeys = ['__proto__', 'constructor', 'prototype'];
    const clean = (obj: any): any => {
      if (obj === null || typeof obj !== 'object') return obj;
      
      if (Array.isArray(obj)) {
        return obj.map(clean);
      }
      
      const result: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (!dangerousKeys.includes(key)) {
          result[key] = clean(value);
        }
      }
      return result;
    };
    
    return clean(parsed);
  } catch (error) {
    console.error('JSON sanitization error:', error);
    return null;
  }
};