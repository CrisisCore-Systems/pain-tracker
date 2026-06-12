export interface CamouflageMapping {
  readonly objectStore: string;
  readonly tableKeyPrefix: string;
  readonly valueField: string;
}

export interface CamouflageSeed {
  readonly schemeVersion: number;
  readonly objectStore: string;
  readonly tableKeyPrefix: string;
  readonly valueField: string;
  readonly createdAt: number;
}

export interface CamofalogueOptions {
  readonly seedPrefix?: string;
  readonly rng?: () => number;
}

export interface CamouflageEngine {
  mapStore(storeName: string): CamouflageMapping;
  encodeRecord(payload: unknown): ArrayBuffer;
  decodeRecord(buffer: ArrayBuffer): unknown;
  generateSeed(): CamouflageSeed;
  resolveSeed(seed: CamouflageSeed): CamouflageMapping;
}
