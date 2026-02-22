import type { ModuleId } from '../../config/modules';
import type { EntitlementProvider } from './EntitlementProvider';

const LOCAL_ENTITLEMENTS_KEY = 'pain-tracker:entitlements-v1';

type LocalEntitlements = {
  modules: ModuleId[];
  updatedAt: string; // ISO
};

function readLocalEntitlements(): LocalEntitlements | null {
  if (globalThis.window === undefined) return null;

  try {
    const raw = globalThis.localStorage.getItem(LOCAL_ENTITLEMENTS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<LocalEntitlements>;
    if (!parsed || !Array.isArray(parsed.modules)) return null;
    return {
      modules: parsed.modules as ModuleId[],
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date(0).toISOString(),
    };
  } catch {
    return null;
  }
}

function writeLocalEntitlements(ent: LocalEntitlements) {
  if (globalThis.window === undefined) return;
  globalThis.localStorage.setItem(LOCAL_ENTITLEMENTS_KEY, JSON.stringify(ent));
}

/**
 * Local entitlements (dev grants today; signed license import in the future).
 */
export class LocalEntitlementsProvider implements EntitlementProvider {
  listEntitledModules(): ModuleId[] {
    return readLocalEntitlements()?.modules ?? [];
  }

  grant(moduleId: ModuleId) {
    const existing = readLocalEntitlements();
    const set = new Set<ModuleId>(existing?.modules ?? []);
    set.add(moduleId);
    writeLocalEntitlements({
      modules: Array.from(set),
      updatedAt: new Date().toISOString(),
    });
  }

  revoke(moduleId: ModuleId) {
    const existing = readLocalEntitlements();
    if (!existing) return;
    const set = new Set<ModuleId>(existing.modules);
    set.delete(moduleId);
    writeLocalEntitlements({
      modules: Array.from(set),
      updatedAt: new Date().toISOString(),
    });
  }

  clear() {
    if (globalThis.window === undefined) return;
    try {
      globalThis.localStorage.removeItem(LOCAL_ENTITLEMENTS_KEY);
    } catch {
      // ignore
    }
  }
}
