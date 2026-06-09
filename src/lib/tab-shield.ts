export const TAB_LOCK_NAME = 'pain-tracker-single-tenant-vault';
export const TAB_CHANNEL_NAME = 'pain-tracker-tab-signaling';

export const LOCK_STAGE = {
  ACQUIRING: 'acquiring',
  HELD: 'held',
  DENIED: 'denied',
  RELEASED: 'released',
} as const;
export type LockStage = (typeof LOCK_STAGE)[keyof typeof LOCK_STAGE];

export const TAB_EVENT_TYPE = {
  LOCK_ACQUIRED: 'lock-acquired',
  LOCK_DENIED: 'lock-denied',
  LOCK_RELEASED: 'lock-released',
  LOCK_REACQUIRED: 'lock-reacquired',
  HEARTBEAT_OK: 'heartbeat-ok',
} as const;
export type TabEventType = (typeof TAB_EVENT_TYPE)[keyof typeof TAB_EVENT_TYPE];

export interface TabEvent {
  type: TabEventType;
  tabId: string;
  timestamp: number;
}

export type TabShieldMode = 'primary' | 'secondary' | 'conflict' | 'unknown';

export interface TabShieldState {
  mode: TabShieldMode;
  stage: LockStage;
  tabId: string;
  startedAt: number;
  lockedAt?: number;
  releasedAt?: number;
  conflictNotifiedAt?: number;
  lastEvent?: TabEvent;
}

export interface TabShieldReport {
  ok: boolean;
  mode: TabShieldMode;
  stage: LockStage;
  aborted: boolean;
}

export interface LeaseResult {
  held: boolean;
  reason: string;
}

export interface TabShieldOptions {
  lockName?: string;
  channelName?: string;
  heartbeatMs?: number;
  secondaryAbandonMs?: number;
}

export interface BrowserTabShieldBackend {
  requestExclusiveLock(name: string, callback: (event: LockEvent) => Promise<void>): Promise<void>;
  queryLock(name: string): Promise<boolean>;
  postMessage(channel: string, message: unknown): void;
  addEventListener(type: string, handler: (event: MessageEvent) => void): void;
  removeEventListener(type: string, handler: (event: MessageEvent) => void): void;
  setTimeout(handler: () => void, ms: number): number;
  clearTimeout(handle: number): void;
  setInterval(handler: () => void, ms: number): number;
  clearInterval(handle: number): void;
  caches: CacheStorage;
  localStorage: Storage;
  sessionStorage: Storage;
  indexedDB: IDBFactory;
  BroadCastChannel: typeof BroadcastChannel;
}

export interface LockEvent {
  lock: Lock | null;
  mode: 'exclusive' | 'shared';
}

export interface LockManager {
  release: () => Promise<void>;
  extend: (callback: (event: LockEvent) => Promise<void>) => Promise<void>;
}

class BrowserTabShieldBackendImpl implements BrowserTabShieldBackend {
  private timerHandles: number[] = [];

  async requestExclusiveLock(name: string, callback: (event: LockEvent) => Promise<void>): Promise<void> {
    await navigator.locks.request(name, { steal: false, mode: 'exclusive' }, async (lock) => {
      await callback({ lock, mode: lock ? 'exclusive' : 'shared' });
    });
  }

  async queryLock(_name: string): Promise<boolean> {
    return false;
  }

  postMessage(channel: string, message: unknown): void {
    try {
      const bc = new BroadcastChannel(channel);
      bc.postMessage(message);
      bc.close();
    } catch {
      // ignore broadcast failures
    }
  }

  addEventListener(type: string, handler: (event: MessageEvent) => void): void {
    window.addEventListener(type, handler as EventListener);
  }

  removeEventListener(type: string, handler: (event: MessageEvent) => void): void {
    window.removeEventListener(type, handler as EventListener);
  }

  setTimeout(handler: () => void, ms: number): number {
    const handle = window.setTimeout(handler, ms);
    this.timerHandles.push(handle);
    return handle;
  }

  clearTimeout(handle: number): void {
    window.clearTimeout(handle);
    this.timerHandles = this.timerHandles.filter(h => h !== handle);
  }

  setInterval(handler: () => void, ms: number): number {
    const handle = window.setInterval(handler, ms);
    this.timerHandles.push(handle);
    return handle;
  }

  clearInterval(handle: number): void {
    window.clearInterval(handle);
    this.timerHandles = this.timerHandles.filter(h => h !== handle);
  }

  get caches() {
    return globalThis.caches;
  }

  get localStorage() {
    return globalThis.localStorage;
  }

  get sessionStorage() {
    return globalThis.sessionStorage;
  }

  get indexedDB() {
    return globalThis.indexedDB;
  }

  get BroadCastChannel() {
    return BroadcastChannel;
  }

  dispose() {
    for (const handle of this.timerHandles) {
      window.clearTimeout(handle);
      window.clearInterval(handle);
    }
    this.timerHandles = [];
  }
}

export class TabShield {
  private readonly options: Required<TabShieldOptions>;
  private readonly backend: BrowserTabShieldBackend;
  private currentLock: Lock | null = null;
  private state: TabShieldState;

  private timerHandles: number[] = [];
  private broadcastHandler: ((event: MessageEvent) => void) | null = null;
  private visibilityHandler: (() => void) | null = null;
  private disposed = false;

  constructor(backend: BrowserTabShieldBackend | null = null, options: TabShieldOptions = {}) {
    this.backend = backend ?? new BrowserTabShieldBackendImpl();
    this.options = {
      lockName: options.lockName ?? TAB_LOCK_NAME,
      channelName: options.channelName ?? TAB_CHANNEL_NAME,
      heartbeatMs: options.heartbeatMs ?? 15000,
      secondaryAbandonMs: options.secondaryAbandonMs ?? 10000,
    };

    this.state = {
      mode: 'unknown',
      stage: 'acquiring',
      tabId: generateTabId(),
      startedAt: Date.now(),
    };
  }

  get currentState(): TabShieldState {
    return { ...this.state };
  }

  async lease(): Promise<LeaseResult> {
    if (this.disposed) {
      return { held: false, reason: 'disposed' };
    }

    if (!('locks' in navigator)) {
      this.setStage('released');
      this.setMode('primary');
      return { held: false, reason: 'browser_locks_missing' };
    }

    this.setStage('acquiring');

    try {
      await navigator.locks.request(this.options.lockName, { steal: false, mode: 'exclusive' }, async (lock) => {
        this.currentLock = lock;

        switch (lock ? 'exclusive' : 'shared') {
          case 'exclusive':
            this.setStage('held');
            this.setMode('primary');
            this.notifyAcquired();
            this.startHeartbeat();
            if (typeof document !== 'undefined') {
              this.visibilityHandler = () => this.handleVisibilityChange();
              document.addEventListener('visibilitychange', this.visibilityHandler);
            }
            break;
          case 'shared':
            this.setStage('denied');
            this.setMode('secondary');
            await this.surrenderSecondary();
            break;
        }
      });

      if (this.state.mode === 'primary') {
        return { held: true, reason: 'lock_acquired' };
      }
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      if (reason === 'lock_denied') {
        this.setStage('denied');
        this.setMode('secondary');
        await this.surrenderSecondary();
        return { held: false, reason };
      }
    }

    if (this.state.mode === 'primary') {
      return { held: true, reason: 'lock_acquired' };
    }

    return { held: false, reason: 'lock_denied' };
  }

  async release(): Promise<void> {
    try {
      this.stopHeartbeat();
      this.removeVisibilityHandler();
      this.setStage('released');
      this.setMode('unknown');
      this.currentLock = null;
    } catch {
      // best-effort cleanup
    }
  }

  async abandonSecondary(): Promise<void> {
    if (this.state.mode !== 'secondary') return;

    await this.release();

    try {
      this.backend.sessionStorage.setItem(
        `${this.options.lockName}:secondary-abandon`,
        String(Date.now())
      );
    } catch {
      // ignore storage failures during abandon
    }

    this.setMode('secondary');
    this.setStage('released');
  }

  destroy(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.release().catch(() => {});
    this.removeBroadcastListener();
    this.removeVisibilityHandler();
    for (const handle of this.timerHandles) {
      this.backend.clearTimeout(handle);
      this.backend.clearInterval(handle);
    }
    this.timerHandles = [];
  }

  subscribe(callback: (state: TabShieldState, event?: TabEvent) => void): () => void {
    const wrapped: typeof callback = (state, event) => {
      if (!this.disposed) callback(state, event);
    };
    this.invokeCallback = wrapped;
    return () => {
      if (this.invokeCallback === wrapped) {
        this.invokeCallback = null;
      }
    };
  }

  private invokeCallback: ((state: TabShieldState, event?: TabEvent) => void) | null = null;

  private startHeartbeat(): void {
    this.stopHeartbeat();
    const handle = this.backend.setInterval(() => {
      if (this.disposed) {
        this.stopHeartbeat();
        return;
      }
      if (this.invokeCallback) {
        this.invokeCallback(this.currentState, {
          type: TAB_EVENT_TYPE.HEARTBEAT_OK,
          tabId: this.state.tabId,
          timestamp: Date.now(),
        });
      }
    }, this.options.heartbeatMs);
    this.timerHandles.push(handle);
  }

  private stopHeartbeat(): void {
    for (const handle of this.timerHandles.splice(0)) {
      this.backend.clearInterval(handle);
    }
  }

  private handleVisibilityChange(): void {
    if (typeof document === 'undefined') return;

    if (!document.hidden && this.state.mode === 'primary' && this.state.stage === 'held') {
      if (this.invokeCallback) {
        this.invokeCallback(this.currentState, {
          type: TAB_EVENT_TYPE.LOCK_REACQUIRED,
          tabId: this.state.tabId,
          timestamp: Date.now(),
        });
      }
    }
  }

  private notifyAcquired(): void {
    const event: TabEvent = {
      type: TAB_EVENT_TYPE.LOCK_ACQUIRED,
      tabId: this.state.tabId,
      timestamp: Date.now(),
    };
    this.state.lastEvent = event;
    this.backend.postMessage(this.options.channelName, event);
  }

  private async surrenderSecondary(): Promise<void> {
    this.setMode('secondary');
    this.setStage('acquiring');

    await new Promise<void>((resolve) => {
      const timeoutHandle = this.backend.setTimeout(() => {
        this.backend.clearTimeout(timeoutHandle);
        this.abandonSecondary().then(resolve).catch(resolve);
      }, this.options.secondaryAbandonMs);
      this.timerHandles.push(timeoutHandle);
    });

    if (this.disposed) return;

    this.setMode('secondary');
    this.setStage('released');
  }

  private setMode(mode: TabShieldMode) {
    this.state = { ...this.state, mode };
    this.emitState();
  }

  private setStage(stage: LockStage) {
    this.state = {
      ...this.state,
      stage,
      ...(stage === 'held' ? { lockedAt: Date.now() } : {}),
      ...(stage === 'released' ? { releasedAt: Date.now() } : {}),
    };
    this.emitState();
  }

  private emitState() {
    if (this.invokeCallback && !this.disposed) {
      this.invokeCallback(this.currentState);
    }
  }

  private removeBroadcastListener() {
    if (this.broadcastHandler) {
      this.backend.removeEventListener('message', this.broadcastHandler);
      this.broadcastHandler = null;
    }
  }

  private removeVisibilityHandler() {
    if (this.visibilityHandler && typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
      this.visibilityHandler = null;
    }
  }
}

function generateTabId(): string {
  try {
    const stored = sessionStorage.getItem('pain-tracker-tab-id');
    if (stored) return stored;
    const id = `tab_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem('pain-tracker-tab-id', id);
    return id;
  } catch {
    return `tab_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }
}

export function createTabShield(options?: TabShieldOptions): TabShield {
  return new TabShield(null, options);
}
