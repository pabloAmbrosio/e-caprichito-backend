import * as v from 'valibot';

export const coerceBoolean = v.pipe(
  v.union([v.boolean(), v.string()]),
  v.transform((val): boolean => {
    if (typeof val === 'boolean') return val;
    return val === 'true';
  }),
);
