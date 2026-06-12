export type PassphraseTier = 'clean' | 'real' | 'invalid';

export interface DuressKeyMaterial {
  readonly tier: PassphraseTier;
  readonly seed: Uint8Array;
  readonly key: CryptoKey;
}

export interface DuressEngineConfig {
  readonly salt?: Uint8Array;
  readonly iterations?: number;
}

export interface DuressQueryResult {
  readonly tier: PassphraseTier;
  readonly lookedLikeReal: boolean;
  readonly slotsFilled: number;
  readonly decoyReadable: boolean;
}
