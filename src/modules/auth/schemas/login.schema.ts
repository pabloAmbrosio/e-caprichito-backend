import * as v from 'valibot';

export const LoginSchema = v.strictObject({
  identifier: v.pipe(
    v.string('El identificador debe ser texto'),
    v.minLength(3, 'Ingresa username, email o teléfono')
  ),
  password: v.pipe(
    v.string('La contraseña debe ser texto'),
    v.minLength(8, 'Contraseña mínimo 8 caracteres')
  )
});

export type LoginInput = v.InferInput<typeof LoginSchema>;
