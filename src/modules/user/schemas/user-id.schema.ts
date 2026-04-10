import * as v from 'valibot';

export const userIdSchema = v.object({
    id: v.pipe(
        v.string('El ID debe ser un string'),
        v.uuid('El ID debe ser un UUID válido')
    )
});

export type UserIdInput = v.InferOutput<typeof userIdSchema>;
