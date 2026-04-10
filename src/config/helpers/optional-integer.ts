import * as v from "valibot";

export const optionalInteger = (fallback: number) =>
  v.optional(
    v.pipe(v.string(), v.transform(Number), v.integer()),
    String(fallback)
  );
