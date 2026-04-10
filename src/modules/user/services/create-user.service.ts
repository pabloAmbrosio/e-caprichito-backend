import { hashPassword } from "../../../lib/bcrypt";
import { CreateUserServiceInput } from "../types";
import {
  normalizeCreateInput,
  assertUniqueFields,
  persistUser,
  auditCreate,
} from "../helpers";

export async function createUserService(input: CreateUserServiceInput) {
  
  const { data, requestingAdminId } = input;

  const normalized = normalizeCreateInput(data);

  await assertUniqueFields(data.username, normalized.email, normalized.phone);

  const passwordHash = await hashPassword(data.password);

  const user = await persistUser(data, normalized, passwordHash);

  if (requestingAdminId) {
    auditCreate(requestingAdminId, user);
  }

  return { data: user, msg: "Usuario creado exitosamente" };
}
