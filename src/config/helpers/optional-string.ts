import * as v from "valibot";

export const optionalString = (fallback: string) =>
  v.optional(v.string(), fallback);
