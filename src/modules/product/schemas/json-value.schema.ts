import * as v from 'valibot';

// null excluded: Prisma uses Prisma.JsonNull sentinel, not native null
export type JsonValue =
  | string
  | number
  | boolean
  | JsonValue[]
  | { [key: string]: JsonValue };

// v.lazy() required for recursive type — v.record(v.string(), v.unknown()) infers Record<string, unknown>, incompatible with Prisma InputJsonValue
export const JsonValueSchema: v.GenericSchema<JsonValue> = v.lazy(() =>
  v.union([
    v.string(),
    v.number(),
    v.boolean(),
    v.array(JsonValueSchema),
    v.record(v.string(), JsonValueSchema),
  ])
);
