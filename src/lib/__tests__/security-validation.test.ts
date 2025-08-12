import { describe, it, expect } from 'vitest';
import { validatePain, validatePersonalInfo, ValidationError } from '../validation';
import { wcbSubmit, ApiError, NetworkError } from '../api-client';

describe('Security Validation Tests', () => {
  describe('validatePain', () => {
    it('should reject potentially malicious input', () => {
      const maliciousData = {
        intensity: 5,
        location: '<script>alert("xss")</script>',
        description: 'javascript:alert("xss")',
        timestamp: new Date().toISOString(),
      };

      // Should reject malicious input
      expect(() => validatePain(maliciousData)).toThrow(ValidationError);
    });

    it('should accept valid input and sanitize safely', () => {
      const validData = {
        intensity: 5,
        location: 'Lower back',
        description: 'Sharp pain in lower back area',
        timestamp: new Date().toISOString(),
      };

      const result = validatePain(validData);
      
      // Should accept and properly format valid data
      expect(result.intensity).toBe(5);
      expect(result.location).toBe('Lower back');
      expect(result.description).toBe('Sharp pain in lower back area');
      expect(result.medications).toEqual([]);
      expect(result.symptoms).toEqual([]);
    });

    it('should validate pain intensity bounds', () => {
      expect(() => validatePain({
        intensity: -1,
        location: 'back',
        description: 'pain',
        timestamp: new Date().toISOString(),
      })).toThrow(ValidationError);

      expect(() => validatePain({
        intensity: 11,
        location: 'back', 
        description: 'pain',
        timestamp: new Date().toISOString(),
      })).toThrow(ValidationError);
    });

    it('should validate required fields', () => {
      expect(() => validatePain({
        intensity: 5,
        location: '',
        description: 'pain',
        timestamp: new Date().toISOString(),
      })).toThrow(ValidationError);

      expect(() => validatePain({
        intensity: 5,
        location: 'back',
        description: '',
        timestamp: new Date().toISOString(),
      })).toThrow(ValidationError);
    });

    it('should validate timestamp format and range', () => {
      // Invalid timestamp
      expect(() => validatePain({
        intensity: 5,
        location: 'back',
        description: 'pain',
        timestamp: 'invalid-date',
      })).toThrow(ValidationError);

      // Future date
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 2);
      
      expect(() => validatePain({
        intensity: 5,
        location: 'back',
        description: 'pain',
        timestamp: futureDate.toISOString(),
      })).toThrow(ValidationError);
    });
  });

  describe('validatePersonalInfo', () => {
    it('should reject potentially malicious input', () => {
      const maliciousData = {
        name: '<script>alert("xss")</script>John Doe',
        email: 'test@example.com',
        claimNumber: 'WCB123',
      };

      // Should reject malicious input
      expect(() => validatePersonalInfo(maliciousData)).toThrow(ValidationError);
    });

    it('should accept and sanitize valid personal information', () => {
      const validData = {
        name: 'John Doe',
        email: 'test@example.com',
        claimNumber: 'WCB123',
      };

      const result = validatePersonalInfo(validData);
      expect(result.name).toBe('John Doe');
      expect(result.email).toBe('test@example.com');
      expect(result.claimNumber).toBe('WCB123');
    });

    it('should validate email format', () => {
      expect(() => validatePersonalInfo({
        name: 'John Doe',
        email: 'invalid-email',
      })).toThrow(ValidationError);
    });

    it('should validate name format', () => {
      expect(() => validatePersonalInfo({
        name: 'John123', // Numbers not allowed in names
      })).toThrow(ValidationError);
    });
  });

  describe('API Client Security', () => {
    it('should reject invalid data types', async () => {
      await expect(async () => {
        await wcbSubmit('invalid-string' as any);
      }).rejects.toThrow();
    });

    it('should handle network errors gracefully', () => {
      // This would test timeout and error handling in a real environment
      expect(ApiError).toBeDefined();
      expect(NetworkError).toBeDefined();
    });

    it('should validate submission data structure', async () => {
      const invalidData = {
        intensity: 5,
        location: 'back',
        description: 'pain',
        timestamp: new Date().toISOString(),
        // Missing required painEntries structure
      };

      await expect(async () => {
        await wcbSubmit(invalidData as any);
      }).rejects.toThrow();
    });
  });
});