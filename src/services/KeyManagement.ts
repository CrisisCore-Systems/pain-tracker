export interface KeyManager {
  // Returns a base64-encoded encryption key for the given purpose.
  getKey(purpose: string): Promise<string>;

  // Rotate keys for a purpose (admin operation)
  rotateKey?(purpose: string): Promise<void>;
}

// Minimal in-memory stub for development; production must replace with KMS backed implementation
export class InMemoryKeyManager implements KeyManager {
  private keys = new Map<string, string>();
  async getKey(purpose: string) {
    if (!this.keys.has(purpose)) {
      // 256-bit random key, base64
      const buf = new Uint8Array(32);
      crypto.getRandomValues(buf);
      const k = Buffer.from(buf).toString('base64');
      this.keys.set(purpose, k);
    }
    return this.keys.get(purpose)!;
  }
  async rotateKey(purpose: string) {
    this.keys.delete(purpose);
  }
}
