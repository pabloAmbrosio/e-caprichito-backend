import { Prisma } from "../../lib/prisma";

export const userSelect = {
    id:            true,
    username:      true,
    email:         true,
    phone:         true,
    adminRole:     true,  
    customerRole:  true,
    phoneVerified: true,
} as const satisfies Prisma.UserSelect