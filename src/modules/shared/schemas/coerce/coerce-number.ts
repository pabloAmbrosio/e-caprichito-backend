import * as v from 'valibot';

export const coerceNumber = v.pipe(
  v.union([v.number(), v.string()]),
  v.transform((val): number => (typeof val === 'number' ? val : Number(val))),
);
