import * as v from 'valibot';

export const ForgotPasswordSchema = v.strictObject({
  identifier: v.pipe(
    v.string('El identificador debe ser texto'),
    v.minLength(3, 'Ingresa tu username, email o teléfono')
  )
});

export type ForgotPasswordInput = v.InferInput<typeof ForgotPasswordSchema>;
