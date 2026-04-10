import { db } from "../../../lib/prisma";
import { userPublicSelect } from "../select";
import { RestoreUserInput } from "../types";
import { getDeletedUserOrFail, assertNoConflicts, auditRestore } from "../helpers";

export async function restoreUserService(input: RestoreUserInput) {
  const { userId, requestingUserId } = input;

  const user = await getDeletedUserOrFail(userId);

  await assertNoConflicts(userId, user.username, user.email, user.phone);

  const restoredUser = await db.user.update({
    where: { id: userId },
    data: { deletedAt: null },
    select: userPublicSelect,
  });

  auditRestore(requestingUserId, userId, user);

  return { data: restoredUser, msg: "Usuario restaurado exitosamente" };
}
