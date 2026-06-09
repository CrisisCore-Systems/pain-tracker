import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createCamouflageEngine, type CamouflageSeed } from './camouflage';

const deterministicRng = (() => {
  let seed = 42;
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return (seed >>> 8) / 16777216;
  };
})();

describe('createCamouflageEngine', () => {
  let engine: ReturnType<typeof createCamouflageEngine>;

  beforeEach(() => {
    engine = createCamouflageEngine({ rng: deterministicRng });
  });

  it('produces stable mapping for same store name', () => {
    const a = engine.mapStore('pain-entry');
    const b = engine.mapStore('pain-entry');
    expect(a.objectStore).toBe(b.objectStore);
    expect(a.tableKeyPrefix).toBe(b.tableKeyPrefix);
    expect(a.valueField).toBe(b.valueField);
  });

  it('produces different mappings for different store names', () => {
    const a = engine.mapStore('pain-entry');
    const b = engine.mapStore('emergency-data');
    expect(a.objectStore).not.toBe(b.objectStore);
  });

  it('round-trips payload via binary blob', () => {
    const payload = { pain_level: 7, location: 'neck', triggers: ['stress'] };
    const buffer = engine.encodeRecord(payload);
    expect(Object.prototype.toString.call(buffer)).toBe('[object ArrayBuffer]');
    const decoded = engine.decodeRecord(buffer);
    expect(decoded).toEqual(payload);
  });

  it('generates seed and resolves same mapping', () => {
    const seed = engine.generateSeed();
    expect(seed.schemeVersion).toBe(1);
    const resolved = engine.resolveSeed(seed);
    const direct = engine.mapStore('activity-log');
    // resolveSeed should be deterministic because seed stores the derived mapping directly
    expect(resolved.objectStore).toBe(seed.objectStore);
    expect(resolved.valueField).toBe(seed.valueField);
  });
});
