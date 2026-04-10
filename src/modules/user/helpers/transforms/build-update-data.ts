import { UpdateUserInput } from "../../schemas";
import { ExistingUser, UpdateNormalizedFields } from "../../types";
import { resolveCustomerRole } from "../../utils/resolve-customer-role";

export function buildUpdateData(
  data: UpdateUserInput,
  normalized: UpdateNormalizedFields,
  existingUser: ExistingUser,
) {
  const finalAdminRole = data.adminRole ?? existingUser.adminRole;
  const finalCustomerRole = resolveCustomerRole(
    finalAdminRole,
    data.customerRole !== undefined ? data.customerRole : existingUser.customerRole,
  );

  return {
    ...(normalized.email !== undefined && { email: normalized.email }),
    ...(normalized.phone !== undefined && { phone: normalized.phone }),
    ...(data.firstName !== undefined && { firstName: data.firstName }),
    ...(data.lastName !== undefined && { lastName: data.lastName }),
    ...(data.adminRole !== undefined && { adminRole: data.adminRole }),
    customerRole: finalCustomerRole,
  };
}
