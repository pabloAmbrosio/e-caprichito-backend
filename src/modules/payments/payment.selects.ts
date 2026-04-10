import { Prisma } from '../../lib/prisma';

export const paymentSelect = {
  id: true,
  orderId: true,
  customerId: true,
  method: true,
  status: true,
  amount: true,
  currency: true,
  providerData: true,
  reviewedBy: true,
  reviewedAt: true,
  reviewNote: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.PaymentSelect;

export const paymentWithReviewerSelect = {
  ...paymentSelect,
  reviewer: {
    select: {
      id: true,
      username: true,
      adminRole: true,
    },
  },
  customer: {
    select: {
      id: true,
      username: true,
      phone: true,
      email: true,
    },
  },
  order: {
    select: {
      id: true,
      status: true,
      items: {
        select: {
          id: true,
          quantity: true,
          product: {
            select: {
              id: true,
              title: true,
              priceInCents: true,
            },
          },
        },
      },
    },
  },
} as const satisfies Prisma.PaymentSelect;
