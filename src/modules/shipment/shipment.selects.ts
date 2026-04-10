import { Prisma } from "../../lib/prisma";

export const shipmentSelect = {
    id: true,
    status: true,
    type: true,
    deliveryFee: true,
    carrier: true,
    trackingCode: true,
    estimatedAt: true,
    deliveredAt: true,
    createdAt: true,
} satisfies Prisma.ShipmentSelect;

export const shipmentEventSelect = {
    id: true,
    status: true,
    note: true,
    staff: {
        select: {
            id: true,
            username: true,
        },
    },
    createdAt: true,
} satisfies Prisma.ShipmentEventSelect;

export const shipmentDetailSelect = {
    id: true,
    status: true,
    type: true,
    deliveryFee: true,
    carrier: true,
    trackingCode: true,
    estimatedAt: true,
    deliveredAt: true,
    createdAt: true,
    updatedAt: true,
    order: {
        select: {
            id: true,
            status: true,
            createdAt: true,
            customer: {
                select: {
                    id: true,
                    username: true,
                    email: true,
                },
            },
        },
    },
    address: {
        select: {
            id: true,
            label: true,
            formattedAddress: true,
            details: true,
            lat: true,
            lng: true,
        },
    },
    events: {
        select: shipmentEventSelect,
        orderBy: { createdAt: "asc" as const },
    },
} satisfies Prisma.ShipmentSelect;
