import { describe, it, expect } from 'vitest';
import * as v from 'valibot';
import { coerceBoolean, coerceInteger, coerceNumber, coerceStringArray, coerceSortArray } from '../schemas/coerce';

// Helper: parsear un schema con coerción
function parse<T>(schema: any, input: unknown): T {
  const result = v.safeParse(v.pipe(schema, v.any()), input);
  if (!result.success) throw new Error('Parse failed');
  return result.output as T;
}

// ─── coerceBoolean ─────────────────────────────────────────────

describe('coerceBoolean', () => {
  it('"true" → true', () => {
    expect(parse(coerceBoolean, 'true')).toBe(true);
  });

  it('"false" → false', () => {
    expect(parse(coerceBoolean, 'false')).toBe(false);
  });

  it('string "true" (ya probado arriba) es el único string truthy', () => {
    // coerceBoolean solo acepta "true"/"false" literales en minúsculas
    expect(parse(coerceBoolean, 'true')).toBe(true);
  });

  it('cualquier otro string es false', () => {
    expect(parse(coerceBoolean, 'false')).toBe(false);
  });

  it('boolean true pasa directo', () => {
    expect(parse(coerceBoolean, true)).toBe(true);
  });

  it('boolean false pasa directo', () => {
    expect(parse(coerceBoolean, false)).toBe(false);
  });
});

// ─── coerceInteger ─────────────────────────────────────────────

describe('coerceInteger', () => {
  it('"42" → 42', () => {
    expect(parse(coerceInteger, '42')).toBe(42);
  });

  it('"0" → 0', () => {
    expect(parse(coerceInteger, '0')).toBe(0);
  });

  it('number 99 pasa directo', () => {
    expect(parse(coerceInteger, 99)).toBe(99);
  });

  it('"abc" → NaN', () => {
    expect(parse(coerceInteger, 'abc')).toBeNaN();
  });
});

// ─── coerceNumber ──────────────────────────────────────────────

describe('coerceNumber', () => {
  it('"3.14" → 3.14', () => {
    expect(parse(coerceNumber, '3.14')).toBeCloseTo(3.14);
  });

  it('"100" → 100', () => {
    expect(parse(coerceNumber, '100')).toBe(100);
  });

  it('number pasa directo', () => {
    expect(parse(coerceNumber, 2.5)).toBe(2.5);
  });
});

// ─── coerceStringArray ─────────────────────────────────────────

describe('coerceStringArray', () => {
  it('"a,b,c" → ["a","b","c"]', () => {
    expect(parse(coerceStringArray, 'a,b,c')).toEqual(['a', 'b', 'c']);
  });

  it('string sin coma → array de un elemento', () => {
    expect(parse(coerceStringArray, 'solo')).toEqual(['solo']);
  });

  it('array pasa directo', () => {
    expect(parse(coerceStringArray, ['x', 'y'])).toEqual(['x', 'y']);
  });
});

// ─── coerceSortArray ───────────────────────────────────────────

describe('coerceSortArray', () => {
  it('JSON string → array parseado', () => {
    const input = '[{"field":"createdAt","direction":"desc"}]';
    const result = parse(coerceSortArray, input);
    expect(Array.isArray(result)).toBe(true);
    expect(result[0].field).toBe('createdAt');
  });

  it('array pasa directo', () => {
    const input = [{ field: 'title', direction: 'asc' }];
    const result = parse(coerceSortArray, input);
    expect(result).toEqual(input);
  });
});
