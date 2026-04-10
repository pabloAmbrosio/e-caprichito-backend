import * as v from 'valibot';

export const RegisterSchema = v.strictObject({
  username: v.pipe(
    v.string('El username debe ser texto'),
    v.minLength(3, 'Username mínimo 3 caracteres'),
    v.maxLength(30, 'Username máximo 30 caracteres'),
    v.regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y guión bajo')
  ),
  phone: v.pipe(
    v.string('El teléfono debe ser texto'),
    v.regex(/^\+[1-9]\d{1,14}$/, 'Formato E.164: +1234567890')
  ),
  password:
    process.env.NODE_ENV === 'production'
      ? v.pipe(
          v.string('La contraseña debe ser texto'),
          v.minLength(8, 'Contraseña mínimo 8 caracteres'),
          v.regex(/[A-Z]/, 'Debe tener al menos una mayúscula'),
          v.regex(/[a-z]/, 'Debe tener al menos una minúscula'),
          v.regex(/[0-9]/, 'Debe tener al menos un número')
        )
      : v.string('La contraseña debe ser texto'),
  email: v.optional(v.pipe(v.string(), v.email('Email no válido'))),
  firstName: v.optional(v.string()),
  lastName: v.optional(v.string())
});

export type RegisterInput = v.InferInput<typeof RegisterSchema>;
