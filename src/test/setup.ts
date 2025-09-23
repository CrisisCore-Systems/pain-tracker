import '@testing-library/jest-dom';
import { expect, afterEach, vi, beforeAll } from 'vitest';
import { securityService } from '../services/SecurityService';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import CryptoJS from 'crypto-js';

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
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { createCanvas, CanvasRenderingContext2D } = require('canvas');

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
  try {
    // Initialize a deterministic master key for tests so SecurityService can encrypt/decrypt
    // Using a password keeps the derived master key deterministic across runs
    await securityService.initializeMasterKey('vitest-seed-password');

    // Seed a deterministic master key object in localStorage so EncryptionService can find it if it
    // attempts to list keys directly (some tests manipulate localStorage directly)
    const seededKey = CryptoJS.SHA256('vitest-seed-key-2025').toString();
    const record = JSON.stringify({ key: seededKey, created: new Date().toISOString() });
    window.localStorage.setItem('key:pain-tracker-master', record);

    // Provide default no-op encryption hooks for secureStorage encrypt:true paths in tests
    (globalThis as unknown as { __secureStorageEncrypt?: (p:string)=>string }).__secureStorageEncrypt = (plaintext: string) => plaintext;
    (globalThis as unknown as { __secureStorageDecrypt?: (c:string)=>string }).__secureStorageDecrypt = (ciphertext: string) => ciphertext;
  } catch (e) {
    // If master key initialization fails for some environment, keep test-run resilient
    // but log the issue for investigation
    // eslint-disable-next-line no-console
    console.warn('Test setup: failed to initialize master key', e);
  }
});