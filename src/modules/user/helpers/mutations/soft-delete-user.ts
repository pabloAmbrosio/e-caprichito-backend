import { TransactionClient } from "../../../../lib/prisma";
import { userResponseSelect } from "../../select";

export async function softDeleteUser(tx: TransactionClient, userId: string) {
  return tx.user.update({
    where: { id: userId },
    data: {
      deletedAt: new Date(),
      activeCartId: null,
    },
    select: userResponseSelect,
  });
}
