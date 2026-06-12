import type { DuressKeyMaterial, DuressQueryResult, DuressEngineConfig, PassphraseTier } from './types';
import { derivePassphraseKey, randomBytes, encryptToSlots, queryDecoy } from './crypto';

const DEFAULT_SALT = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
const DEFAULT_ITERATIONS = 200_000;
const DEFAULT_SLOTS = 8;

export function createDuressCauldron(config: DuressEngineConfig = {}) {
  const salt = config.salt ?? DEFAULT_SALT;
  const iterations = config.iterations ?? DEFAULT_ITERATIONS;

  let cleanMaterial: DuressKeyMaterial | null = null;
  let realMaterial: DuressKeyMaterial | null = null;

  function classifyTier(result: DuressQueryResult): PassphraseTier {
    if (result.lookedLikeReal) return 'real';
    return 'invalid';
  }

  async function unlock(passphrase: string): Promise<DuressKeyMaterial> {
    const raw = randomBytes(32);
    const key = await derivePassphraseKey(passphrase, salt, iterations);

    cleanMaterial = { tier: 'clean', seed: raw, key };
    return cleanMaterial;
  }

  async function deriveDualKeyPair(
    cleanPassphrase: string,
    realPassphrase: string
  ): Promise<{ clean: DuressKeyMaterial; real: DuressKeyMaterial }> {
    const clean = await unlock(cleanPassphrase);
    const realKey = await derivePassphraseKey(realPassphrase, salt, iterations);
    const realSeed = randomBytes(32);

    realMaterial = { tier: 'real', seed: realSeed, key: realKey };

    return { clean, real: realMaterial };
  }

  async function sealDecoySlots(
    key: CryptoKey,
    slots: Array<Record<string, unknown>>
  ): Promise<Uint8Array[]> {
    return encryptToSlots(key, slots);
  }

  function querySlot(cipherBytes: Uint8Array): DuressQueryResult {
    if (!realMaterial) throw new Error('Duress cauldron not initialized');
    return queryDecoy(cipherBytes, realMaterial.key);
  }

  function detectTier(query: DuressQueryResult): PassphraseTier {
    return classifyTier(query);
  }

  function getRealMaterial(): DuressKeyMaterial | null {
    return realMaterial;
  }

  function getCleanMaterial(): DuressKeyMaterial | null {
    return cleanMaterial;
  }

  return {
    unlock,
    deriveDualKeyPair,
    sealDecoySlots,
    querySlot,
    detectTier,
    getRealMaterial,
    getCleanMaterial,
  };
}
