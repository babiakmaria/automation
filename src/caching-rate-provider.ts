import type { RateProvider } from './order-service';

export interface Clock {
  now(): number;
}

export interface CachedRate {
  rate: number;
  fetchedAt: number;
}

export interface RateCache {
  get(key: string): CachedRate | undefined;
  set(key: string, value: CachedRate): void;
}

export const CACHE_TTL_MS = 60_000;

export const systemClock: Clock = {
  now: () => Date.now(),
};

export class CachingRateProvider implements RateProvider {
  constructor(
    private source: RateProvider,
    private cache: RateCache,
    private clock: Clock,
    private ttlMs = CACHE_TTL_MS,
  ) {}

  async getRate(from: string, to: string): Promise<number> {
    const key = `${from}:${to}`;
    const now = this.clock.now();
    const cached = this.cache.get(key);

    if (cached && now - cached.fetchedAt < this.ttlMs) {
      return cached.rate;
    }

    const rate = await this.source.getRate(from, to);
    this.cache.set(key, { rate, fetchedAt: now });
    return rate;
  }
}
