export function stableHash(input: string): number {
  // FNV-1a 32-bit
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export function pickVariant<T>(seed: string, variants: readonly T[]): T {
  if (variants.length === 0) throw new Error('pickVariant requires at least one variant');
  const idx = stableHash(seed) % variants.length;
  return variants[idx] as T;
}
