import { db } from "../../../../lib/prisma";
import {
  UserNotFoundError,
  UserAlreadyDeletedError,
  CannotModifyOwnerError,
} from "../../errors";
import { userCheckSelect } from "../../select";

export async function getUserOrFail(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: userCheckSelect,
  });

  if (!user) throw new UserNotFoundError(userId);
  if (user.deletedAt) throw new UserAlreadyDeletedError(userId);
  if (user.adminRole === "OWNER") throw new CannotModifyOwnerError();

  return user;
}
