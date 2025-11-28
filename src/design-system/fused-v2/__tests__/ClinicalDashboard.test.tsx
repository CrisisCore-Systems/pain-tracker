import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../../test/test-utils';
import { ClinicalDashboard } from '../ClinicalDashboard';
import type { PainEntry } from '../../../types';

const sampleEntries: PainEntry[] = [
  {
    id: 1,
    timestamp: new Date().toISOString(),
    baselineData: {
      pain: 5,
      locations: ['back'],
      symptoms: ['aching'],
    },
    functionalImpact: {
      limitedActivities: [],
      assistanceNeeded: [],
      mobilityAids: [],
    },
    medications: {
      current: [],
      changes: '',
      effectiveness: '',
    },
    treatments: {
      recent: [],
      effectiveness: '',
      planned: [],
    },
    qualityOfLife: {
      sleepQuality: 5,
      moodImpact: 5,
      socialImpact: [],
    },
  },
];

describe('ClinicalDashboard', () => {
  it('renders View analytics button when handler is provided and calls it on click', () => {
    const onViewAnalytics = vi.fn();

    render(
      <ClinicalDashboard
        entries={sampleEntries}
        onLogNow={vi.fn()}
        onViewCalendar={vi.fn()}
        onViewAnalytics={onViewAnalytics}
        onExport={vi.fn()}
      />
    );

    const button = screen.getByRole('button', { name: /View analytics/i });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(onViewAnalytics).toHaveBeenCalledTimes(1);
  });

  it('renders help and settings shortcuts when handlers are provided and fires callbacks', () => {
    const onOpenSettings = vi.fn();
    const onOpenHelp = vi.fn();

    render(
      <ClinicalDashboard
        entries={sampleEntries}
        onLogNow={vi.fn()}
        onViewCalendar={vi.fn()}
        onExport={vi.fn()}
        onOpenSettings={onOpenSettings}
        onOpenHelp={onOpenHelp}
      />
    );

    const helpButton = screen.getByRole('button', { name: /Need help\?/i });
    const settingsButton = screen.getByRole('button', { name: /Adjust settings/i });

    expect(helpButton).toBeInTheDocument();
    expect(settingsButton).toBeInTheDocument();

    fireEvent.click(helpButton);
    expect(onOpenHelp).toHaveBeenCalledTimes(1);

    fireEvent.click(settingsButton);
    expect(onOpenSettings).toHaveBeenCalledTimes(1);
  });
});
