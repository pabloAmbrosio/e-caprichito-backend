import { db } from "../../../lib/prisma";
import { DeleteUserInput } from "../types";
import {
  assertNotSelf,
  getUserOrFail,
  revokeExternalSessions,
  softDeleteUser,
  softDeleteCarts,
  auditDelete,
} from "../helpers";

export async function deleteUserService(input: DeleteUserInput) {

  const { userId, requestingUserId } = input;


  //Verificaciones para no autoelimarce ni eliminar al admin
  assertNotSelf(userId, requestingUserId);
  const user = await getUserOrFail(userId);

  // Revoke before DB tx — if tx fails, user just re-authenticates
  await revokeExternalSessions(userId, user.email ?? null, user.phone ?? null);

  const deletedUser = await db.$transaction(async (tx) => {
    const updated = await softDeleteUser(tx, userId);
    await softDeleteCarts(tx, userId);
    return updated;
  });

  auditDelete(requestingUserId, userId, user);

  return { data: deletedUser, msg: "Usuario eliminado exitosamente" };
}
