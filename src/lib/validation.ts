import { z } from 'zod';

// Pain entry validation schema
export const PainEntrySchema = z.object({
  id: z.number().or(z.string()).optional(),
  timestamp: z.string().datetime(),
  
  baselineData: z.object({
    pain: z.number().min(0, 'Pain level must be at least 0').max(10, 'Pain level cannot exceed 10'),
    locations: z.array(z.string().min(1, 'Location cannot be empty')).min(1, 'At least one pain location is required'),
    symptoms: z.array(z.string().min(1, 'Symptom cannot be empty')).optional().default([])
  }),
  
  functionalImpact: z.object({
    limitedActivities: z.array(z.string()).optional().default([]),
    assistanceNeeded: z.array(z.string()).optional().default([]),
    mobilityAids: z.array(z.string()).optional().default([])
  }).optional(),
  
  medications: z.object({
    current: z.array(z.object({
      name: z.string().min(1, 'Medication name is required'),
      dosage: z.string().min(1, 'Dosage is required'),
      frequency: z.string().min(1, 'Frequency is required'),
      effectiveness: z.enum(['poor', 'fair', 'moderate', 'good', 'excellent']).optional()
    })).optional().default([]),
    changes: z.string().optional(),
    effectiveness: z.enum(['poor', 'fair', 'moderate', 'good', 'excellent']).optional()
  }).optional(),
  
  treatments: z.object({
    recent: z.array(z.object({
      type: z.string().min(1, 'Treatment type is required'),
      provider: z.string().optional(),
      date: z.string().optional(),
      effectiveness: z.enum(['poor', 'fair', 'moderate', 'good', 'excellent']).optional()
    })).optional().default([]),
    effectiveness: z.enum(['poor', 'fair', 'moderate', 'good', 'excellent']).optional(),
    planned: z.array(z.string()).optional().default([])
  }).optional(),
  
  qualityOfLife: z.object({
    sleepQuality: z.number().min(0, 'Sleep quality must be at least 0').max(10, 'Sleep quality cannot exceed 10').optional(),
    moodImpact: z.number().min(0, 'Mood impact must be at least 0').max(10, 'Mood impact cannot exceed 10').optional(),
    socialImpact: z.array(z.string()).optional().default([])
  }).optional(),
  
  workImpact: z.object({
    missedWork: z.number().min(0, 'Missed work days cannot be negative').optional(),
    modifiedDuties: z.array(z.string()).optional().default([]),
    workLimitations: z.array(z.string()).optional().default([])
  }).optional(),
  
  comparison: z.object({
    worseningSince: z.string().optional(),
    newLimitations: z.array(z.string()).optional().default([])
  }).optional(),
  
  notes: z.string().optional()
});

// WCB Report validation schema
export const WCBReportSchema = z.object({
  patientInfo: z.object({
    name: z.string().min(1, 'Patient name is required'),
    dateOfBirth: z.string().optional(),
    claimNumber: z.string().min(1, 'Claim number is required'),
    injuryDate: z.string().min(1, 'Injury date is required')
  }),
  
  reportPeriod: z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime()
  }).refine(data => new Date(data.endDate) >= new Date(data.startDate), {
    message: 'End date must be after start date'
  }),
  
  painEntries: z.array(PainEntrySchema).min(1, 'At least one pain entry is required'),
  
  summary: z.object({
    averagePain: z.number().min(0).max(10),
    trendAnalysis: z.string(),
    functionalChanges: z.string(),
    recommendedActions: z.array(z.string()).optional().default([])
  }),
  
  metadata: z.object({
    generatedAt: z.string().datetime(),
    version: z.string().default('1.0')
  }).optional()
});

// Simple pain validation for backward compatibility
export const SimplePainSchema = z.object({
  intensity: z.number().min(0, 'Pain intensity must be 0-10').max(10, 'Pain intensity must be 0-10'),
  location: z.string().min(1, 'Location required (1-100 chars)').max(100, 'Location required (1-100 chars)'),
  description: z.string().min(1, 'Description required (1-500 chars)').max(500, 'Description required (1-500 chars)'),
  timestamp: z.string().datetime('Valid timestamp required')
});

// Validation error formatting
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export function formatValidationErrors(error: z.ZodError): ValidationError[] {
  return error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
    value: err.code === 'invalid_type' ? undefined : err.input
  }));
}

// User-friendly validation functions
export function validatePainEntry(data: unknown): { valid: true; data: z.infer<typeof PainEntrySchema> } | { valid: false; errors: ValidationError[] } {
  try {
    const validData = PainEntrySchema.parse(data);
    return { valid: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, errors: formatValidationErrors(error) };
    }
    return { 
      valid: false, 
      errors: [{ field: 'unknown', message: 'An unexpected validation error occurred' }] 
    };
  }
}

export function validateWCBReport(data: unknown): { valid: true; data: z.infer<typeof WCBReportSchema> } | { valid: false; errors: ValidationError[] } {
  try {
    const validData = WCBReportSchema.parse(data);
    return { valid: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, errors: formatValidationErrors(error) };
    }
    return { 
      valid: false, 
      errors: [{ field: 'unknown', message: 'An unexpected validation error occurred' }] 
    };
  }
}

// Backward compatibility function
export const validatePain = (d: any) => {
  const result = SimplePainSchema.safeParse(d);
  if (!result.success) {
    const firstError = result.error.errors[0];
    throw new Error(firstError.message);
  }
  
  const { intensity, location, description, timestamp } = result.data;
  return {
    intensity: +intensity,
    location: String(location).trim(),
    description: String(description).trim(),
    timestamp: new Date(timestamp).toISOString()
  };
};

// Validation middleware for forms
export function createValidationMiddleware<T>(schema: z.ZodSchema<T>) {
  return (data: unknown): { valid: true; data: T } | { valid: false; errors: ValidationError[] } => {
    try {
      const validData = schema.parse(data);
      return { valid: true, data: validData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { valid: false, errors: formatValidationErrors(error) };
      }
      return { 
        valid: false, 
        errors: [{ field: 'unknown', message: 'An unexpected validation error occurred' }] 
      };
    }
  };
}

// Types
export type PainEntry = z.infer<typeof PainEntrySchema>;
export type WCBReport = z.infer<typeof WCBReportSchema>;
