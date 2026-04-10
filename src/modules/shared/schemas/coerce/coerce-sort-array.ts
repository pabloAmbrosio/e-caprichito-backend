import * as v from 'valibot';

// Acepta JSON string o array ya parseado
export const coerceSortArray = v.pipe(
  v.union([v.array(v.any()), v.string()]),
  v.transform((val): unknown[] => {
    if (Array.isArray(val)) return val;
    try { return JSON.parse(val); } catch { return []; }
  }),
);
