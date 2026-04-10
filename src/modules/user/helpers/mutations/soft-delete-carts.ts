import { TransactionClient } from "../../../../lib/prisma";

export async function softDeleteCarts(tx: TransactionClient, userId: string) {
  await tx.cart.updateMany({
    where: { customerId: userId, deletedAt: null },
    data: { deletedAt: new Date() },
  });
}
