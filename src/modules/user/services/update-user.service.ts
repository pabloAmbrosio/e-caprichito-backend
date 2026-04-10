import { UpdateUserServiceInput } from "../types";
import {
  getActiveUserOrFail,
  assertRolePermissions,
  normalizeContactFields,
  assertUniqueContact,
  buildUpdateData,
  persistUpdate,
  auditUpdate,
} from "../helpers";

export async function updateUserService(input: UpdateUserServiceInput) {
  const { userId, data, requestingUserId, requestingUserRole } = input;

  const existingUser = await getActiveUserOrFail(userId);

  assertRolePermissions(existingUser, data, requestingUserId, requestingUserRole);

  const normalized = normalizeContactFields(data);

  await assertUniqueContact(userId, normalized, existingUser);

  const updateData = buildUpdateData(data, normalized, existingUser);

  const updatedUser = await persistUpdate(userId, updateData);

  if (requestingUserId) 
    auditUpdate(requestingUserId, userId, existingUser, data, normalized);
  

  return { data: updatedUser, msg: "Usuario actualizado exitosamente" };
}
