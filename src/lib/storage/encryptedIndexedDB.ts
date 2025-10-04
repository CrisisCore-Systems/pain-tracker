import { vaultService } from '../../services/VaultService';
import { getSodium } from '../crypto/sodium';

export interface VaultIndexedDBRecord {
  v: 'xchacha20-poly1305';
  n: string;
  c: string;
  createdAt: string;
  keyVersion: string;
  metadata?: Record<string, unknown>;
}

interface LegacyRecord {
  iv: number[];
  data: number[];
}

function openDb(dbName: string, storeName: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName);
      }
    };
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

export async function encryptAndStore(
  dbName: string,
  storeName: string,
  entryKey: string,
  value: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  if (!vaultService.isUnlocked()) {
    throw new Error('Vault must be unlocked before storing encrypted data.');
  }

  const db = await openDb(dbName, storeName);

  try {
    const encoder = new TextEncoder();
    const payload = encoder.encode(value);
    const { nonce, cipher } = vaultService.encryptBytes(payload);
    const record: VaultIndexedDBRecord = {
      v: 'xchacha20-poly1305',
      n: nonce,
      c: cipher,
      createdAt: new Date().toISOString(),
      keyVersion: vaultService.getStatus().metadata?.version ?? 'unknown',
      metadata
    };

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      store.put(record, entryKey);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}

export async function retrieveAndDecrypt(
  dbName: string,
  storeName: string,
  entryKey: string
): Promise<string | null> {
  if (!vaultService.isUnlocked()) {
    return null;
  }

  const db = await openDb(dbName, storeName);

  try {
    const record = await new Promise<VaultIndexedDBRecord | LegacyRecord | null>((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.get(entryKey);
      request.onsuccess = () => resolve(request.result ?? null);
      request.onerror = () => reject(request.error);
    });

    if (!record) {
      return null;
    }

    if (isVaultRecord(record)) {
      const data = vaultService.decryptBytes({ nonce: record.n, cipher: record.c });
      const decoder = new TextDecoder();
      return decoder.decode(data);
    }

    if (isLegacyRecord(record)) {
      const decoder = new TextDecoder();
      const sodium = await getSodium();
      const iv = new Uint8Array(record.iv);
      const cipher = new Uint8Array(record.data);

      try {
        const key = await deriveLegacyKey();
        if (!key) {
          throw new Error('Legacy key unavailable');
        }
        const subtle = crypto.subtle;
        const cryptoKey = await subtle.importKey('raw', key, { name: 'AES-GCM' }, false, ['decrypt']);
        const decrypted = await subtle.decrypt({ name: 'AES-GCM', iv }, cryptoKey, cipher.buffer as ArrayBuffer);
        const plain = new Uint8Array(decrypted);
        const text = decoder.decode(plain);

        await encryptAndStore(dbName, storeName, entryKey, text);
        return text;
      } catch {
        const text = decoder.decode(new Uint8Array(cipher));
        await encryptAndStore(dbName, storeName, entryKey, text);
        return text;
      } finally {
        sodium.memzero(iv);
        sodium.memzero(cipher);
      }
    }

    return null;
  } finally {
    db.close();
  }
}

export async function migrateIndexedDBStore(dbName: string, storeName: string): Promise<{ migrated: number }> {
  if (!vaultService.isUnlocked()) {
    throw new Error('Vault must be unlocked before running migrations.');
  }

  const db = await openDb(dbName, storeName);
  let migrated = 0;

  try {
    const keys = await new Promise<IDBValidKey[]>((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.getAllKeys();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    for (const key of keys) {
      const raw = await new Promise<VaultIndexedDBRecord | LegacyRecord | null>((resolve, reject) => {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result ?? null);
        request.onerror = () => reject(request.error);
      });

      if (!raw) continue;
      if (isVaultRecord(raw)) continue;

      const value = await retrieveAndDecrypt(dbName, storeName, key as string);
      if (value != null) {
        await encryptAndStore(dbName, storeName, key as string, value);
        migrated += 1;
      }
    }
  } finally {
    db.close();
  }

  return { migrated };
}

function isVaultRecord(record: VaultIndexedDBRecord | LegacyRecord): record is VaultIndexedDBRecord {
  return (record as VaultIndexedDBRecord).v === 'xchacha20-poly1305';
}

function isLegacyRecord(record: VaultIndexedDBRecord | LegacyRecord): record is LegacyRecord {
  return Array.isArray((record as LegacyRecord).iv) && Array.isArray((record as LegacyRecord).data);
}

async function deriveLegacyKey(): Promise<ArrayBuffer | null> {
  try {
    const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
    return crypto.subtle.exportKey('raw', key);
  } catch {
    return null;
  }
}
