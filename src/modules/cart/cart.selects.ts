import { Prisma } from "../../lib/prisma"

export const productInCartSelect = {
    id:        true,
    title:     true,
    priceInCents: true,
    compareAtPriceInCents: true,
    images:    true,
    deletedAt: true,
    abstractProduct: { select: { id: true, title: true, slug: true, categoryId: true, tags: true } },
} as const satisfies Prisma.ProductSelect

export const cartItemSelect = {
    id:        true,
    quantity:  true,
    productId: true,
    product:   { select: productInCartSelect },
} as const satisfies Prisma.CartItemSelect

export const cartSelect = {
    id:         true,
    customerId: true,
    couponCode: true,
    items:      { select: cartItemSelect, orderBy: { createdAt: "asc" as const } },
} as const satisfies Prisma.CartSelect


export const abandonedCartSelect = {
    ...cartSelect,
    customer: { select: { id: true, username: true, email: true } },
    updatedAt: true,
    createdAt: true,
    _count:    { select: { items: true } },
} as const satisfies Prisma.CartSelect

export const cartBackofficeSelect = {
    ...cartSelect,
    activeFor: true,
    deletedAt: true,
    createdAt: true,
} as const satisfies Prisma.CartSelect

export const cartSummarySelect = {
    id: true,
    couponCode: true,
    items: {
        select: {
            quantity: true,
            product: { select: { priceInCents: true } },
        },
    },
} as const;
