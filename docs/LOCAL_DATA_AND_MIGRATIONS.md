# Local Data & Migrations

This app is offline-first. Data is persisted locally across multiple layers. This document explains where data lives, how it’s versioned, and how to ship safe migrations.

## Where data is stored

### 1) Zustand persisted store (app state)

- Store: `src/stores/pain-tracker-store.ts`
- Persist key: `pain-tracker-storage`
- Persist version: `version: 2`
- Migration hook: `migratePainTrackerState` from `src/stores/pain-tracker-migrations.ts`
- Partial persistence: entries, mood entries, emergency data, activity logs, scheduled reports

Notes:
- By default, `zustand/persist` uses `localStorage` in browsers.
- Migrations must be deterministic and must not drop user data silently.

### 2) Offline IndexedDB storage (PWA durability + sync queue)

- Implementation: `src/lib/offline-storage.ts`
- IndexedDB database: `pain-tracker-offline`
- Version: `dbVersion = 1`
- Object stores:
  - `offline-data` (indexes: type, timestamp, synced)
  - `sync-queue` (indexes: priority, timestamp, retryCount)
  - `cache-metadata` (index: expiry)

This layer is used for offline persistence patterns (including settings fallback and sync queue data).

### 3) Vault-backed encrypted IndexedDB (encrypted at rest)

- Implementation: `src/lib/storage/encryptedIndexedDB.ts`
- Record format: `VaultIndexedDBRecord` with `v: 'xchacha20-poly1305'` plus nonce/ciphertext
- Legacy handling: supports a legacy `{ iv, data }` record shape and auto-upgrades on read
- Store-wide migration helper: `migrateIndexedDBStore(dbName, storeName)`

Important:
- This requires the vault to be unlocked (`vaultService.isUnlocked()`).
- Treat “unlock” flows and key material as security-critical.

## Migration principles

- Prefer **additive** schema changes (add new optional fields) over destructive changes.
- Never assume local data is clean. Handle:
  - missing ids
  - non-ISO timestamps
  - partial records
  - unknown versions
- Migrations should be **idempotent** (safe to run multiple times).
- If a migration rewrites stored data, provide a **backup/export** path.

## How to add a Zustand persist migration

1. Update `src/stores/pain-tracker-migrations.ts` (or add a new helper it calls).
2. Keep behavior:
   - fill missing ids using high-entropy ids
   - normalize timestamps to ISO strings (see `toIsoString` usage)
   - preserve user data if fields are unknown
3. Add/adjust tests:
   - `src/test/stores/migration.test.ts`
   - `src/test/stores/persist-migrate.test.ts`

## How to add an IndexedDB migration

### OfflineStorageService DB version changes

- If you change object stores or indexes in `src/lib/offline-storage.ts`, bump `dbVersion` and implement `onupgradeneeded` changes.
- Write a test (or integration check) for upgrade behavior.

### Encrypted IndexedDB record changes

- If you change record formats in `src/lib/storage/encryptedIndexedDB.ts`, keep backward read support.
- Prefer lazy, per-record upgrades (upgrade on successful read) when feasible.
- Add a store-wide migration if you need to eagerly re-encrypt or normalize records.

## Existing migration tooling

- Legacy encryption migration utility: `src/tools/migrate-legacy-encryption.ts`
  - Scans `offlineStorage` records
  - Detects legacy metadata versions (`1.x`)
  - Re-encrypts into the current format (and can create a backup)

## Testing notes (IndexedDB in vitest)

- Test environment polyfill is set up in `src/test/setup.ts` via `fake-indexeddb/auto`.
- IndexedDB integration tests live under `src/test/integration/` (e.g., encryption + IndexedDB round-trips).

## Cross-link

If your change touches encryption, storage, exports, audit logging, or migrations, follow `docs/SECURITY_CHANGE_CHECKLIST.md`.
