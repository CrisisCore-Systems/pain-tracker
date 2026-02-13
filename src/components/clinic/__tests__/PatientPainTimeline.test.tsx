import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock recharts to avoid DOM measurement issues in jsdom
vi.mock('recharts', () => {
  const MockChart = ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <div data-testid={props['data-testid'] as string}>{children}</div>
  );
  return {
    AreaChart: (props: React.PropsWithChildren<Record<string, unknown>>) => (
      <MockChart data-testid="area-chart" {...props} />
    ),
    ComposedChart: (props: React.PropsWithChildren<Record<string, unknown>>) => (
      <MockChart data-testid="composed-chart" {...props} />
    ),
    BarChart: (props: React.PropsWithChildren<Record<string, unknown>>) => (
      <MockChart data-testid="bar-chart" {...props} />
    ),
    ResponsiveContainer: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
    Area: () => <div data-testid="area-element" />,
    Line: () => <div data-testid="line-element" />,
    Bar: () => <div data-testid="bar-element" />,
    XAxis: () => null,
    YAxis: () => null,
    CartesianGrid: () => null,
    Tooltip: () => null,
    Legend: () => null,
    ReferenceLine: () => null,
    Brush: () => null,
  };
});

import { PatientPainTimeline } from '../PatientPainTimeline';

const mockEntries = [
  {
    id: '1',
    timestamp: new Date().toISOString(),
    painLevel: 5,
    location: 'lower back',
    mood: 6,
    sleep: 7,
    medications: ['ibuprofen'],
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    painLevel: 7,
    location: 'neck',
    mood: 4,
    sleep: 5,
  },
];

const mockInterventions = [
  {
    id: 'int1',
    date: new Date().toISOString(),
    type: 'medication' as const,
    name: 'Ibuprofen',
    dosage: '400mg',
  },
];

describe('PatientPainTimeline', () => {
  it('renders with AreaChart in trend view mode (default)', () => {
    render(
      <PatientPainTimeline
        patientId="p1"
        patientName="Test Patient"
        entries={mockEntries}
        interventions={mockInterventions}
      />
    );

    expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    expect(screen.queryByTestId('composed-chart')).not.toBeInTheDocument();
    expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
  });

  it('renders with ComposedChart in correlation view mode', () => {
    render(
      <PatientPainTimeline
        patientId="p1"
        patientName="Test Patient"
        entries={mockEntries}
        interventions={mockInterventions}
      />
    );

    fireEvent.click(screen.getByText('Correlation'));

    expect(screen.getByTestId('composed-chart')).toBeInTheDocument();
    expect(screen.queryByTestId('area-chart')).not.toBeInTheDocument();
    expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
  });

  it('renders with BarChart in pattern view mode', () => {
    render(
      <PatientPainTimeline
        patientId="p1"
        patientName="Test Patient"
        entries={mockEntries}
        interventions={mockInterventions}
      />
    );

    fireEvent.click(screen.getByText('Pattern'));

    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.queryByTestId('area-chart')).not.toBeInTheDocument();
    expect(screen.queryByTestId('composed-chart')).not.toBeInTheDocument();
  });

  it('renders the patient name', () => {
    render(
      <PatientPainTimeline
        patientId="p1"
        patientName="Jane Doe"
        entries={mockEntries}
        interventions={mockInterventions}
      />
    );

    expect(screen.getByText(/Jane Doe/)).toBeInTheDocument();
  });
});
