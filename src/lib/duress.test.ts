import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createDuressCauldron } from './duress';

describe('createDuressCauldron', () => {
  let cauldron: ReturnType<typeof createDuressCauldron>;

  beforeEach(() => {
    cauldron = createDuressCauldron({
      salt: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]),
      iterations: 1000,
    });
  });

  it('derives a clean material from a passphrase', async () => {
    const material = await cauldron.unlock('clean-pass');
    expect(material.tier).toBe('clean');
    expect(material.seed.length).toBe(32);
    expect(material.key).toBeDefined();
  });

  it('derives dual key pair with distinct tiers', async () => {
    const { clean, real } = await cauldron.deriveDualKeyPair('clean-pass', 'real-pass');
    expect(clean.tier).toBe('clean');
    expect(real.tier).toBe('real');
    expect(clean.seed).not.toEqual(real.seed);
  });

  it('seals decoy slots into ciphertext blobs', async () => {
    await cauldron.deriveDualKeyPair('clean-pass', 'real-pass');
    const real = cauldron.getRealMaterial()!;
    const slots = await cauldron.sealDecoySlots(real.key, [
      { label: 'slot-a', data: 'example' },
    ]);
    expect(slots.length).toBe(1);
    expect(slots[0]?.length ?? 0).toBeGreaterThan(0);
  });

  it('queries slot returns DuressQueryResult with tier', async () => {
    await cauldron.deriveDualKeyPair('clean-pass', 'real-pass');
    const material = cauldron.getRealMaterial()!;
    const sealed = await cauldron.sealDecoySlots(material.key, [{ decoy: true }]);
    const result = cauldron.querySlot(sealed[0]!);
    expect(result).toHaveProperty('tier');
    expect(result).toHaveProperty('lookedLikeReal');
    expect(result).toHaveProperty('slotsFilled');
  });

  it('returns null material before initialization', () => {
    const fresh = createDuressCauldron();
    expect(fresh.getCleanMaterial()).toBeNull();
    expect(fresh.getRealMaterial()).toBeNull();
  });
});
