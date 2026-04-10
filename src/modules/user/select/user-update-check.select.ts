import { Prisma } from '../../../lib/prisma';

export const userUpdateCheckSelect = {
    id: true,
    username: true,
    email: true,
    phone: true,
    firstName: true,
    lastName: true,
    adminRole: true,
    customerRole: true,
    deletedAt: true,
} satisfies Prisma.UserSelect;
