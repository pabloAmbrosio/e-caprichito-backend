import { Prisma } from '../../../lib/prisma';

export const userResponseSelect = {
    id: true,
    username: true,
    email: true,
    phone: true,
    firstName: true,
    lastName: true,
    adminRole: true,
    customerRole: true,
    deletedAt: true,
    createdAt: true,
    updatedAt: true,
} satisfies Prisma.UserSelect;
