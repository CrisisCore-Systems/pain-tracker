/**
 * Storage size estimator helpers
 */
export function estimateBytes(value: unknown): number {
  try {
    const str = typeof value === 'string' ? value : JSON.stringify(value);
    // Use Blob to estimate bytes if available
    try {
      return new Blob([str]).size;
    } catch {
      // fallback to UTF-8 byte count
      return Buffer.byteLength(str, 'utf8');
    }
  } catch {
    return 0;
  }
}

export function isLikelyExceedingLimit(value: unknown, limitBytes: number): boolean {
  return estimateBytes(value) > limitBytes;
}

export default { estimateBytes, isLikelyExceedingLimit };
