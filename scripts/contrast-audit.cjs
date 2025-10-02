const fs = require('fs');
const path = require('path');

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

const css = fs.readFileSync(path.join(__dirname, '..', 'src', 'index.css'), 'utf8');

function findBlockBySelector(selector) {
  const idx = css.indexOf(selector);
  if (idx === -1) return '';
  // find first '{' after selector
  const start = css.indexOf('{', idx);
  if (start === -1) return '';
  let depth = 0;
  let end = -1;
  for (let i = start; i < css.length; i++) {
    if (css[i] === '{') depth++;
    else if (css[i] === '}') {
      depth--;
      if (depth === 0) { end = i; break; }
    }
  }
  if (end === -1) return '';
  return css.slice(start + 1, end);
}

// Try selectors commonly used in this repo
const lightBlock = findBlockBySelector('[data-theme="light"] , :root') || findBlockBySelector('[data-theme="light"]') || findBlockBySelector(':root');
const darkBlock = findBlockBySelector('[data-theme="dark"]') || '';

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

const lightVars = extractVars(lightBlock);
const darkVars = extractVars(darkBlock);

const checkList = [
  'chart-series-1','chart-series-2','chart-series-3','chart-series-4','chart-series-5','chart-series-6',
  'color-pain-none','color-pain-mild','color-pain-moderate','color-pain-severe','color-pain-extreme'
];

function reportForTheme(vars, bgVarName, themeName) {
  const bgRgb = parseRgb(vars[bgVarName]);
  if (!bgRgb) {
    console.error('No background found for', themeName);
    return;
  }
  const bgLum = luminance(bgRgb);
  console.log(`\n=== ${themeName.toUpperCase()} (background: ${bgRgb.join(',')}) ===`);
  console.log('Token'.padEnd(22), 'RGB'.padEnd(16), 'Contrast', 'Notes');
  for (const token of checkList) {
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

console.log('\nThresholds: WCAG small text 4.5:1, large text/graphics 3:1.');

// Summarize
function summary(vars, bgVarName) {
  const bgRgb = parseRgb(vars[bgVarName]);
  if (!bgRgb) return { fails: [], warns: [] };
  const bgLum = luminance(bgRgb);
  const fails = [];
  const warns = [];
  for (const token of checkList) {
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

if (sLight.fails.length || sDark.fails.length) process.exitCode = 2; else process.exitCode = 0;
