import { describe, it, expect } from 'vitest';
import { calcPenalty } from '../src/penalty';

describe('calcPenalty', () => {

  it.each([-0.01, -1000, NaN, Infinity])('відхиляє суму боргу %s', (debt) => {
    expect(() => calcPenalty(debt, 10)).toThrow('INVALID_DEBT');
  });
  
  it.each([-1, -10, 4.5])('відхиляє кількість днів %s', (days) => {
    expect(() => calcPenalty(1000, days)).toThrow('INVALID_DAYS');
  });
  
  it.each([0, 1, 2, 3])('пільговий період: %i дн. без пені', (days) => {
    expect(calcPenalty(1000, days)).toBe(0);
  });

  it('не відхиляє нульовий борг', () => {
    expect(calcPenalty(0, 10)).toBe(0);
  });
  
  it.each([
    { days: 3, expected: 0 },
    { days: 4, expected: 1 },
    { days: 5, expected: 2 },
    { days: 30, expected: 27 },
  ])('прострочення $days дн. → пеня $expected грн', ({ days, expected }) => {
    expect(calcPenalty(1000, days)).toBeCloseTo(expected, 2);
  });
  
  it.each([
    { days: 502, expected: 499 },
    { days: 503, expected: 500 },
    { days: 504, expected: 500 },
    { days: 1000, expected: 500 },
  ])('обмеження 50 % боргу: $days дн. → $expected грн', ({ days, expected }) => {
    expect(calcPenalty(1000, days)).toBeCloseTo(expected, 2);
  });

  it.each([
    { debt: 1234.56, days: 4, expected: 1.23 },
    { debt: 1234.56, days: 5, expected: 2.47 },
  ])('заокруглює пеню до копійок: $debt грн, $days дн. → $expected', ({ debt, days, expected }) => {
    expect(calcPenalty(debt, days)).toBe(expected);
  });
});