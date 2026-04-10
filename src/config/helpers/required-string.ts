import * as v from "valibot";

export const requiredString = (description?: string) =>
  v.pipe(v.string(description), v.nonEmpty("No puede estar vacío"));
