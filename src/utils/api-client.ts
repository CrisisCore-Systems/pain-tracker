/** @crisiscore-hardened: API client + breaker (TS ESM) */
class CircuitBreaker {
  private f = 0;
  private t = 0;
  private s: 'CLOSED' | 'OPEN' | 'HALF' = 'CLOSED';
  constructor(
    private th = 3,
    private win = 30000,
    private half = 1
  ) {}
  get isClosed() {
    this.chk();
    return this.s === 'CLOSED';
  }
  success() {
    this.f = 0;
    this.s = 'CLOSED';
  }
  failure() {
    this.f++;
    this.t = Date.now();
    if (this.s === 'HALF' || this.f >= this.th) this.s = 'OPEN';
  }
  private chk() {
    if (this.s === 'OPEN' && Date.now() - this.t > this.win) {
      this.s = 'HALF';
      this.f = this.th - this.half;
    }
  }
}
export const wcbApiBreaker = new CircuitBreaker();
export async function wcbApiRequest<T>(endpoint: string, opts: RequestInit = {}): Promise<T> {
  if (!wcbApiBreaker.isClosed) throw new Error('Circuit breaker open');
  try {
    const base = (import.meta as any).env?.VITE_WCB_API_ENDPOINT || '/api/wcb';
    const res = await fetch(`${base}${endpoint}`, {
      ...opts,
      headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    });
    if (!res.ok) {
      wcbApiBreaker.failure();
      throw new Error(`API ${res.status}`);
    }
    wcbApiBreaker.success();
    return (await res.json()) as T;
  } catch (e) {
    wcbApiBreaker.failure();
    throw e;
  }
}
