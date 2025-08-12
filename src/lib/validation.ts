import { z } from 'zod';

// Custom error class for validation errors
export class ValidationError extends Error {
  constructor(message: string, public field?: string, public code?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Pain intensity validation schema
const PainIntensitySchema = z.number()
  .min(0, 'Pain intensity cannot be negative')
  .max(10, 'Pain intensity cannot exceed 10')
  .int('Pain intensity must be a whole number');

// Location validation schema
const LocationSchema = z.string()
  .trim()
  .min(1, 'Location is required')
  .max(100, 'Location cannot exceed 100 characters')
  .regex(/^[a-zA-Z0-9\s\-_.,()]+$/, 'Location contains invalid characters');

// Description validation schema
const DescriptionSchema = z.string()
  .trim()
  .min(1, 'Description is required')
  .max(500, 'Description cannot exceed 500 characters');

// Timestamp validation schema
const TimestampSchema = z.string()
  .datetime('Invalid timestamp format')
  .refine((val) => {
    const date = new Date(val);
    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    return date >= oneYearAgo && date <= oneDayFromNow;
  }, 'Timestamp must be within the last year and not in the future');

// Medication validation schema
const MedicationSchema = z.string()
  .trim()
  .min(1, 'Medication name cannot be empty')
  .max(100, 'Medication name cannot exceed 100 characters')
  .regex(/^[a-zA-Z0-9\s\-_.,()]+$/, 'Medication name contains invalid characters');

// Symptom validation schema  
const SymptomSchema = z.string()
  .trim()
  .min(1, 'Symptom cannot be empty')
  .max(50, 'Symptom cannot exceed 50 characters')
  .regex(/^[a-zA-Z0-9\s\-_.,()]+$/, 'Symptom contains invalid characters');

// Main pain entry validation schema
const PainEntrySchema = z.object({
  intensity: PainIntensitySchema,
  location: LocationSchema,
  description: DescriptionSchema,
  timestamp: TimestampSchema,
  medications: z.array(MedicationSchema).optional().default([]),
  symptoms: z.array(SymptomSchema).optional().default([]),
});

// Email validation utility
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

// Phone number validation utility (supports various formats)
export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
  const cleanPhone = phone.replace(/[\s\-().]/g, '');
  return phoneRegex.test(cleanPhone) && cleanPhone.length >= 10;
};

// Postal code validation utility (Canadian format)
export const validatePostalCode = (postalCode: string): boolean => {
  const canadianPostalRegex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
  return canadianPostalRegex.test(postalCode.trim());
};

// Sanitization utilities
export const sanitizeString = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

export const sanitizeNumber = (input: string | number): number => {
  const num = typeof input === 'string' ? parseFloat(input) : input;
  if (isNaN(num)) {
    throw new ValidationError('Invalid number format');
  }
  return num;
};

// Main validation function
export const validatePain = (data: unknown): {
  intensity: number;
  location: string;
  description: string;
  timestamp: string;
  medications: string[];
  symptoms: string[];
} => {
  try {
    // Validate the entire object structure
    const validated = PainEntrySchema.parse(data);
    
    // Additional sanitization
    return {
      intensity: validated.intensity,
      location: sanitizeString(validated.location),
      description: sanitizeString(validated.description),
      timestamp: new Date(validated.timestamp).toISOString(),
      medications: validated.medications.map(med => sanitizeString(med)),
      symptoms: validated.symptoms.map(symptom => sanitizeString(symptom)),
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw new ValidationError(
        firstError.message,
        firstError.path.join('.'),
        firstError.code
      );
    }
    throw new ValidationError('Invalid pain entry data');
  }
};

// Batch validation for multiple entries
export const validatePainEntries = (entries: unknown[]): ReturnType<typeof validatePain>[] => {
  if (!Array.isArray(entries)) {
    throw new ValidationError('Entries must be an array');
  }

  if (entries.length === 0) {
    throw new ValidationError('At least one pain entry is required');
  }

  if (entries.length > 1000) {
    throw new ValidationError('Too many entries (maximum 1000 allowed)');
  }

  return entries.map((entry, index) => {
    try {
      return validatePain(entry);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new ValidationError(
          `Entry ${index + 1}: ${error.message}`,
          `entries.${index}.${error.field}`,
          error.code
        );
      }
      throw error;
    }
  });
};

// Personal information validation schema
const PersonalInfoSchema = z.object({
  name: z.string()
    .trim()
    .min(1, 'Name is required')
    .max(100, 'Name cannot exceed 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters'),
  email: z.string()
    .trim()
    .email('Invalid email format')
    .optional(),
  phone: z.string()
    .trim()
    .refine(validatePhoneNumber, 'Invalid phone number format')
    .optional(),
  claimNumber: z.string()
    .trim()
    .min(1, 'Claim number is required')
    .max(50, 'Claim number cannot exceed 50 characters')
    .regex(/^[a-zA-Z0-9-]+$/, 'Claim number contains invalid characters')
    .optional(),
  dateOfBirth: z.string()
    .date('Invalid date format')
    .optional(),
});

// Validate personal information
export const validatePersonalInfo = (data: unknown): z.infer<typeof PersonalInfoSchema> => {
  try {
    const validated = PersonalInfoSchema.parse(data);
    
    // Additional sanitization
    return {
      ...validated,
      name: sanitizeString(validated.name),
      email: validated.email ? sanitizeString(validated.email) : undefined,
      phone: validated.phone ? validated.phone.replace(/[\s\-().]/g, '') : undefined,
      claimNumber: validated.claimNumber ? sanitizeString(validated.claimNumber) : undefined,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw new ValidationError(
        firstError.message,
        firstError.path.join('.'),
        firstError.code
      );
    }
    throw new ValidationError('Invalid personal information');
  }
};
