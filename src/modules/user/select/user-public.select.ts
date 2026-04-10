import { Prisma } from '../../../lib/prisma';

export const userPublicSelect = {
    id: true,
    username: true,
    email: true,
    phone: true,
    firstName: true,
    lastName: true,
    adminRole: true,
    customerRole: true,
    phoneVerified: true,
    emailVerified: true,
    createdAt: true,
    updatedAt: true,
} satisfies Prisma.UserSelect;
