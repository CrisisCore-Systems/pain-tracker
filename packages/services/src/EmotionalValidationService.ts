export interface ValidationResponse {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class EmotionalValidationService {
  validateEmotionalInput(_input: string): ValidationResponse {
    return { isValid: true, errors: [], warnings: [] };
  }
}

export const emotionalValidationService = new EmotionalValidationService();
