/**
 * Tests for useEmotionalValidation hook
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useEmotionalValidation } from '../useEmotionalValidation';
import type { ValidationResponse } from '../../services/EmotionalValidationService';
import { Heart, Shield } from 'lucide-react';

describe('useEmotionalValidation', () => {
  it('should initialize with empty validation history', () => {
    const { result } = renderHook(() => useEmotionalValidation());

    expect(result.current.validationHistory).toEqual([]);
  });

  it('should add validation to history', () => {
    const { result } = renderHook(() => useEmotionalValidation());

    const mockValidation: ValidationResponse = {
      id: '1',
      timestamp: new Date(),
      tone: 'supportive',
      message: 'That sounds challenging',
      icon: Shield,
      color: 'blue',
    };

    act(() => {
      result.current.addValidation(mockValidation);
    });

    expect(result.current.validationHistory).toHaveLength(1);
    expect(result.current.validationHistory[0].message).toEqual('That sounds challenging');
  });

  it('should clear validation history', () => {
    const { result } = renderHook(() => useEmotionalValidation());

    const mockValidation: ValidationResponse = {
      id: '1',
      timestamp: new Date(),
      tone: 'empathetic',
      message: 'I understand',
      icon: Heart,
      color: 'purple',
    };

    act(() => {
      result.current.addValidation(mockValidation);
    });

    expect(result.current.validationHistory).toHaveLength(1);

    act(() => {
      result.current.clearHistory();
    });

    expect(result.current.validationHistory).toEqual([]);
  });

  it('should keep only last 10 validations', () => {
    const { result } = renderHook(() => useEmotionalValidation());

    // Add 15 validations
    act(() => {
      for (let i = 0; i < 15; i++) {
        const validation: ValidationResponse = {
          id: `${i}`,
          timestamp: new Date(),
          tone: 'supportive',
          message: `Validation ${i}`,
          icon: Heart,
          color: 'blue',
        };
        result.current.addValidation(validation);
      }
    });

    // Should only have last 10
    expect(result.current.validationHistory).toHaveLength(10);
    expect(result.current.validationHistory[0].id).toBe('5'); // First should be index 5
    expect(result.current.validationHistory[9].id).toBe('14'); // Last should be index 14
  });

  it('should handle multiple rapid additions', () => {
    const { result } = renderHook(() => useEmotionalValidation());

    const validations: ValidationResponse[] = [
      {
        id: '1',
        timestamp: new Date(),
        tone: 'celebratory',
        message: 'Great progress!',
        icon: Heart,
        color: 'green',
      },
      {
        id: '2',
        timestamp: new Date(),
        tone: 'gentle',
        message: 'Take your time',
        icon: Shield,
        color: 'purple',
      },
      {
        id: '3',
        timestamp: new Date(),
        tone: 'empathetic',
        message: 'I hear you',
        icon: Heart,
        color: 'blue',
      },
    ];

    act(() => {
      validations.forEach(v => result.current.addValidation(v));
    });

    expect(result.current.validationHistory).toHaveLength(3);
    expect(result.current.validationHistory.map(v => v.id)).toEqual(['1', '2', '3']);
  });
});
