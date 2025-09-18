import '@testing-library/jest-dom';
import { expect, afterEach, vi, beforeAll } from 'vitest';
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
beforeAll(() => {
  try {
    // Mimic stored key object shape used in EncryptionService.storeKey
    const key = CryptoJS.lib.WordArray.random(32).toString();
    const record = JSON.stringify({ key, created: new Date().toISOString() });
    // Stored under key:pain-tracker-master (un-encrypted for test harness simplification)
    window.localStorage.setItem('key:pain-tracker-master', record);
  // Provide default no-op encryption hooks for secureStorage encrypt:true paths in tests
  (globalThis as unknown as { __secureStorageEncrypt?: (p:string)=>string }).__secureStorageEncrypt = (plaintext: string) => plaintext;
  (globalThis as unknown as { __secureStorageDecrypt?: (c:string)=>string }).__secureStorageDecrypt = (ciphertext: string) => ciphertext;
  } catch {
    /* ignore */
  }
});