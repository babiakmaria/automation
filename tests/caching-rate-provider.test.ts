import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CachingRateProvider, systemClock } from '../src/caching-rate-provider';
import type { RateProvider } from '../src/order-service';
import { FakeClock } from './fakes/fake-clock';
import { InMemoryRateCache } from './fakes/in-memory-rate-cache';

describe('CachingRateProvider', () => {
  let source: RateProvider;
  let cache: InMemoryRateCache;
  let clock: FakeClock;
  let provider: CachingRateProvider;

  beforeEach(() => {
    source = { getRate: vi.fn().mockResolvedValue(41.25) }; // spy
    cache = new InMemoryRateCache(); // fake
    clock = new FakeClock(1_000); // fake
    provider = new CachingRateProvider(source, cache, clock);
  });

  it('за першого виклику отримує курс із джерела', async () => {
    await expect(provider.getRate('USD', 'UAH')).resolves.toBe(41.25);
    expect(source.getRate).toHaveBeenCalledWith('USD', 'UAH');
  });

  it('зберігає отриманий курс і момент запиту в кеші', async () => {
    await provider.getRate('USD', 'UAH');

    expect(cache.get('USD:UAH')).toEqual({ rate: 41.25, fetchedAt: 1_000 });
    expect(cache.size).toBe(1);
  });

  it('повторний виклик у межах інтервалу не спричиняє запиту', async () => {
    await provider.getRate('USD', 'UAH');
    clock.advance(30_000);

    await expect(provider.getRate('USD', 'UAH')).resolves.toBe(41.25);
    expect(source.getRate).toHaveBeenCalledTimes(1);
  });

  it.each([
    { elapsed: 59_999, requests: 1 },
    { elapsed: 60_000, requests: 2 },
    { elapsed: 60_001, requests: 2 },
  ])(
    'через $elapsed мс після запиту кількість звернень: $requests',
    async ({ elapsed, requests }) => {
      await provider.getRate('USD', 'UAH');
      clock.advance(elapsed);
      await provider.getRate('USD', 'UAH');

      expect(source.getRate).toHaveBeenCalledTimes(requests);
    },
  );

  it('після закінчення інтервалу оновлює курс у кеші', async () => {
    await provider.getRate('USD', 'UAH');
    vi.mocked(source.getRate).mockResolvedValue(41.5);
    clock.advance(60_000);

    await expect(provider.getRate('USD', 'UAH')).resolves.toBe(41.5);
    expect(cache.get('USD:UAH')).toEqual({ rate: 41.5, fetchedAt: 61_000 });
  });

  it('кешує різні валютні пари окремо', async () => {
    await provider.getRate('USD', 'UAH');
    await provider.getRate('EUR', 'UAH');

    expect(source.getRate).toHaveBeenCalledTimes(2);
    expect(cache.size).toBe(2);
  });

  it('не кешує результат, якщо джерело недоступне', async () => {
    vi.mocked(source.getRate).mockRejectedValueOnce(new Error('RATE_UNAVAILABLE'));

    await expect(provider.getRate('USD', 'UAH')).rejects.toThrow('RATE_UNAVAILABLE');
    expect(cache.size).toBe(0);

    await expect(provider.getRate('USD', 'UAH')).resolves.toBe(41.25);
    expect(source.getRate).toHaveBeenCalledTimes(2);
  });

  it('не подовжує застарілий курс, якщо оновлення не вдалося', async () => {
    await provider.getRate('USD', 'UAH');
    vi.mocked(source.getRate).mockRejectedValueOnce(new Error('INVALID_RATE_FORMAT'));
    clock.advance(60_000);

    await expect(provider.getRate('USD', 'UAH')).rejects.toThrow('INVALID_RATE_FORMAT');
    expect(cache.get('USD:UAH')).toEqual({ rate: 41.25, fetchedAt: 1_000 });
  });
});

describe('systemClock', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('повертає поточний системний час', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-15T10:00:00.000Z'));

    expect(systemClock.now()).toBe(Date.parse('2026-03-15T10:00:00.000Z'));
  });
});
