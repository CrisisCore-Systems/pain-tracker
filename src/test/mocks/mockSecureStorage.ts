export function createMockSecureStorage(initial: Record<string, string> = {}) {
  const store = new Map<string, string>(Object.entries(initial));
  return {
    get: (k: string) => {
      const v = store.get(k);
      if (v === undefined) return null;
      try {
        return JSON.parse(v);
      } catch {
        return v;
      }
    },
    set: (k: string, value: unknown) => {
      try {
        store.set(k, JSON.stringify(value));
        return { success: true };
      } catch {
        return { success: false, error: 'SERIALIZE' };
      }
    },
    remove: (k: string) => {
      store.delete(k);
      return true;
    },
    keys: () => Array.from(store.keys()),
  } as const;
}

export default createMockSecureStorage;
