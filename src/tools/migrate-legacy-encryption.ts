import { offlineStorage } from '../lib/offline-storage';
import { encryptionService } from '../services/EncryptionService';

type MigrateOptions = { dryRun?: boolean; backupPath?: string };

type StoredRow = {
  id?: number | string;
  data?: Record<string, unknown> | null;
};

/**
 * migrateLegacyEncryption
 * - Scans offlineStorage for all records
 * - Detects legacy payloads where metadata.version startsWith '1.' (CryptoJS CBC)
 * - Uses encryptionService to decrypt legacy payloads (lazy CryptoJS branch)
 * - Re-encrypts with current AES-GCM + HMAC path (version 2.0.0)
 * - Validates re-encrypted metadata includes version 2.0.0, iv, hmac
 * - If dryRun is false, updates the stored record in-place
 * - Safety: export backup before migration if backupPath provided
 */
export async function migrateLegacyEncryption(opts: MigrateOptions = {}) {
  const dryRun = !!opts.dryRun;
  const backupPath = opts.backupPath;

  await offlineStorage.init();

  // Fetch all records; offlineStorage may expose getAllData or getData
  let rows: StoredRow[] = [];
  if (
    typeof (offlineStorage as unknown as { getAllData?: () => Promise<StoredRow[]> }).getAllData ===
    'function'
  ) {
    rows = await (
      offlineStorage as unknown as { getAllData: () => Promise<StoredRow[]> }
    ).getAllData();
  } else if (
    typeof (offlineStorage as unknown as { getData?: (type: string) => Promise<StoredRow[]> })
      .getData === 'function'
  ) {
    rows = await (
      offlineStorage as unknown as { getData: (type: string) => Promise<StoredRow[]> }
    ).getData('pain-entry');
  } else {
    throw new Error('offlineStorage does not provide getAllData or getData');
  }

  // Create backup before migration (safety)
  if (backupPath && !dryRun) {
    try {
      const backupData = JSON.stringify(rows, null, 2);
      // In Node.js environments, write to file; in browser, download or log
      if (typeof window === 'undefined') {
        try {
          const fs = await import('fs');
          fs.writeFileSync(backupPath, backupData, 'utf-8');
          console.info(`[Migration] Backup saved to ${backupPath}`);
        } catch {
          console.warn('[Migration] fs import failed; backup data logged to console');
          console.info('[Migration] Backup:', backupData);
        }
      } else {
        console.warn(
          '[Migration] Backup requested but filesystem unavailable; backup data logged to console'
        );
        console.info('[Migration] Backup:', backupData);
      }
    } catch (e) {
      console.error('[Migration] Failed to create backup:', e);
      throw new Error('Migration aborted due to backup failure');
    }
  }

  let scanned = 0;
  let migrated = 0;
  const errors: Array<{ id?: number; error: string }> = [];
  const skipped: Array<{ id?: number; reason: string }> = [];

  for (const row of rows) {
    scanned++;
    try {
      const data = row?.data as StoredRow['data'];
      if (!data) {
        skipped.push({ id: row?.id as number, reason: 'No data field' });
        continue;
      }

      // Check metadata.version to detect legacy payloads
      const metadata = (data as { metadata?: Record<string, unknown> }).metadata;
      if (!metadata) {
        skipped.push({ id: row?.id as number, reason: 'No metadata' });
        continue;
      }

      const version =
        typeof metadata.version === 'string' ? metadata.version : String(metadata.version ?? '');
      if (!version.startsWith('1.')) {
        skipped.push({ id: row?.id as number, reason: `Already migrated (version: ${version})` });
        continue;
      }

      // Decrypt using encryptionService (legacy CryptoJS branch for v1.x)
      const decryptFn =
        (
          encryptionService as unknown as {
            decryptPainEntry?: (p: unknown) => Promise<unknown>;
            decrypt?: (p: unknown) => Promise<unknown>;
          }
        ).decryptPainEntry ??
        (encryptionService as unknown as { decrypt?: (p: unknown) => Promise<unknown> }).decrypt;

      if (typeof decryptFn !== 'function') {
        throw new Error('encryptionService does not expose a decrypt function');
      }

      const decrypted = await (decryptFn as (p: unknown) => Promise<unknown>)(data);

      // Re-encrypt with current AES-GCM + HMAC path (version 2.0.0)
      const encryptFn =
        (
          encryptionService as unknown as {
            encryptPainEntry?: (p: unknown) => Promise<unknown>;
            encrypt?: (p: unknown) => Promise<unknown>;
          }
        ).encryptPainEntry ??
        (encryptionService as unknown as { encrypt?: (p: unknown) => Promise<unknown> }).encrypt;

      if (typeof encryptFn !== 'function') {
        throw new Error('encryptionService does not expose an encrypt function');
      }

      const reEncrypted = await (encryptFn as (p: unknown) => Promise<unknown>)(decrypted);

      // Validate re-encrypted payload has version 2.0.0, iv, hmac
      const reEncMeta = (reEncrypted as { metadata?: Record<string, unknown> })?.metadata;
      if (!reEncMeta || !String(reEncMeta.version).startsWith('2.')) {
        throw new Error(
          `Re-encryption failed: metadata.version is ${reEncMeta?.version ?? 'missing'}, expected 2.x`
        );
      }
      if (!reEncMeta.iv || !reEncMeta.hmac) {
        console.warn(
          `[Migration] Warning: re-encrypted payload for id=${row.id} missing iv or hmac in metadata`
        );
      }

      // Update stored record if not dry run
      if (
        !dryRun &&
        row.id !== undefined &&
        typeof (
          offlineStorage as unknown as {
            updateData?: (id: number | string, payload: unknown) => Promise<void>;
          }
        ).updateData === 'function'
      ) {
        await (
          offlineStorage as unknown as {
            updateData: (id: number | string, payload: unknown) => Promise<void>;
          }
        ).updateData(row.id as number | string, reEncrypted);
      }

      migrated++;
    } catch (err) {
      const rawId = row?.id;
      const idNum =
        typeof rawId === 'number'
          ? rawId
          : typeof rawId === 'string' && /^\d+$/.test(rawId)
            ? Number(rawId)
            : undefined;
      errors.push({ id: idNum, error: err instanceof Error ? err.message : String(err) });
    }
  }

  return { scanned, migrated, skipped: skipped.length, errors };
}

// CLI wrapper
if (require.main === module) {
  (async () => {
    const argv = process.argv.slice(2);
    const dry = argv.includes('--dry-run') || argv.includes('-n');
    const backupIdx = argv.indexOf('--backup');
    const backupPath = backupIdx >= 0 && argv[backupIdx + 1] ? argv[backupIdx + 1] : undefined;

    console.info(
      `[Migration] Starting legacy encryption migration (dryRun=${dry}, backup=${backupPath ?? 'none'})...`
    );

    try {
      const result = await migrateLegacyEncryption({ dryRun: dry, backupPath });
      console.info('[Migration] Result:', result);
      console.info(
        `[Migration] Scanned: ${result.scanned}, Migrated: ${result.migrated}, Skipped: ${result.skipped}, Errors: ${result.errors.length}`
      );

      if (result.errors.length > 0) {
        console.error('[Migration] Errors encountered:');
        result.errors.forEach(e => console.error(`  - ID ${e.id ?? 'unknown'}: ${e.error}`));
      }

      if (dry) {
        console.info('[Migration] Dry run complete. No changes were written to storage.');
      } else {
        console.info('[Migration] Migration complete. Records updated in storage.');
      }

      process.exit(result.errors.length > 0 ? 1 : 0);
    } catch (e) {
      console.error('[Migration] Fatal error:', e);
      process.exit(2);
    }
  })();
}
