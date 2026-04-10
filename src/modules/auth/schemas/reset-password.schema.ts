import * as v from 'valibot';

export const ResetPasswordSchema = v.strictObject({
  userId: v.pipe(v.string(), v.uuid('userId debe ser UUID válido')),
  code: v.pipe(
    v.string('El código debe ser texto'),
    v.length(6, 'El código debe tener 6 dígitos'),
    v.regex(/^\d{6}$/, 'El código solo debe contener números')
  ),
  newPassword:
    process.env.NODE_ENV === 'production'
      ? v.pipe(
          v.string('La contraseña debe ser texto'),
          v.minLength(8, 'Contraseña mínimo 8 caracteres'),
          v.regex(/[A-Z]/, 'Debe tener al menos una mayúscula'),
          v.regex(/[a-z]/, 'Debe tener al menos una minúscula'),
          v.regex(/[0-9]/, 'Debe tener al menos un número')
        )
      : v.string('La contraseña debe ser texto')
});

export type ResetPasswordInput = v.InferInput<typeof ResetPasswordSchema>;
