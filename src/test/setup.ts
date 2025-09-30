import '@testing-library/jest-dom';
import { expect, afterEach, vi, beforeAll } from 'vitest';
import { securityService } from '../services/SecurityService';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import CryptoJS from 'crypto-js';
import { getThemeColors } from '../design-system/theme';

// Extend Vitest's expect method with methods from react-testing-library
expect.extend(matchers);

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
(globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock canvas getContext for chart libraries (jsdom doesn't implement canvas)
try {
  // Try to wire node-canvas into jsdom for higher fidelity canvas support in tests.
  // This is optional at runtime; if `canvas` isn't installed (for contributors), we fall back to a minimal stub.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createCanvas } = require('canvas');

  // Attach a minimal implementation to document if not present
  if (typeof HTMLCanvasElement !== 'undefined' && !HTMLCanvasElement.prototype.getContext) {
    // Replace getContext to return a real CanvasRenderingContext2D from node-canvas
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (HTMLCanvasElement.prototype as any).getContext = function (type?: string) {
      // create a small backing canvas for Chart.js to draw into
      const c = createCanvas(800, 600);
      return c.getContext(type || '2d');
    };
  }
} catch {
  // canvas not installed or failed to load — fall back to previous minimal stub
  if (typeof HTMLCanvasElement !== 'undefined' && !HTMLCanvasElement.prototype.getContext) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (HTMLCanvasElement.prototype as any).getContext = function () {
      // return a minimal stub that Chart.js will accept for creation
      return {
        canvas: this,
        // context methods used by Chart.js internals
        getContext: () => ({}),
        measureText: () => ({ width: 0 }),
        fillRect: () => {},
        clearRect: () => {},
        beginPath: () => {},
        arc: () => {},
        fill: () => {},
        stroke: () => {},
        moveTo: () => {},
        lineTo: () => {},
        closePath: () => {},
        setLineDash: () => {},
        getLineDash: () => [],
      };
  };
  }
}

// Cleanup after each test case
afterEach(() => {
  cleanup();
}); 

// Provide localStorage polyfill if missing (should exist in jsdom but guard anyway)
if (typeof window !== 'undefined' && !('localStorage' in window)) {
  const store: Record<string,string> = {};
  (window as unknown as { localStorage: Storage }).localStorage = {
    getItem: (k: string) => (k in store ? store[k] : null),
    setItem: (k: string, v: string) => { store[k] = v; },
    removeItem: (k: string) => { delete store[k]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); },
    key: (i: number) => Object.keys(store)[i] ?? null,
    get length() { return Object.keys(store).length; }
  } as Storage;
}

// Seed encryption master key if securityService storage relies on localStorage
beforeAll(async () => {
  // Make this initialization resilient: if securityService.initializeMasterKey
  // takes too long in some environments, continue tests after a short timeout.
  const initPromise = (async () => {
    try {
      await securityService.initializeMasterKey('vitest-seed-password');

      const seededKey = CryptoJS.SHA256('vitest-seed-key-2025').toString();
      const record = JSON.stringify({ key: seededKey, created: new Date().toISOString() });
      window.localStorage.setItem('key:pain-tracker-master', record);

      (globalThis as unknown as { __secureStorageEncrypt?: (p:string)=>string }).__secureStorageEncrypt = (plaintext: string) => plaintext;
      (globalThis as unknown as { __secureStorageDecrypt?: (c:string)=>string }).__secureStorageDecrypt = (ciphertext: string) => ciphertext;
    } catch (e) {
      console.warn('Test setup: failed to initialize master key', e);
    }
  })();

  const timeout = new Promise<void>((resolve) => setTimeout(resolve, 2000));

  // Wait for whichever finishes first: initialization or timeout
  await Promise.race([initPromise, timeout]);

  // Inject light theme colors into jsdom so axe and computed styles can evaluate contrast
  try {
    const light = getThemeColors('light');
    // Apply basic page-level styles
    if (typeof document !== 'undefined' && document.documentElement) {
      document.body.style.backgroundColor = light.background;
      document.body.style.color = light.foreground;
      // Set CSS custom properties used by app styles where possible
      Object.entries({
        '--primary': light.primary,
        '--primary-foreground': light.primaryForeground,
        '--destructive': light.destructive,
        '--destructive-foreground': light.destructiveForeground,
        '--muted': light.muted,
        '--muted-foreground': light.mutedForeground,
        '--card': light.card,
        '--card-foreground': light.cardForeground,
      }).forEach(([k, v]) => {
        try { 
          document.documentElement.style.setProperty(k, v as string); 
        } catch {
          // Ignore errors setting CSS properties
        }
      });
    }
  } catch (e) {
    // Non-fatal for test runs
    console.warn('Test setup: failed to inject theme colors into jsdom', e);
  }
});

// Test-only: mock focus-trap-react to be a no-op wrapper to avoid focus-trap differences in jsdom
import React from 'react';

// Test-only: mock focus-trap-react to be a no-op wrapper to avoid focus-trap differences in jsdom
vi.mock('focus-trap-react', () => ({
  __esModule: true,
  default: (props: { children?: React.ReactNode }) => React.createElement(React.Fragment, null, props.children),
}));