import { Prisma } from "../../lib/prisma";

// ── Shop: listado de órdenes del comprador ──────────────────

export const orderSelect = {
  id: true,
  status: true,
  discountTotalInCents: true,
  createdAt: true,
  items: {
    select: {
      id: true,
      quantity: true,
      product: {
        select: {
          id: true,
          title: true,
          priceInCents: true,
          images: true,
        },
      },
    },
  },
  shipment: {
    select: {
      status: true,
      type: true,
      deliveryFee: true,
      estimatedAt: true,
      deliveredAt: true,
    },
  },
  payments: {
    select: {
      status: true,
      amount: true,
      method: true,
    },
  },
} satisfies Prisma.OrderSelect;

// ── Backoffice: listado de órdenes ──────────────────────────

export const orderBackofficeSelect = {
  id: true,
  status: true,
  discountTotalInCents: true,
  expiresAt: true,
  createdAt: true,
  customer: {
    select: {
      id: true,
      username: true,
      email: true,
      customerRole: true,
    },
  },
  items: {
    select: {
      id: true,
      quantity: true,
      product: {
        select: {
          id: true,
          title: true,
          sku: true,
          priceInCents: true,
          images: true,
        },
      },
    },
  },
  payments: {
    select: {
      id: true,
      status: true,
      amount: true,
      method: true,
      createdAt: true,
    },
  },
  shipment: {
    select: {
      id: true,
      status: true,
      type: true,
      carrier: true,
      trackingCode: true,
      deliveryFee: true,
      estimatedAt: true,
      deliveredAt: true,
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
    },
  },
  _count: { select: { items: true } },
} satisfies Prisma.OrderSelect;

// ── Backoffice: detalle completo de una orden ───────────────

export const orderDetailSelect = {
  id: true,
  status: true,
  discountTotalInCents: true,
  expiresAt: true,
  createdAt: true,
  updatedAt: true,
  customer: {
    select: {
      id: true,
      username: true,
      email: true,
      phone: true,
      customerRole: true,
    },
  },
  items: {
    select: {
      id: true,
      quantity: true,
      product: {
        select: {
          id: true,
          title: true,
          sku: true,
          priceInCents: true,
          compareAtPriceInCents: true,
          images: true,
          abstractProduct: {
            select: {
              id: true,
              title: true,
              category: { select: { id: true, name: true } },
              tags: true,
            },
          },
        },
      },
    },
  },
  payments: {
    select: {
      id: true,
      status: true,
      amount: true,
      method: true,
      currency: true,
      reviewedAt: true,
      reviewNote: true,
      reviewer: { select: { id: true, username: true } },
      createdAt: true,
    },
    orderBy: { createdAt: "desc" as const },
  },
  shipment: {
    select: {
      id: true,
      status: true,
      type: true,
      carrier: true,
      trackingCode: true,
      deliveryFee: true,
      estimatedAt: true,
      deliveredAt: true,
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
        select: {
          id: true,
          status: true,
          note: true,
          createdAt: true,
        },
        orderBy: { createdAt: "asc" as const },
      },
    },
  },
  promotionUsages: {
    select: {
      id: true,
      discountAmountInCents: true,
      usedAt: true,
      promotion: {
        select: { id: true, name: true, couponCode: true },
      },
    },
  },
  statusAuditLogs: {
    select: {
      id: true,
      previousStatus: true,
      newStatus: true,
      automatic: true,
      changedAt: true,
      changedByUser: { select: { id: true, username: true } },
    },
    orderBy: { changedAt: "desc" as const },
  },
} satisfies Prisma.OrderSelect;

// ── Shop: detalle completo de una orden para el comprador ───

export const orderShopDetailSelect = {
  id: true,
  status: true,
  discountTotalInCents: true,
  addressSnapshot: true,
  expiresAt: true,
  createdAt: true,
  customerId: true,
  items: {
    select: {
      id: true,
      quantity: true,
      product: {
        select: {
          id: true,
          title: true,
          priceInCents: true,
          images: true,
        },
      },
    },
  },
  shipment: {
    select: {
      id: true,
      status: true,
      type: true,
      deliveryFee: true,
      estimatedAt: true,
      deliveredAt: true,
      address: {
        select: {
          label: true,
          formattedAddress: true,
        },
      },
      events: {
        select: {
          id: true,
          status: true,
          note: true,
          createdAt: true,
        },
        orderBy: { createdAt: "asc" as const },
      },
    },
  },
  payments: {
    select: {
      id: true,
      status: true,
      amount: true,
      method: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" as const },
  },
} satisfies Prisma.OrderSelect;

// ── Shop: info de pago de una orden ─────────────────────────

export const orderPaymentInfoSelect = {
  id: true,
  status: true,
  customerId: true,
  discountTotalInCents: true,
  items: {
    select: {
      quantity: true,
      product: {
        select: { priceInCents: true },
      },
    },
  },
  shipment: {
    select: { deliveryFee: true, type: true },
  },
  payments: {
    select: {
      id: true,
      status: true,
      amount: true,
      method: true,
    },
    orderBy: { createdAt: "desc" as const },
    take: 1,
  },
} satisfies Prisma.OrderSelect;

// ── Backoffice: cancel con shipment y payment ───────────────

export const orderCancelBackofficeTxSelect = {
  id: true,
  customerId: true,
  status: true,
  items: { select: { productId: true, quantity: true } },
  shipment: { select: { id: true, status: true } },
  payments: { select: { id: true, status: true } },
} satisfies Prisma.OrderSelect;

// ── Transacciones: selects ligeros para helpers ─────────────

export const orderTxSelect = {
  id: true,
  status: true,
  items: { select: { productId: true, quantity: true } },
} satisfies Prisma.OrderSelect;

export const orderOwnershipTxSelect = {
  id: true,
  customerId: true,
  status: true,
  items: { select: { productId: true, quantity: true } },
} satisfies Prisma.OrderSelect;

export const orderCreateResultSelect = {
  id: true,
  status: true,
  expiresAt: true,
} satisfies Prisma.OrderSelect;

export const activeCartTxSelect = {
  id: true,
  couponCode: true,
  items: { select: { productId: true, quantity: true } },
} satisfies Prisma.CartSelect;
