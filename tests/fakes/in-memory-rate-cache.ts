import type { RateCache, CachedRate } from '../../src/caching-rate-provider';

export class InMemoryRateCache implements RateCache {
  private items = new Map<string, CachedRate>();

  get(key: string): CachedRate | undefined {
    return this.items.get(key);
  }

  set(key: string, value: CachedRate): void {
    this.items.set(key, value);
  }

  get size(): number {
    return this.items.size;
  }
}
