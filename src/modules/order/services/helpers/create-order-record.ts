import type { Prisma } from "../../../../lib/prisma";
import type { TxClient } from "../types/tx-client.types";
import type { OrderItemQuantity } from "../types/order-item.types";
import { orderCreateResultSelect } from "../../order.selects";

export async function createOrderRecord(
  tx: TxClient,
  userId: string,
  items: OrderItemQuantity[],
  discountTotalInCents?: number,
  expiresAt?: Date | null,
  addressSnapshot?: Prisma.InputJsonValue | null,
) {
  return tx.order.create({
    data: {
      customerId: userId,
      discountTotalInCents: discountTotalInCents ?? 0,
      expiresAt: expiresAt ?? null,
      addressSnapshot: addressSnapshot ?? undefined,
      items: {
        createMany: {
          data: items.map(({ productId, quantity }) => ({
            productId,
            quantity,
          })),
        },
      },
    },
    select: orderCreateResultSelect,
  });
}
