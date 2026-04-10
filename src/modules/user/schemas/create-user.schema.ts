import * as v from 'valibot';
import { AdminRole, CustomerRole } from '../../../lib/roles';

export const createUserSchema = v.object({
    username: v.pipe(
        v.string('Username es requerido'),
        v.minLength(3, 'Username debe tener al menos 3 caracteres'),
        v.maxLength(50, 'Username no puede exceder 50 caracteres'),
        v.regex(/^[a-zA-Z0-9_]+$/, 'Username solo puede contener letras, números y guión bajo')
    ),

    password: v.pipe(
        v.string('Password es requerido'),
        v.minLength(8, 'Password debe tener al menos 8 caracteres')
    ),

    email: v.optional(
        v.pipe(
            v.string('Email debe ser un string'),
            v.email('Email inválido')
        )
    ),

    phone: v.optional(
        v.pipe(
            v.string('Teléfono debe ser un string'),
            v.regex(/^\+[1-9]\d{6,14}$/, 'Teléfono debe estar en formato E.164 (ej: +521234567890)')
        )
    ),

    firstName: v.optional(
        v.pipe(
            v.string('Nombre debe ser un string'),
            v.minLength(1, 'Nombre no puede estar vacío'),
            v.maxLength(100, 'Nombre no puede exceder 100 caracteres'),
            v.regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/, 'Nombre contiene caracteres no permitidos')
        )
    ),

    lastName: v.optional(
        v.pipe(
            v.string('Apellido debe ser un string'),
            v.minLength(1, 'Apellido no puede estar vacío'),
            v.maxLength(100, 'Apellido no puede exceder 100 caracteres'),
            v.regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/, 'Apellido contiene caracteres no permitidos')
        )
    ),

    adminRole: v.enum(AdminRole, 'Rol administrativo inválido'),

    customerRole: v.optional(
        v.enum(CustomerRole, 'Rol de cliente inválido')
    ),
});

export type CreateUserInput = v.InferOutput<typeof createUserSchema>;
