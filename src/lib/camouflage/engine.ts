import type { CamouflageMapping, CamofalogueOptions, CamouflageEngine, CamouflageSeed } from './types';

const PREFIXES = [
  '__am_telemetry_v2',
  '__campaign_slug_774a',
  '__ad_impression_9f3e',
  '__analytics_event_3b1c',
  '__tracking_pixel_aa11',
  '__ad_set_5d22',
  '__utm_debug_bb44',
  '__marketing_payload_c1',
];

const VALUE_FIELDS = [
  'webpack_mod_chunk_774a',
  'cached_theme_manifest_blob',
  'compressed_asset_hash_9f3e',
  'serialized_feature_flag_3b1c',
  'encoded_ab_test_payload_aa11',
  'prefetch_cache_entry_5d22',
  'lazy_chunk_manifest_bb44',
  'service_worker_precache_c1',
];

function generateMapping(seed: number): CamouflageMapping {
  const pseudo = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return (seed >>> 8) / 16777216;
  };
  const pick = (items: readonly string[]) => items[Math.floor(pseudo() * items.length)];
  return {
    objectStore: pick(PREFIXES),
    tableKeyPrefix: pick(PREFIXES),
    valueField: pick(VALUE_FIELDS),
  };
}

export function createCamouflageEngine(options: CamofalogueOptions = {}): CamouflageEngine {
  const seedPrefix = options.seedPrefix ?? '__pain_tracker_camo_seed_v1';
  const rng = options.rng ?? (() => Math.random());

  return {
    mapStore(storeName: string): CamouflageMapping {
      let hash = 0;
      for (let i = 0; i < storeName.length; i++) {
        hash = ((hash << 5) - hash + storeName.charCodeAt(i)) | 0;
      }
      return generateMapping(Math.abs(hash) || 1);
    },

    encodeRecord(payload: unknown): ArrayBuffer {
      const encoded = new TextEncoder().encode(JSON.stringify(payload));
      return encoded.buffer;
    },

    decodeRecord(buffer: ArrayBuffer): unknown {
      const decoded = new TextDecoder().decode(new Uint8Array(buffer));
      return JSON.parse(decoded);
    },

    generateSeed(): CamouflageSeed {
      const raw = new Uint8Array(4);
      crypto.getRandomValues(raw);
      const seed = (raw[0] << 24) | (raw[1] << 16) | (raw[2] << 8) | raw[3];
      const mapping = generateMapping(seed);
      return {
        schemeVersion: 1,
        objectStore: mapping.objectStore,
        tableKeyPrefix: mapping.tableKeyPrefix,
        valueField: mapping.valueField,
        createdAt: Date.now(),
      };
    },

    resolveSeed(seed: CamouflageSeed): CamouflageMapping {
      return {
        objectStore: seed.objectStore,
        tableKeyPrefix: seed.tableKeyPrefix,
        valueField: seed.valueField,
      };
    },
  };
}
