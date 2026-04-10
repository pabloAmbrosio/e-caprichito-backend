import { UpdateUserInput } from "../../schemas";
import { ExistingUser } from "../../types";
import {
  CannotModifyOwnerError,
  CannotModifyOwnRoleError,
  OnlyOwnerCanAssignAdminError,
} from "../../errors";

export function assertRolePermissions(
  existingUser: ExistingUser,
  data: UpdateUserInput,
  requestingUserId?: string,
  requestingUserRole?: string,
) {
  if (existingUser.adminRole === "OWNER" && requestingUserRole !== "OWNER") {
    throw new CannotModifyOwnerError();
  }

  if (data.adminRole !== undefined && requestingUserId === existingUser.id) {
    throw new CannotModifyOwnRoleError();
  }

  if (data.adminRole === "ADMIN" && requestingUserRole !== "OWNER") {
    throw new OnlyOwnerCanAssignAdminError();
  }

  if (
    data.adminRole !== undefined &&
    existingUser.adminRole === "OWNER" &&
    data.adminRole !== "OWNER"
  ) {
    throw new CannotModifyOwnerError();
  }
}
