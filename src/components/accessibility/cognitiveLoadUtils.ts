/**
 * Cognitive Load Utilities
 * Shared functions for calculating and managing cognitive complexity
 */

// Calculate cognitive load based on form complexity
export function calculateCognitiveLoad(
  fieldsCount: number,
  requiredFields: number,
  hasComplexInteractions: boolean = false
): 'minimal' | 'moderate' | 'high' | 'overwhelming' {
  let score = 0;

  // Base score from field count
  if (fieldsCount <= 3) score += 1;
  else if (fieldsCount <= 6) score += 2;
  else if (fieldsCount <= 10) score += 3;
  else score += 4;

  // Add weight for required fields
  score += Math.min(requiredFields, 3);

  // Add weight for complex interactions
  if (hasComplexInteractions) score += 2;

  // Return level based on score
  if (score <= 2) return 'minimal';
  if (score <= 4) return 'moderate';
  if (score <= 6) return 'high';
  return 'overwhelming';
}

// Hook to automatically calculate cognitive load based on form complexity
export function useCognitiveLoadCalculator(
  fieldsCount: number,
  requiredFields: number,
  hasComplexInteractions: boolean = false
) {
  return calculateCognitiveLoad(fieldsCount, requiredFields, hasComplexInteractions);
}
