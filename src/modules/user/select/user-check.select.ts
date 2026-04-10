import { Prisma } from '../../../lib/prisma';

export const userCheckSelect = {
    id: true,
    username: true,
    deletedAt: true,
    adminRole: true,
    email: true,
    phone: true,
} satisfies Prisma.UserSelect;
