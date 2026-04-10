import { db } from "../../../../lib/prisma";
import { UserNotFoundError, UserAlreadyDeletedError } from "../../errors";
import { userUpdateCheckSelect } from "../../select";

export async function getActiveUserOrFail(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: userUpdateCheckSelect,
  });

  if (!user) throw new UserNotFoundError(userId);
  if (user.deletedAt) throw new UserAlreadyDeletedError(userId);

  return user;
}
