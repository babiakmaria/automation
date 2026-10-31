import { describe, it, expect, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server, RATE_URL } from './msw/server';
import { HttpRateProvider } from '../src/rate-provider';
import { CachingRateProvider } from '../src/caching-rate-provider';
import { FakeClock } from './fakes/fake-clock';
import { InMemoryRateCache } from './fakes/in-memory-rate-cache';

describe('CachingRateProvider + HTTP-API (MSW)', () => {
  let requests: number;
  let clock: FakeClock;
  let provider: CachingRateProvider;

  const respondWith = (makeResponse: () => Response) =>
    server.use(
      http.get(RATE_URL, () => {
        requests++;
        return makeResponse();
      }),
    );

  beforeEach(() => {
    requests = 0;
    clock = new FakeClock();
    provider = new CachingRateProvider(
      new HttpRateProvider('https://api.example.com'),
      new InMemoryRateCache(),
      clock,
    );
  });

  it('успішна відповідь кешується: другий виклик не надсилає запит', async () => {
    respondWith(() => HttpResponse.json({ rate: 41.25 }));

    await expect(provider.getRate('USD', 'UAH')).resolves.toBe(41.25);
    clock.advance(59_999);
    await expect(provider.getRate('USD', 'UAH')).resolves.toBe(41.25);

    expect(requests).toBe(1);
  });

  it('після 60 секунд надсилає новий запит', async () => {
    respondWith(() => HttpResponse.json({ rate: 41.25 }));

    await provider.getRate('USD', 'UAH');
    clock.advance(60_000);
    await provider.getRate('USD', 'UAH');

    expect(requests).toBe(2);
  });

  it('статус 503 не кешується: наступний виклик повторює запит', async () => {
    respondWith(() => new HttpResponse(null, { status: 503 }));

    await expect(provider.getRate('USD', 'UAH')).rejects.toThrow('RATE_UNAVAILABLE');
    await expect(provider.getRate('USD', 'UAH')).rejects.toThrow('RATE_UNAVAILABLE');

    expect(requests).toBe(2);
  });

  it('відхиляє відповідь некоректного формату', async () => {
    respondWith(() => HttpResponse.json({ rate: '41.25' }));

    await expect(provider.getRate('USD', 'UAH')).rejects.toThrow('INVALID_RATE_FORMAT');
  });
});
