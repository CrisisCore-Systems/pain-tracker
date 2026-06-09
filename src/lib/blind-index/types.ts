export const BLIND_INDEX_DB_NAME = 'pain-tracker-blind-index';
export const BLIND_INDEX_STORE_NAME = 'blind-index-tokens';

export type FieldName =
  | 'location'
  | 'description'
  | 'triggers'
  | 'medications'
  | 'activities'
  | 'mood'
  | 'weather'
  | 'notes';

export interface BlindIndexEntry {
  field: FieldName;
  token: string;
  rowKey: string;
  createdAt: string;
}

export interface SearchResult {
  rowKey: string;
  token: string;
}

export interface BlindIndexBackend {
  init?(): Promise<void>;
  upsertToken(entry: BlindIndexEntry): Promise<void>;
  batchUpsert(entries: BlindIndexEntry[]): Promise<void>;
  searchTokens(field: FieldName, token: string): Promise<SearchResult[]>;
  removeTokensForRow(rowKey: string): Promise<void>;
  clearField(field: FieldName): Promise<void>;
  clearAll(): Promise<void>;
}

export interface BlindIndexEngine {
  indexRecord(rowKey: string, data: Record<string, unknown>): Promise<void>;
  search(field: FieldName, value: string): Promise<string[]>;
  removeRecord(rowKey: string): Promise<void>;
  clear(): Promise<void>;
}

export type BlindIndexConfig = {
  pepper?: Uint8Array;
};
