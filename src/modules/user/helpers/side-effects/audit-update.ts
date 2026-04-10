import { UpdateUserInput } from "../../schemas";
import { ExistingUser, UpdateNormalizedFields } from "../../types";
import { logUserAudit } from "../../utils/audit-logger";

export function auditUpdate(
  requestingUserId: string,
  userId: string,
  existingUser: ExistingUser,
  data: UpdateUserInput,
  normalized: UpdateNormalizedFields,
) {
  const changes: Record<string, unknown> = {};

  if (normalized.email !== undefined) changes.email = normalized.email;
  if (normalized.phone !== undefined) changes.phone = normalized.phone;
  if (data.firstName !== undefined) changes.firstName = data.firstName;
  if (data.lastName !== undefined) changes.lastName = data.lastName;
  if (data.adminRole !== undefined) changes.adminRole = data.adminRole;
  if (data.customerRole !== undefined) changes.customerRole = data.customerRole;

  logUserAudit("UPDATE_USER", requestingUserId, userId, {
    email: existingUser.email,
    phone: existingUser.phone,
    adminRole: existingUser.adminRole,
    customerRole: existingUser.customerRole,
    firstName: existingUser.firstName,
    lastName: existingUser.lastName,
  }, changes);
}
