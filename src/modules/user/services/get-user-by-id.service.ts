import { db } from "../../../lib/prisma";
import { UserNotFoundError } from "../errors";
import { userDetailSelect } from "../select";

export async function getUserByIdService(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: userDetailSelect,
  });

  if (!user) throw new UserNotFoundError(userId);

  return { data: user, msg: "Usuario encontrado" };
}
