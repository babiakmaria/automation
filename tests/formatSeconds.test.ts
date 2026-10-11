import { describe, it, expect } from 'vitest';
import { formatSeconds } from '../src/seconds';

describe('formatSeconds', () => {
  it('перетворює 45878 секунд на 12:44:38', () => {
    const total = 45878;
    const result = formatSeconds(total);

    expect(result).toBe('12:44:38');
  });

  it('перетворює 294 секунд на 00:04:54', () => {
    expect(formatSeconds(294)).toBe('00:04:54');
  });

  it('перетворює 23522 на 06:32:02', () => {
    expect(formatSeconds(23522)).toBe('06:32:02');
  });

  it('переходить на нову хвилину при 60 секундах', () => {
    expect(formatSeconds(60)).toBe('00:01:00');
  });

  it('перетворює 0 секунд на 00:00:00', () => {
    expect(formatSeconds(0)).toBe('00:00:00');
  });

  it('відхиляє відʼємні значення', () => {
    expect(() => formatSeconds(-48923)).toThrow('INVALID_SECONDS');
  });
});
