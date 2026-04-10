import * as v from 'valibot';

const currentPasswordSchema = v.pipe(
  v.string('La contrasena actual debe ser texto'),
  v.minLength(8, 'Contrasena minimo 8 caracteres')
);

const newPasswordSchema = v.pipe(
  v.string('La nueva contrasena debe ser texto'),
  v.minLength(8, 'Contrasena minimo 8 caracteres'),
  v.regex(/[A-Z]/, 'Debe tener al menos una mayuscula'),
  v.regex(/[a-z]/, 'Debe tener al menos una minuscula'),
  v.regex(/[0-9]/, 'Debe tener al menos un numero')
);

export const ChangePasswordSchema = v.strictObject({
  currentPassword: 
    process.env.NODE_ENV === 'production' 
        ? currentPasswordSchema 
        : v.string('La contrasena actual debe ser texto'),
    newPassword: process.env.NODE_ENV === 'production'
        ? newPasswordSchema
        : v.string('La nueva contrasena debe ser texto'),
});

export type ChangePasswordInput = v.InferInput<typeof ChangePasswordSchema>;