import { describe, it, expect } from 'vitest';
import { 
  sanitizeInput, 
  validateMarks, 
  validateSeatNumber, 
  validateName, 
  validateTargetCgpa 
} from '../../src/lib/validation';

describe('XSS Sanitization (sanitizeInput)', () => {
  it('should strip raw HTML tags', () => {
    expect(sanitizeInput('<script>alert("hack")</script>')).toBe('alert(&quot;hack&quot;)');
    expect(sanitizeInput('Hello <b>World</b>')).toBe('Hello World');
    expect(sanitizeInput('<img src="x" onerror="alert(1)">')).toBe('');
  });

  it('should escape HTML entities for safety', () => {
    expect(sanitizeInput('A & B')).toBe('A &amp; B');
    expect(sanitizeInput('"quotes" and \'apostrophes\'')).toBe('&quot;quotes&quot; and &#x27;apostrophes&#x27;');
  });

  it('should handle empty or non-string inputs safely', () => {
    expect(sanitizeInput('')).toBe('');
    expect(sanitizeInput(null as any)).toBe('');
    expect(sanitizeInput(undefined as any)).toBe('');
  });
});

describe('Marks Validation (validateMarks)', () => {
  it('should permit empty, null, or undefined as valid blank marks', () => {
    expect(validateMarks('')).toEqual({ isValid: true, parsed: '' });
    expect(validateMarks(null)).toEqual({ isValid: true, parsed: '' });
    expect(validateMarks(undefined)).toEqual({ isValid: true, parsed: '' });
  });

  it('should parse valid integer numbers between 0 and 100', () => {
    expect(validateMarks(85)).toEqual({ isValid: true, parsed: 85 });
    expect(validateMarks('85')).toEqual({ isValid: true, parsed: 85 });
    expect(validateMarks(0)).toEqual({ isValid: true, parsed: 0 });
    expect(validateMarks(100)).toEqual({ isValid: true, parsed: 100 });
  });

  it('should round floating point marks to nearest integer', () => {
    expect(validateMarks(84.4)).toEqual({ isValid: true, parsed: 84 });
    expect(validateMarks(84.6)).toEqual({ isValid: true, parsed: 85 });
    expect(validateMarks('79.5')).toEqual({ isValid: true, parsed: 80 });
  });

  it('should reject and clamp out-of-range marks', () => {
    const under = validateMarks(-10);
    expect(under.isValid).toBe(false);
    expect(under.parsed).toBe(0);
    expect(under.error).toBeDefined();

    const over = validateMarks(115);
    expect(over.isValid).toBe(false);
    expect(over.parsed).toBe(100);
    expect(over.error).toBeDefined();
  });

  it('should reject non-numeric strings', () => {
    const res = validateMarks('not-a-number');
    expect(res.isValid).toBe(false);
    expect(res.error).toBe('Marks must be a valid number');
  });
});

describe('Seat Number Validation (validateSeatNumber)', () => {
  it('should accept valid standard UBIT seat numbers', () => {
    const res1 = validateSeatNumber('B24110006087');
    expect(res1.isValid).toBe(true);
    expect(res1.formatted).toBe('B24110006087');

    const res2 = validateSeatNumber('b24110006001');
    expect(res2.isValid).toBe(true);
    expect(res2.formatted).toBe('B24110006001');

    const res3 = validateSeatNumber('EP-2210100');
    expect(res3.isValid).toBe(true);
    expect(res3.formatted).toBe('EP-2210100');
  });

  it('should reject empty or missing seat numbers', () => {
    const res = validateSeatNumber('');
    expect(res.isValid).toBe(false);
    expect(res.error).toBe('Seat number is required');
  });

  it('should reject seat numbers that are too short', () => {
    const res = validateSeatNumber('B2');
    expect(res.isValid).toBe(false);
    expect(res.error).toContain('Please enter a valid seat number');
  });
});

describe('Student Name Validation (validateName)', () => {
  it('should accept valid student names with letters and spaces', () => {
    const res = validateName('Muhammad Asad Khan');
    expect(res.isValid).toBe(true);
    expect(res.sanitized).toBe('Muhammad Asad Khan');
  });

  it('should accept names with dots and hyphens', () => {
    const res = validateName('Dr. Sami-ul-Huda');
    expect(res.isValid).toBe(true);
  });

  it('should reject empty names', () => {
    const res = validateName('   ');
    expect(res.isValid).toBe(false);
    expect(res.error).toBe('Name cannot be empty');
  });

  it('should reject names shorter than 2 characters', () => {
    const res = validateName('A');
    expect(res.isValid).toBe(false);
    expect(res.error).toBe('Name must be at least 2 characters long');
  });

  it('should reject names longer than 50 characters', () => {
    const longName = 'A'.repeat(55);
    const res = validateName(longName);
    expect(res.isValid).toBe(false);
    expect(res.error).toBe('Name cannot exceed 50 characters');
  });

  it('should reject names containing numbers or prohibited symbols', () => {
    const res = validateName('Asad123');
    expect(res.isValid).toBe(false);
    expect(res.error).toBe('Name can only contain letters, spaces, dots, and hyphens');
  });
});

describe('Target CGPA Validation (validateTargetCgpa)', () => {
  it('should accept valid CGPA targets between 0.01 and 4.00', () => {
    expect(validateTargetCgpa(3.5)).toEqual({ isValid: true, parsed: 3.5 });
    expect(validateTargetCgpa('3.85')).toEqual({ isValid: true, parsed: 3.85 });
    expect(validateTargetCgpa(4.0)).toEqual({ isValid: true, parsed: 4.0 });
    expect(validateTargetCgpa('3.12345')).toEqual({ isValid: true, parsed: 3.123 });
  });

  it('should reject empty, zero or negative targets', () => {
    expect(validateTargetCgpa('').isValid).toBe(false);
    expect(validateTargetCgpa(0).isValid).toBe(false);
    expect(validateTargetCgpa(-1).isValid).toBe(false);
  });

  it('should reject and clamp targets exceeding 4.00', () => {
    const res = validateTargetCgpa(4.5);
    expect(res.isValid).toBe(false);
    expect(res.parsed).toBe(4.0);
  });
});
