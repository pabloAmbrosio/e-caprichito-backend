import { FastifySchema, FastifySchemaCompiler } from 'fastify';
import * as v from 'valibot';

// Pasa data cruda a v.safeParse() — Fastify no pre-parsea querystrings
export const customValibotCompiler: FastifySchemaCompiler<FastifySchema> = ({ schema }) => {
    return (data: unknown) => {
        const valibotSchema = schema as v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>;
        const output = v.safeParse(valibotSchema, data);

        if (!output.success) {
            return { error: output.issues as unknown as Error };
        }

        return { value: output.output };
    }
}
