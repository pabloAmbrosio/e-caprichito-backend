import { Prisma } from '../../../lib/prisma';

export const userDetailSelect = {
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
    googleId: true,
    createdAt: true,
    updatedAt: true,
    lastLoginAt: true,
    deletedAt: true,
    _count: {
        select: {
            orders: true,
            allCarts: true,
        }
    },
} satisfies Prisma.UserSelect;
