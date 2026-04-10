import { db } from "../../../../lib/prisma";
import { UserNotFoundError } from "../../errors";
import { userCheckSelect } from "../../select";

export async function getDeletedUserOrFail(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId, deletedAt: { not: null } },
    select: userCheckSelect,
  });

  if (!user) throw new UserNotFoundError(userId);

  return user;
}
