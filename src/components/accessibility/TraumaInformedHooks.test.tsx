import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React, { ReactNode } from 'react';
import {
  TraumaInformedContext,
  useTraumaInformed,
  useCognitiveSupport,
  useVisualPreferences,
  useInteractionPreferences,
  useEmotionalSafety,
  useCrisisSupport,
  useProgressiveDisclosure,
  useAllTraumaInformedPreferences,
} from './TraumaInformedHooks';
import { defaultPreferences, TraumaInformedPreferences } from './TraumaInformedTypes';

// Test wrapper with configurable preferences
interface TestWrapperProps {
  children: ReactNode;
  preferences?: Partial<TraumaInformedPreferences>;
  updatePreferences?: (updates: Partial<TraumaInformedPreferences>) => void;
}

function TestWrapper({
  children,
  preferences = {},
  updatePreferences = vi.fn(),
}: TestWrapperProps) {
  const value = {
    preferences: { ...defaultPreferences, ...preferences },
    updatePreferences,
  };

  return (
    <TraumaInformedContext.Provider value={value}>{children}</TraumaInformedContext.Provider>
  );
}

// Test components for each hook
function CognitiveSupportConsumer() {
  const cognitive = useCognitiveSupport();
  return (
    <div>
      <div data-testid="is-simplified">{String(cognitive.isSimplified)}</div>
      <div data-testid="show-memory-aids">{String(cognitive.showMemoryAids)}</div>
      <div data-testid="auto-save">{String(cognitive.autoSave)}</div>
      <div data-testid="disclosure-level">{cognitive.disclosureLevel}</div>
    </div>
  );
}

function VisualPreferencesConsumer() {
  const visual = useVisualPreferences();
  return (
    <div>
      <div data-testid="font-size">{visual.fontSize}</div>
      <div data-testid="contrast">{visual.contrast}</div>
      <div data-testid="is-high-contrast">{String(visual.isHighContrast)}</div>
      <div data-testid="reduce-motion">{String(visual.reduceMotion)}</div>
    </div>
  );
}

function InteractionPreferencesConsumer() {
  const interaction = useInteractionPreferences();
  return (
    <div>
      <div data-testid="touch-target-size">{interaction.touchTargetSize}</div>
      <div data-testid="confirmation-level">{interaction.confirmationLevel}</div>
      <div data-testid="require-confirmation">{String(interaction.requireConfirmation)}</div>
      <div data-testid="strict-confirmation">{String(interaction.strictConfirmation)}</div>
    </div>
  );
}

function EmotionalSafetyConsumer() {
  const emotional = useEmotionalSafety();
  return (
    <div>
      <div data-testid="gentle-language">{String(emotional.useGentleLanguage)}</div>
      <div data-testid="hide-distressing">{String(emotional.hideDistressing)}</div>
      <div data-testid="comfort-prompts">{String(emotional.showComfortPrompts)}</div>
      <div data-testid="message">{emotional.getMessage('gentle', 'standard')}</div>
    </div>
  );
}

function CrisisSupportConsumer() {
  const crisis = useCrisisSupport();
  return (
    <div>
      <div data-testid="crisis-enabled">{String(crisis.crisisDetectionEnabled)}</div>
      <div data-testid="sensitivity">{crisis.sensitivity}</div>
      <div data-testid="show-resources">{String(crisis.showResources)}</div>
      <div data-testid="pain-threshold">{crisis.thresholds.painLevel}</div>
    </div>
  );
}

function ProgressiveDisclosureConsumer() {
  const disclosure = useProgressiveDisclosure();
  return (
    <div>
      <div data-testid="enabled">{String(disclosure.enabled)}</div>
      <div data-testid="level">{disclosure.level}</div>
      <div data-testid="show-helpful">{String(disclosure.showHelpful)}</div>
      <div data-testid="show-advanced">{String(disclosure.showAdvanced)}</div>
      <div data-testid="show-expert">{String(disclosure.showExpert)}</div>
    </div>
  );
}

describe('Trauma-Informed Hooks', () => {
  describe('useTraumaInformed', () => {
    it('should return preferences and update function', () => {
      const updateFn = vi.fn();

      function Consumer() {
        const { preferences, updatePreferences } = useTraumaInformed();
        return (
          <div>
            <div data-testid="mode">{preferences.simplifiedMode ? 'simplified' : 'full'}</div>
            <button onClick={() => updatePreferences({ simplifiedMode: false })}>Update</button>
          </div>
        );
      }

      render(
        <TestWrapper updatePreferences={updateFn}>
          <Consumer />
        </TestWrapper>
      );

      expect(screen.getByTestId('mode').textContent).toBe('simplified');
    });
  });

  describe('useCognitiveSupport', () => {
    it('should return cognitive support preferences with defaults', () => {
      render(
        <TestWrapper>
          <CognitiveSupportConsumer />
        </TestWrapper>
      );

      expect(screen.getByTestId('is-simplified').textContent).toBe('true');
      expect(screen.getByTestId('show-memory-aids').textContent).toBe('true');
      expect(screen.getByTestId('auto-save').textContent).toBe('true');
      expect(screen.getByTestId('disclosure-level').textContent).toBe('helpful');
    });

    it('should reflect custom preferences', () => {
      render(
        <TestWrapper preferences={{ simplifiedMode: false, defaultDisclosureLevel: 'expert' }}>
          <CognitiveSupportConsumer />
        </TestWrapper>
      );

      expect(screen.getByTestId('is-simplified').textContent).toBe('false');
      expect(screen.getByTestId('disclosure-level').textContent).toBe('expert');
    });
  });

  describe('useVisualPreferences', () => {
    it('should return visual preferences with defaults', () => {
      render(
        <TestWrapper>
          <VisualPreferencesConsumer />
        </TestWrapper>
      );

      expect(screen.getByTestId('font-size').textContent).toBe('16px');
      expect(screen.getByTestId('contrast').textContent).toBe('normal');
      expect(screen.getByTestId('is-high-contrast').textContent).toBe('false');
      expect(screen.getByTestId('reduce-motion').textContent).toBe('false');
    });

    it('should handle high contrast setting', () => {
      render(
        <TestWrapper preferences={{ contrast: 'high' }}>
          <VisualPreferencesConsumer />
        </TestWrapper>
      );

      expect(screen.getByTestId('is-high-contrast').textContent).toBe('true');
    });

    it('should handle large font size', () => {
      render(
        <TestWrapper preferences={{ fontSize: 'large' }}>
          <VisualPreferencesConsumer />
        </TestWrapper>
      );

      expect(screen.getByTestId('font-size').textContent).toBe('18px');
    });
  });

  describe('useInteractionPreferences', () => {
    it('should return interaction preferences with defaults', () => {
      render(
        <TestWrapper>
          <InteractionPreferencesConsumer />
        </TestWrapper>
      );

      expect(screen.getByTestId('touch-target-size').textContent).toBe('56px');
      expect(screen.getByTestId('confirmation-level').textContent).toBe('standard');
      expect(screen.getByTestId('require-confirmation').textContent).toBe('true');
      expect(screen.getByTestId('strict-confirmation').textContent).toBe('false');
    });

    it('should handle minimal confirmation level', () => {
      render(
        <TestWrapper preferences={{ confirmationLevel: 'minimal' }}>
          <InteractionPreferencesConsumer />
        </TestWrapper>
      );

      expect(screen.getByTestId('require-confirmation').textContent).toBe('false');
    });

    it('should handle high confirmation level', () => {
      render(
        <TestWrapper preferences={{ confirmationLevel: 'high' }}>
          <InteractionPreferencesConsumer />
        </TestWrapper>
      );

      expect(screen.getByTestId('strict-confirmation').textContent).toBe('true');
    });
  });

  describe('useEmotionalSafety', () => {
    it('should return emotional safety preferences with defaults', () => {
      render(
        <TestWrapper>
          <EmotionalSafetyConsumer />
        </TestWrapper>
      );

      expect(screen.getByTestId('gentle-language').textContent).toBe('true');
      expect(screen.getByTestId('comfort-prompts').textContent).toBe('true');
      expect(screen.getByTestId('message').textContent).toBe('gentle');
    });

    it('should return standard message when gentle language is disabled', () => {
      render(
        <TestWrapper preferences={{ gentleLanguage: false }}>
          <EmotionalSafetyConsumer />
        </TestWrapper>
      );

      expect(screen.getByTestId('gentle-language').textContent).toBe('false');
      expect(screen.getByTestId('message').textContent).toBe('standard');
    });
  });

  describe('useCrisisSupport', () => {
    it('should return crisis support preferences with defaults', () => {
      render(
        <TestWrapper>
          <CrisisSupportConsumer />
        </TestWrapper>
      );

      expect(screen.getByTestId('crisis-enabled').textContent).toBe('true');
      expect(screen.getByTestId('sensitivity').textContent).toBe('medium');
      expect(screen.getByTestId('show-resources').textContent).toBe('true');
      expect(screen.getByTestId('pain-threshold').textContent).toBe('8');
    });

    it('should adjust thresholds for high sensitivity', () => {
      render(
        <TestWrapper preferences={{ crisisDetectionSensitivity: 'high' }}>
          <CrisisSupportConsumer />
        </TestWrapper>
      );

      expect(screen.getByTestId('pain-threshold').textContent).toBe('7');
    });

    it('should adjust thresholds for low sensitivity', () => {
      render(
        <TestWrapper preferences={{ crisisDetectionSensitivity: 'low' }}>
          <CrisisSupportConsumer />
        </TestWrapper>
      );

      expect(screen.getByTestId('pain-threshold').textContent).toBe('9');
    });
  });

  describe('useProgressiveDisclosure', () => {
    it('should return progressive disclosure preferences with defaults', () => {
      render(
        <TestWrapper>
          <ProgressiveDisclosureConsumer />
        </TestWrapper>
      );

      expect(screen.getByTestId('enabled').textContent).toBe('true');
      expect(screen.getByTestId('level').textContent).toBe('helpful');
      expect(screen.getByTestId('show-helpful').textContent).toBe('true');
      expect(screen.getByTestId('show-advanced').textContent).toBe('false');
      expect(screen.getByTestId('show-expert').textContent).toBe('false');
    });

    it('should show advanced content at advanced level', () => {
      render(
        <TestWrapper preferences={{ defaultDisclosureLevel: 'advanced' }}>
          <ProgressiveDisclosureConsumer />
        </TestWrapper>
      );

      expect(screen.getByTestId('show-helpful').textContent).toBe('true');
      expect(screen.getByTestId('show-advanced').textContent).toBe('true');
      expect(screen.getByTestId('show-expert').textContent).toBe('false');
    });

    it('should show all content at expert level', () => {
      render(
        <TestWrapper preferences={{ defaultDisclosureLevel: 'expert' }}>
          <ProgressiveDisclosureConsumer />
        </TestWrapper>
      );

      expect(screen.getByTestId('show-helpful').textContent).toBe('true');
      expect(screen.getByTestId('show-advanced').textContent).toBe('true');
      expect(screen.getByTestId('show-expert').textContent).toBe('true');
    });

    it('should show all content when progressive disclosure is disabled', () => {
      render(
        <TestWrapper
          preferences={{ enableProgressiveDisclosure: false, defaultDisclosureLevel: 'essential' }}
        >
          <ProgressiveDisclosureConsumer />
        </TestWrapper>
      );

      // When disabled, everything should be visible
      expect(screen.getByTestId('show-helpful').textContent).toBe('true');
      expect(screen.getByTestId('show-advanced').textContent).toBe('true');
      expect(screen.getByTestId('show-expert').textContent).toBe('true');
    });
  });

  describe('useAllTraumaInformedPreferences', () => {
    it('should return all preference categories', () => {
      function AllPreferencesConsumer() {
        const all = useAllTraumaInformedPreferences();
        return (
          <div>
            <div data-testid="has-raw">{String(!!all.raw)}</div>
            <div data-testid="has-update">{String(typeof all.update === 'function')}</div>
            <div data-testid="has-cognitive">{String(!!all.cognitive)}</div>
            <div data-testid="has-visual">{String(!!all.visual)}</div>
            <div data-testid="has-interaction">{String(!!all.interaction)}</div>
            <div data-testid="has-emotional">{String(!!all.emotional)}</div>
            <div data-testid="has-crisis">{String(!!all.crisis)}</div>
            <div data-testid="has-disclosure">{String(!!all.disclosure)}</div>
          </div>
        );
      }

      render(
        <TestWrapper>
          <AllPreferencesConsumer />
        </TestWrapper>
      );

      expect(screen.getByTestId('has-raw').textContent).toBe('true');
      expect(screen.getByTestId('has-update').textContent).toBe('true');
      expect(screen.getByTestId('has-cognitive').textContent).toBe('true');
      expect(screen.getByTestId('has-visual').textContent).toBe('true');
      expect(screen.getByTestId('has-interaction').textContent).toBe('true');
      expect(screen.getByTestId('has-emotional').textContent).toBe('true');
      expect(screen.getByTestId('has-crisis').textContent).toBe('true');
      expect(screen.getByTestId('has-disclosure').textContent).toBe('true');
    });
  });
});
