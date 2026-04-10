import * as v from 'valibot';
import { AdminRole, CustomerRole } from '../../../lib/roles';

export const listUsersSchema = v.object({
    page: v.optional(
        v.pipe(
            v.string('Page debe ser un string'),
            v.transform(Number),
            v.number('Page debe ser un número'),
            v.integer('Page debe ser un entero'),
            v.minValue(1, 'Page debe ser mayor o igual a 1')
        ),
        '1'
    ),

    limit: v.optional(
        v.pipe(
            v.string('Limit debe ser un string'),
            v.transform(Number),
            v.number('Limit debe ser un número'),
            v.integer('Limit debe ser un entero'),
            v.minValue(1, 'Limit debe ser mayor o igual a 1'),
            v.maxValue(100, 'Limit no puede ser mayor a 100')
        ),
        '20'
    ),

    adminRole: v.optional(
        v.enum(AdminRole, 'Rol administrativo inválido')
    ),

    customerRole: v.optional(
        v.enum(CustomerRole, 'Rol de cliente inválido')
    ),

    search: v.optional(
        v.pipe(
            v.string('Search debe ser un string'),
            v.transform((val) => val.trim()),
            v.minLength(1, 'Search debe tener al menos 1 caracter'),
            v.maxLength(100, 'Search no puede exceder 100 caracteres')
        )
    ),

    sortBy: v.optional(
        v.picklist(['createdAt', 'username', 'email'], 'Campo de ordenamiento inválido'),
        'createdAt'
    ),

    sortOrder: v.optional(
        v.picklist(['asc', 'desc'], 'Orden inválido'),
        'desc'
    ),

    includeDeleted: v.optional(
        v.pipe(
            v.string('includeDeleted debe ser un string'),
            v.transform((val) => val === 'true'),
            v.boolean('includeDeleted debe ser true o false')
        ),
        'false'
    ),
});

export type ListUsersInput = v.InferOutput<typeof listUsersSchema>;
