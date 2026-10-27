import { describe, it, expect } from 'vitest';
import { calcPenalty } from '../src/penalty';

describe('calcPenalty', () => {

  it.each([-0.01, -1000, NaN, Infinity])('відхиляє суму боргу %s', (debt) => {
    expect(() => calcPenalty(debt, 10)).toThrow('INVALID_DEBT');
  });
  
  it.each([-1, -10, 4.5])('відхиляє кількість днів %s', (days) => {
    expect(() => calcPenalty(1000, days)).toThrow('INVALID_DAYS');
  });
});