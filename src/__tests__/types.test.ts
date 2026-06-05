import { describe, it, expect } from 'vitest';
import type { UUID, Money, Decimal, JsonData, DateString } from '../types/common';

describe('Common type aliases', () => {
  it('UUID accepts string values', () => {
    const id: UUID = '550e8400-e29b-41d4-a716-446655440000';
    expect(typeof id).toBe('string');
  });

  it('Money accepts numeric strings', () => {
    const amount: Money = '1500.50';
    expect(typeof amount).toBe('string');
  });

  it('Decimal accepts precision strings', () => {
    const rate: Decimal = '0.0050';
    expect(typeof rate).toBe('string');
  });

  it('JsonData accepts record objects', () => {
    const data: JsonData = { key: 'value', count: 42 };
    expect(data.key).toBe('value');
    expect(data.count).toBe(42);
  });

  it('DateString accepts ISO date strings', () => {
    const date: DateString = '2026-01-01';
    expect(typeof date).toBe('string');
  });
});
