// Lightweight runtime validation helpers
export function assertNumericRange(value: number | null | undefined, name: string, min: number, max: number) {
  if (value === null || value === undefined) {
    throw new Error(`${name} is required`);
  }
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new Error(`${name} must be a number`);
  }
  if (value < min || value > max) {
    throw new Error(`${name} must be between ${min} and ${max}`);
  }
  return true;
}

// Simple note sanitizer to reduce accidental PHI leakage: strips long sequences of digits
export function sanitizeNote(note: string | null | undefined, maxLength = 1000) {
  if (!note) return '';
  let s = String(note);
  // Replace sequences of 6+ digits (likely identifiers) with [REDACTED]
  s = s.replace(/\d{6,}/g, '[REDACTED]');
  // Truncate to max length
  if (s.length > maxLength) s = s.slice(0, maxLength) + '...';
  return s;
}
