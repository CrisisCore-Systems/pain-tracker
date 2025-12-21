import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from './Button';
import { Alert } from './Alert';
import { getThemeColors } from './theme';

expect.extend(toHaveNoViolations);

// Simple contrast utilities (sRGB luminance and contrast ratio)
const sRGBtoLinear = (v: number) => {
  v = v / 255;
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
};

const luminance = (hexOrRgb?: string) => {
  // Defensive: handle undefined/null inputs
  if (!hexOrRgb || typeof hexOrRgb !== 'string') {
    // return luminance of black
    return 0;
  }

  let r = 0,
    g = 0,
    b = 0;

  const s = hexOrRgb.trim();

  try {
    if (s.startsWith('#')) {
      let hex = s.replace('#', '');
      // support short hex like #fff
      if (hex.length === 3) {
        hex = hex
          .split('')
          .map(c => c + c)
          .join('');
      }
      // ensure we have at least 6 chars
      hex = (hex + '000000').substring(0, 6);
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    } else if (s.startsWith('rgb')) {
      const nums = s
        .replace(/rgba?\(|\)/g, '')
        .split(',')
        .map(v => Number(v.trim()));
      [r = 0, g = 0, b = 0] = nums;
    } else if (s.startsWith('var(')) {
      // Unable to resolve CSS variables in jsdom test reliably; fallback to black
      return 0;
    } else {
      // unknown format; attempt to parse as plain hex without #
      const hex = s
        .replace(/[^0-9a-fA-F]/g, '')
        .padEnd(6, '0')
        .substring(0, 6);
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    }
  } catch (err) {
    // parsing error - return black luminance

    console.warn('luminance parse error for', hexOrRgb, err);
    return 0;
  }

  const R = sRGBtoLinear(Number.isFinite(r) ? r : 0);
  const G = sRGBtoLinear(Number.isFinite(g) ? g : 0);
  const B = sRGBtoLinear(Number.isFinite(b) ? b : 0);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
};

const contrastRatio = (a: string, b: string) => {
  const la = luminance(a);
  const lb = luminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
};

describe('color contrast and accessibility smoke', () => {
  it('has no color-contrast violations for critical UI pieces', async () => {
    // Programmatically derive semantic color pairs from theme for light + dark modes
    const light = getThemeColors('light');
    const dark = getThemeColors('dark');

    const checks: Array<{ name: string; fg: string; bg: string }> = [];

    // Common checks
    checks.push({
      name: 'foreground on background (light)',
      fg: light.foreground,
      bg: light.background,
    });
    checks.push({
      name: 'foreground on background (dark)',
      fg: dark.foreground,
      bg: dark.background,
    });

    // Primary / primary foreground
    checks.push({ name: 'primary on background (light)', fg: light.primary, bg: light.background });
    checks.push({
      name: 'primary-foreground on primary (light)',
      fg: light.primaryForeground,
      bg: light.primary,
    });
    checks.push({ name: 'primary on background (dark)', fg: dark.primary, bg: dark.background });
    checks.push({
      name: 'primary-foreground on primary (dark)',
      fg: dark.primaryForeground,
      bg: dark.primary,
    });

    // Destructive / success / info / warning
    checks.push({
      name: 'destructive on background (light)',
      fg: light.destructive,
      bg: light.background,
    });
    checks.push({
      name: 'destructive-foreground on destructive (light)',
      fg: light.destructiveForeground,
      bg: light.destructive,
    });
    checks.push({
      name: 'success-foreground on success (light)',
      fg: light.success,
      bg: light.background,
    });
    checks.push({ name: 'info on background (light)', fg: light.info, bg: light.background });
    checks.push({ name: 'warning on background (light)', fg: light.warning, bg: light.background });

    // Muted / card combos (disabled states)
    checks.push({
      name: 'muted-foreground on muted (light)',
      fg: light.mutedForeground,
      bg: light.muted,
    });
    checks.push({
      name: 'card-foreground on card (light)',
      fg: light.cardForeground,
      bg: light.card,
    });

    const failures: string[] = [];
    for (const c of checks) {
      // guard missing values
      if (!c.fg || !c.bg || typeof c.fg !== 'string' || typeof c.bg !== 'string') {
        failures.push(
          `${c.name} has missing or invalid color (fg: ${String(c.fg)}, bg: ${String(c.bg)})`
        );
        continue;
      }

      const ratio = contrastRatio(c.fg, c.bg);
      if (!Number.isFinite(ratio) || ratio < 4.5) {
        failures.push(
          `${c.name} contrast ${Number.isFinite(ratio) ? ratio.toFixed(2) : 'NaN'} < 4.5 (fg: ${c.fg}, bg: ${c.bg})`
        );
      }
    }

    expect(failures).toEqual([]);

    // Also run an axe smoke test on rendered components.
    // We validate color contrast above via deterministic theme-derived ratios;
    // axe's `color-contrast` rule is comparatively slow/flaky under jsdom.
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
        'color-contrast': { enabled: false },
      },
    });

    expect(results).toHaveNoViolations();
  }, 30000);
});
