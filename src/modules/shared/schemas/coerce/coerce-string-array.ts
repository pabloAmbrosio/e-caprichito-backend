import * as v from 'valibot';

// Acepta: "a,b,c" | ["a","b"] | "a"
export const coerceStringArray = v.pipe(
  v.union([v.array(v.string()), v.string()]),
  v.transform((val): string[] => {
    if (Array.isArray(val)) return val;
    return val.split(',').filter(s => s.length > 0);
  }),
);
