import { 
  formatCurrency, 
  formatDate, 
  generateSlug, 
  validateEmail, 
  validatePhoneNumber, 
  cn 
} from '../utils';

describe('utils', () => {
  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(1000000)).toBe('UGX 1,000,000');
      expect(formatCurrency(1500)).toBe('UGX 1,500');
      expect(formatCurrency(0)).toBe('UGX 0');
    });

    it('should handle negative numbers', () => {
      expect(formatCurrency(-1000)).toBe('-UGX 1,000');
    });

    it('should handle decimal numbers', () => {
      expect(formatCurrency(1000.50)).toBe('UGX 1,001');
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-03-15T10:30:00Z');
      expect(formatDate(date)).toBe('Mar 15, 2024');
    });

    it('should handle string dates', () => {
      expect(formatDate('2024-03-15')).toBe('Mar 15, 2024');
    });

    it('should handle custom format', () => {
      const date = new Date('2024-03-15T10:30:00Z');
      expect(formatDate(date, { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })).toBe('March 15, 2024');
    });
  });

  describe('generateSlug', () => {
    it('should generate slug from text', () => {
      expect(generateSlug('Hello World')).toBe('hello-world');
      expect(generateSlug('iPhone 15 Pro Max')).toBe('iphone-15-pro-max');
      expect(generateSlug('Special Characters & Symbols!')).toBe('special-characters-symbols');
    });

    it('should handle empty strings', () => {
      expect(generateSlug('')).toBe('');
    });

    it('should handle multiple spaces', () => {
      expect(generateSlug('   Multiple    Spaces   ')).toBe('multiple-spaces');
    });
  });

  describe('validateEmail', () => {
    it('should validate correct emails', () => {
      expect(validateEmail('user@example.com')).toBe(true);
      expect(validateEmail('test.email+tag@domain.co.uk')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('validatePhoneNumber', () => {
    it('should validate Uganda phone numbers', () => {
      expect(validatePhoneNumber('+256700123456')).toBe(true);
      expect(validatePhoneNumber('0700123456')).toBe(true);
      expect(validatePhoneNumber('256700123456')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(validatePhoneNumber('123')).toBe(false);
      expect(validatePhoneNumber('invalid')).toBe(false);
      expect(validatePhoneNumber('')).toBe(false);
    });
  });

  describe('cn (className utility)', () => {
    it('should merge class names', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2');
    });

    it('should handle conditional classes', () => {
      expect(cn('base', true && 'conditional', false && 'hidden')).toBe('base conditional');
    });

    it('should handle undefined and null values', () => {
      expect(cn('base', undefined, null, 'final')).toBe('base final');
    });
  });
});