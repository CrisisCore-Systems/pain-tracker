import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
  CardAction,
  CardStats,
} from '../design-system/components/Card';

describe('Card component', () => {
  it('renders structure', () => {
    render(
      <Card data-testid="card">
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Desc</CardDescription>
        </CardHeader>
        <CardContent>Body</CardContent>
        <CardFooter>Foot</CardFooter>
      </Card>
    );
    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Desc')).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
    expect(screen.getByText('Foot')).toBeInTheDocument();
  });

  it('applies variant, padding, hover, and className', () => {
    render(
      <Card
        data-testid="card"
        variant="outlined"
        padding="sm"
        hover="lift"
        className="custom"
      />
    );

    const card = screen.getByTestId('card');
    expect(card.className).toContain('border-2');
    expect(card.className).toContain('p-3');
    expect(card.className).toContain('hover:-translate-y-1.5');
    expect(card.className).toContain('custom');
  });

  it('renders a severity indicator when severity is provided', () => {
    const { container } = render(<Card data-testid="card" severity="high" />);
    const card = screen.getByTestId('card');
    expect(card).toBeInTheDocument();

    const indicator = container.querySelector('div[aria-hidden]');
    expect(indicator).not.toBeNull();
    expect(indicator!.getAttribute('style') || '').toContain('rgb(var(--color-pain-severe))');
  });

  it('maps severity levels to expected indicator colors', () => {
    const cases = [
      { severity: 'low' as const, expected: 'rgb(var(--color-pain-none))' },
      { severity: 'medium' as const, expected: 'rgb(var(--color-pain-mild))' },
      { severity: 'high' as const, expected: 'rgb(var(--color-pain-severe))' },
      { severity: 'critical' as const, expected: 'rgb(var(--color-pain-extreme))' },
    ];

    for (const c of cases) {
      const { container, unmount } = render(<Card severity={c.severity} />);
      const indicator = container.querySelector('div[aria-hidden]');
      expect(indicator).not.toBeNull();
      expect(indicator!.getAttribute('style') || '').toContain(c.expected);
      unmount();
    }
  });

  it('does not render a severity indicator when severity is omitted or null', () => {
    const { container: c1 } = render(<Card data-testid="card-1" />);
    expect(c1.querySelector('div[aria-hidden]')).toBeNull();

    const { container: c2 } = render(<Card data-testid="card-2" severity={null} />);
    expect(c2.querySelector('div[aria-hidden]')).toBeNull();
  });

  it('CardAction adds interactive styling', () => {
    render(<CardAction data-testid="card-action" />);
    const card = screen.getByTestId('card-action');
    expect(card.className).toContain('cursor-pointer');
    expect(card.className).toContain('transition-shadow');
  });

  it('CardStats renders with elevated variant and centers text', () => {
    render(<CardStats data-testid="card-stats">Stats</CardStats>);
    const card = screen.getByTestId('card-stats');
    expect(card.className).toContain('text-center');
    expect(card.className).toContain('shadow-2xl');
    expect(screen.getByText('Stats')).toBeInTheDocument();
  });
});
