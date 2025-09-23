/**
 * Minimal AES-GCM encrypted IndexedDB wrapper (opt-in)
 * - Exposes encryptAndStore and retrieveAndDecrypt helpers
 * - Uses SubtleCrypto (Web Crypto) for AES-GCM
 * - This is a minimal shim; production use should include key management and rotation
 */

export async function generateCryptoKey(importFromHex?: string): Promise<CryptoKey> {
  const subtle = typeof window !== 'undefined' ? window.crypto.subtle : (globalThis as any).crypto.subtle;
  if (importFromHex) {
    const raw = hexToBytes(importFromHex);
    return await subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
  }
  const key = await subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
  return key;
}

function hexToBytes(hex: string): Uint8Array {
  const res = new Uint8Array(hex.length / 2);
  for (let i = 0; i < res.length; i++) res[i] = parseInt(hex.substr(i * 2, 2), 16);
  return res;
}

async function encodeString(str: string): Promise<Uint8Array> {
  return new TextEncoder().encode(str);
}

async function decodeString(buf: Uint8Array): Promise<string> {
  return new TextDecoder().decode(buf);
}

export async function encryptAndStore(dbName: string, storeName: string, keyId: string, dataKey: string, value: string, cryptoKey: CryptoKey) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = await encodeString(value);
  // crypto.subtle expects a BufferSource; Uint8Array.buffer is an ArrayBuffer
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, cryptoKey, encoded.buffer as ArrayBuffer);

  const toStore = {
    iv: Array.from(iv),
    data: Array.from(new Uint8Array(cipher))
  };

  // Use simple IndexedDB wrapper
  const req = indexedDB.open(dbName);
  req.onupgradeneeded = () => {
    const db = req.result;
    if (!db.objectStoreNames.contains(storeName)) db.createObjectStore(storeName);
  };
  await new Promise<void>((resolve, reject) => {
    req.onsuccess = () => {
      const db = req.result;
      const tx = db.transaction(storeName, 'readwrite');
      tx.objectStore(storeName).put(toStore, dataKey);
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = () => reject(tx.error);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function retrieveAndDecrypt(dbName: string, storeName: string, dataKey: string, cryptoKey: CryptoKey): Promise<string | null> {
  const req = indexedDB.open(dbName);
  return await new Promise<string | null>((resolve, reject) => {
    req.onsuccess = async () => {
      try {
        const db = req.result;
        const tx = db.transaction(storeName, 'readonly');
        const r = tx.objectStore(storeName).get(dataKey);
        r.onsuccess = async () => {
          const stored = r.result;
          if (!stored) { db.close(); resolve(null); return; }
          const iv = new Uint8Array(stored.iv);
          const data = new Uint8Array(stored.data);
          // Pass an ArrayBuffer view's buffer to subtle.decrypt
          const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, cryptoKey, data.buffer as ArrayBuffer);
          db.close();
          resolve(await decodeString(new Uint8Array(plain)));
        };
        r.onerror = () => { db.close(); reject(r.error); };
      } catch (e) { reject(e); }
    };
    req.onerror = () => reject(req.error);
  });
}
