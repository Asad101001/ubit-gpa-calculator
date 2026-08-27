/**
 * Input Validation & Sanitization Utility for UBIT GPA Calculator
 */

/**
 * Sanitizes input string to prevent HTML/Script injection attacks
 */
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<[^>]*>/g, '') // Strip HTML tags
    .replace(/[<>"'&]/g, (char) => {
      switch (char) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '"': return '&quot;';
        case "'": return '&#x27;';
        case '&': return '&amp;';
        default: return char;
      }
    })
    .trim();
};

/**
 * Validates course marks input (0 - 100 or empty string)
 */
export const validateMarks = (value: unknown): { isValid: boolean; parsed: number | ''; error?: string } => {
  if (value === '' || value === null || value === undefined) {
    return { isValid: true, parsed: '' };
  }

  const num = typeof value === 'number' ? value : parseFloat(String(value));

  if (isNaN(num)) {
    return { isValid: false, parsed: '', error: 'Marks must be a valid number' };
  }

  if (num < 0 || num > 100) {
    return { isValid: false, parsed: Math.min(100, Math.max(0, num)), error: 'Marks must be between 0 and 100' };
  }

  return { isValid: true, parsed: Math.round(num) };
};

/**
 * Validates UBIT / UOK Seat Number format (e.g. B23101001, B21101088, EP-2210100)
 */
export const validateSeatNumber = (seatNo: string): { isValid: boolean; formatted: string; error?: string } => {
  const sanitized = sanitizeInput(seatNo).toUpperCase();
  if (!sanitized) {
    return { isValid: false, formatted: '', error: 'Seat number is required' };
  }

  // Accepts standard UBIT pattern: B23101001 or EP-2210100 or general UOK formats
  const pattern = /^(B|BS|EP|EP-|B-)?\d{2}\d{5,8}$/i;
  const isMatch = pattern.test(sanitized.replace(/\s+/g, ''));

  if (!isMatch && sanitized.length < 5) {
    return { isValid: false, formatted: sanitized, error: 'Please enter a valid seat number (e.g., B23101001)' };
  }

  return { isValid: true, formatted: sanitized };
};

/**
 * Validates student name for leaderboard submission
 */
export const validateName = (name: string): { isValid: boolean; sanitized: string; error?: string } => {
  const sanitized = sanitizeInput(name);
  if (!sanitized) {
    return { isValid: false, sanitized: '', error: 'Name cannot be empty' };
  }

  if (sanitized.length < 2) {
    return { isValid: false, sanitized, error: 'Name must be at least 2 characters long' };
  }

  if (sanitized.length > 50) {
    return { isValid: false, sanitized: sanitized.substring(0, 50), error: 'Name cannot exceed 50 characters' };
  }

  if (!/^[a-zA-Z\s.'-]+$/.test(sanitized)) {
    return { isValid: false, sanitized, error: 'Name can only contain letters, spaces, dots, and hyphens' };
  }

  return { isValid: true, sanitized };
};

/**
 * Validates Target CGPA input (0.01 to 4.00)
 */
export const validateTargetCgpa = (target: unknown): { isValid: boolean; parsed: number; error?: string } => {
  if (target === '' || target === null || target === undefined) {
    return { isValid: false, parsed: 0, error: 'Enter a target CGPA' };
  }

  const num = parseFloat(String(target));

  if (isNaN(num)) {
    return { isValid: false, parsed: 0, error: 'Invalid target CGPA' };
  }

  if (num <= 0 || num > 4.0) {
    return { isValid: false, parsed: Math.min(4.0, Math.max(0, num)), error: 'Target CGPA must be between 0.01 and 4.00' };
  }

  return { isValid: true, parsed: parseFloat(num.toFixed(3)) };
};
