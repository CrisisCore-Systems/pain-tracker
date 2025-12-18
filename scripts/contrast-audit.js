 
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function linearize(c) {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function luminance(rgb) {
  return 0.2126 * linearize(rgb[0]) + 0.7152 * linearize(rgb[1]) + 0.0722 * linearize(rgb[2]);
}

function contrastRatio(a, b) {
  const L1 = Math.max(a, b);
  const L2 = Math.min(a, b);
  return (L1 + 0.05) / (L2 + 0.05);
}

function parseRgb(str) {
  if (!str) return null;
  const parts = str.trim().split(/\s+/).map(Number);
  if (parts.length >= 3) return parts.slice(0,3);
  return null;
}

// Read from the canonical tokens file (single source of truth)
const css = fs.readFileSync(path.join(__dirname, '..', 'src', 'styles', 'base', 'tokens.css'), 'utf8');

function extractBlock(selector) {
  const re = new RegExp(selector.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&') + '\\s*\\{([\\s\\S]*?)\\}');
  const m = css.match(re);
  return m ? m[1] : '';
}

// Theme selectors in this repo:
// - Dark is the default in `:root`
// - Light is opt-in via `:root:not(.dark)`
// - Dark can also be explicitly re-applied via `.dark, [data-theme="dark"]`
const darkDefaultBlock = extractBlock(':root') || '';
const lightBlock = extractBlock(':root:not(.dark)') || '';
const darkExplicitBlock = extractBlock('.dark,\n\[data-theme="dark"\]') || extractBlock('.dark,\r\n\[data-theme="dark"\]') || '';

function extractVars(block) {
  const lines = block.split(/;\s*/);
  const map = {};
  for (const l of lines) {
    const m = l.match(/--([a-z0-9-]+)\s*:\s*([0-9\s,]+)/i);
    if (m) {
      const name = m[1].trim();
      const val = m[2].trim().replace(/,/g, ' ');
      map[name] = val;
    }
  }
  return map;
}

const darkDefaultVars = extractVars(darkDefaultBlock);
const lightOverrideVars = extractVars(lightBlock);
const darkOverrideVars = darkExplicitBlock ? extractVars(darkExplicitBlock) : {};

// Merge defaults + overrides (light overrides are additive)
const lightVars = { ...darkDefaultVars, ...lightOverrideVars };
const darkVars = Object.keys(darkOverrideVars).length ? { ...darkDefaultVars, ...darkOverrideVars } : darkDefaultVars;

const chartAndPainTokens = [
  'chart-series-1','chart-series-2','chart-series-3','chart-series-4','chart-series-5','chart-series-6',
  'color-pain-none','color-pain-mild','color-pain-moderate','color-pain-severe','color-pain-extreme'
];

const semanticPairs = [
  { name: 'foreground on background', fg: 'color-foreground', bg: 'color-background', threshold: 4.5 },
  { name: 'card-foreground on card', fg: 'color-card-foreground', bg: 'color-card', threshold: 4.5 },
  { name: 'popover-foreground on popover', fg: 'color-popover-foreground', bg: 'color-popover', threshold: 4.5 },
  { name: 'muted-foreground on background', fg: 'color-muted-foreground', bg: 'color-background', threshold: 4.5 },

  // Text/icon colors used on the main background
  { name: 'primary on background', fg: 'color-primary', bg: 'color-background', threshold: 4.5 },
  { name: 'secondary on background', fg: 'color-secondary', bg: 'color-background', threshold: 4.5 },
  { name: 'accent on background', fg: 'color-accent', bg: 'color-background', threshold: 4.5 },
  { name: 'destructive on background', fg: 'color-destructive', bg: 'color-background', threshold: 4.5 },
  { name: 'success on background', fg: 'color-success', bg: 'color-background', threshold: 4.5 },
  { name: 'warning on background', fg: 'color-warning', bg: 'color-background', threshold: 4.5 },
  { name: 'info on background', fg: 'color-info', bg: 'color-background', threshold: 4.5 },
  { name: 'error on background', fg: 'color-error', bg: 'color-background', threshold: 4.5 },

  // Button/filled surfaces
  { name: 'primary-foreground on primary', fg: 'color-primary-foreground', bg: 'color-primary', threshold: 4.5 },
  { name: 'secondary-foreground on secondary', fg: 'color-secondary-foreground', bg: 'color-secondary', threshold: 4.5 },
  { name: 'accent-foreground on accent', fg: 'color-accent-foreground', bg: 'color-accent', threshold: 4.5 },
  { name: 'destructive-foreground on destructive', fg: 'color-destructive-foreground', bg: 'color-destructive', threshold: 4.5 },
  { name: 'success-foreground on success', fg: 'color-success-foreground', bg: 'color-success', threshold: 4.5 },
  { name: 'warning-foreground on warning', fg: 'color-warning-foreground', bg: 'color-warning', threshold: 4.5 },
  { name: 'info-foreground on info', fg: 'color-info-foreground', bg: 'color-info', threshold: 4.5 },
  { name: 'error-foreground on error', fg: 'color-error-foreground', bg: 'color-error', threshold: 4.5 },

  // Badges / UI component boundaries
  { name: 'badge-foreground on badge-bg', fg: 'color-badge-foreground', bg: 'color-badge-bg', threshold: 4.5 },
  { name: 'border on background (non-text)', fg: 'color-border', bg: 'color-background', threshold: 3.0 },
  { name: 'ring on background (non-text)', fg: 'color-ring', bg: 'color-background', threshold: 3.0 },
];

function ratioForVars(vars, fgName, bgName, themeName) {
  let fgKey = fgName;

  // If we're evaluating colored text on the main background, prefer *-text tokens when present.
  // This matches runtime CSS where dark mode uses `--color-*-text` for readable accent text,
  // while keeping `--color-*` darker for filled surfaces with white text.
  if (themeName === 'dark' && bgName === 'color-background') {
    const textKey = `${fgName}-text`;
    if (vars[textKey]) fgKey = textKey;
  }

  const fg = parseRgb(vars[fgKey]);
  const bg = parseRgb(vars[bgName]);
  if (!fg || !bg) return null;
  return contrastRatio(luminance(fg), luminance(bg));
}

function reportSemanticPairs(vars, themeName) {
  console.log(`\n--- ${themeName.toUpperCase()} SEMANTIC PAIRS ---`);
  console.log('Pair'.padEnd(34), 'Contrast', 'Notes');

  const failures = [];
  const warnings = [];

  for (const p of semanticPairs) {
    const ratio = ratioForVars(vars, p.fg, p.bg, themeName);
    if (ratio == null) {
      warnings.push(`${p.name} missing vars (${p.fg} / ${p.bg})`);
      console.log(p.name.padEnd(34), 'N/A'.padEnd(8), `MISSING (${p.fg} / ${p.bg})`);
      continue;
    }

    const ok = ratio >= p.threshold;
    const note = ok ? 'OK' : `FAIL <${p.threshold}:1`;
    console.log(p.name.padEnd(34), ratio.toFixed(2).padEnd(8), note);
    if (!ok) failures.push({ name: p.name, ratio, threshold: p.threshold });
  }

  return { failures, warnings };
}

function reportForTheme(vars, bgVarName, themeName) {
  const bgRgb = parseRgb(vars[bgVarName]);
  if (!bgRgb) {
    console.error('No background found for', themeName);
    return;
  }
  const bgLum = luminance(bgRgb);
  console.log(`\n=== ${themeName.toUpperCase()} (background: ${bgRgb.join(',')}) ===`);
  console.log('Token'.padEnd(22), 'RGB'.padEnd(16), 'Contrast', 'Notes');
  for (const token of chartAndPainTokens) {
    const v = vars[token];
    if (!v) continue;
    const rgb = parseRgb(v);
    if (!rgb) continue;
    const lum = luminance(rgb);
    const ratio = contrastRatio(lum, bgLum);
    const note = ratio < 3 ? 'FAIL <3:1' : ratio < 4.5 ? 'Warn <4.5:1' : 'OK';
    console.log(token.padEnd(22), rgb.join(',').padEnd(16), ratio.toFixed(2).padEnd(7), note);
  }
}

reportForTheme(lightVars, 'color-background', 'light');
reportForTheme(darkVars, 'color-background', 'dark');

const lightSemantic = reportSemanticPairs(lightVars, 'light');
const darkSemantic = reportSemanticPairs(darkVars, 'dark');

console.log('\nThresholds: WCAG small text 4.5:1, large text/graphics 3:1.');

// Summarize
function summary(vars, bgVarName) {
  const bgRgb = parseRgb(vars[bgVarName]);
  if (!bgRgb) return { fails: [], warns: [] };
  const bgLum = luminance(bgRgb);
  const fails = [];
  const warns = [];
  for (const token of chartAndPainTokens) {
    const v = vars[token]; if (!v) continue;
    const rgb = parseRgb(v); if (!rgb) continue;
    const ratio = contrastRatio(luminance(rgb), bgLum);
    if (ratio < 3) fails.push({ token, ratio });
    else if (ratio < 4.5) warns.push({ token, ratio });
  }
  return { fails, warns };
}

const sLight = summary(lightVars, 'color-background');
const sDark = summary(darkVars, 'color-background');

console.log('\nLIGHT fails:', sLight.fails.length, 'warns:', sLight.warns.length);
console.log('DARK fails:', sDark.fails.length, 'warns:', sDark.warns.length);

console.log('LIGHT semantic pair fails:', lightSemantic.failures.length);
console.log('DARK semantic pair fails:', darkSemantic.failures.length);

if (sLight.fails.length || sDark.fails.length || lightSemantic.failures.length || darkSemantic.failures.length) {
  process.exitCode = 2;
} else {
  process.exitCode = 0;
}
