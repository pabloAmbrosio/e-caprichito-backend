import * as v from "valibot";

import { EnvSchema } from "./env.schema";

const result = v.safeParse(EnvSchema, process.env);

if (!result.success) {
  const issues = result.issues
    .map((i) => `  - ${i.path?.map((p) => p.key).join(".")}: ${i.message}`)
    .join("\n");

  throw new Error(`[ENV] Variables de entorno inválidas:\n${issues}`);
}

export const env = result.output;
