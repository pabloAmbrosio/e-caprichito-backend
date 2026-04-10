import * as v from 'valibot';
import { AdminRole, CustomerRole } from '../../../lib/roles';

export const updateUserSchema = v.object({
    email: v.optional(
        v.nullable(
            v.pipe(
                v.string('Email debe ser un string'),
                v.email('Email inválido')
            )
        )
    ),

    phone: v.optional(
        v.nullable(
            v.pipe(
                v.string('Teléfono debe ser un string'),
                v.regex(/^\+[1-9]\d{6,14}$/, 'Teléfono debe estar en formato E.164 (ej: +521234567890)')
            )
        )
    ),

    firstName: v.optional(
        v.nullable(
            v.pipe(
                v.string('Nombre debe ser un string'),
                v.minLength(1, 'Nombre no puede estar vacío'),
                v.maxLength(100, 'Nombre no puede exceder 100 caracteres'),
                v.regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/, 'Nombre contiene caracteres no permitidos')
            )
        )
    ),

    lastName: v.optional(
        v.nullable(
            v.pipe(
                v.string('Apellido debe ser un string'),
                v.minLength(1, 'Apellido no puede estar vacío'),
                v.maxLength(100, 'Apellido no puede exceder 100 caracteres'),
                v.regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/, 'Apellido contiene caracteres no permitidos')
            )
        )
    ),

    adminRole: v.optional(
        v.enum(AdminRole, 'Rol administrativo inválido')
    ),

    customerRole: v.optional(
        v.nullable(
            v.enum(CustomerRole, 'Rol de cliente inválido')
        )
    ),
});

export type UpdateUserInput = v.InferOutput<typeof updateUserSchema>;
