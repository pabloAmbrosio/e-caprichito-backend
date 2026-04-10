import { Prisma } from '../../lib/prisma';

export const promotionWithRulesAndActionsInclude = {
    rules: true,
    actions: true,
} as const satisfies Prisma.PromotionInclude;

export const promotionWithDetailsInclude = {
    rules: true,
    actions: true,
    _count: { select: { usages: true } },
} as const satisfies Prisma.PromotionInclude;

export const cartWithItemsForEngineInclude = {
    items: {
        include: {
            product: {
                include: {
                    abstractProduct: {
                        select: { categoryId: true, tags: true },
                    },
                },
            },
        },
    },
} as const satisfies Prisma.CartInclude;
