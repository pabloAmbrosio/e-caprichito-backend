import * as v from 'valibot';

export const CheckIdentifierSchema = v.strictObject({
  identifier: v.pipe(
    v.string('El identificador debe ser texto'),
    v.minLength(3, 'Ingresa username, email o teléfono')
  ),
});

export type CheckIdentifierInput = v.InferInput<typeof CheckIdentifierSchema>;
