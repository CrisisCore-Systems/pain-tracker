import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '../Button';
import { Alert } from '../Alert';
import { theme } from '../theme';

// Simple contrast utilities (sRGB luminance and contrast ratio)
const sRGBtoLinear = (v: number) => {
  v = v / 255;
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
};

const luminance = (hexOrRgb: string) => {
  // Accepts hex (#rrggbb) or 'r,g,b' or 'rgb(r,g,b)'
  let r = 0,
    g = 0,
    b = 0;
  if (hexOrRgb.startsWith('#')) {
    const hex = hexOrRgb.replace('#', '');
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else {
    const nums = hexOrRgb.replace(/[rgba()\s]/g, '').split(',').map(Number);
    [r, g, b] = nums;
  }
  const R = sRGBtoLinear(r);
  const G = sRGBtoLinear(g);
  const B = sRGBtoLinear(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
};

const contrastRatio = (a: string, b: string) => {
  const la = luminance(a);
  const lb = luminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
};

expect.extend(toHaveNoViolations);

describe('color contrast and accessibility smoke', () => {
  it('has no color-contrast violations for critical UI pieces', async () => {
    // Programmatic checks for critical pairs (WCAG AA 4.5:1 for normal text)
    const pairs: Array<{ fg: string; bg: string; name: string }> = [
      { fg: '#0f172a', bg: '#ffffff', name: 'foreground on background' },
      { fg: '#3b82f6', bg: '#ffffff', name: 'primary on background' },
      { fg: '#ffffff', bg: '#2563eb', name: 'primary-foreground on primary' },
      { fg: '#ef4444', bg: '#ffffff', name: 'error on background' },
      { fg: '#ffffff', bg: '#16a34a', name: 'success-foreground on success' },
    ];

    const failures: string[] = [];
    for (const p of pairs) {
      const ratio = contrastRatio(p.fg, p.bg);
      if (ratio < 4.5) {
        failures.push(`${p.name} contrast ${ratio.toFixed(2)} < 4.5`);
      }
    }

    expect(failures).toEqual([]);

    // Also run an axe smoke test on rendered components
    const { container } = render(
      <div>
        <h1 style={{ color: '#0f172a' }}>Heading text</h1>
        <p style={{ color: '#0f172a' }}>Body text sample</p>
        <Button variant="primary">Primary action</Button>
        <Button variant="ghost">Ghost action</Button>
        <Alert tone="error">There was an error processing your request</Alert>
        <Alert tone="success">Saved successfully</Alert>
      </div>
    );

    const results = await axe(container, {
      rules: {
        'color-contrast': { enabled: true },
      },
    });

    expect(results).toHaveNoViolations();
  }, 10000);
});
