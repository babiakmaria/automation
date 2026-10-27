import { describe, it, expect } from 'vitest';
import { calcPenalty } from '../src/penalty';

describe('calcPenalty', () => {

  it.each([-0.01, -1000, NaN, Infinity])('відхиляє суму боргу %s', (debt) => {
    expect(() => calcPenalty(debt, 10)).toThrow('INVALID_DEBT');
  });
});