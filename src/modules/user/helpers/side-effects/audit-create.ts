import { logUserAudit } from "../../utils/audit-logger";

interface CreatedUser {
  id: string;
  username: string;
  adminRole: string;
  customerRole: string | null;
}

export function auditCreate(
  requestingAdminId: string,
  createdUser: CreatedUser,
) {
  logUserAudit("CREATE_USER", requestingAdminId, createdUser.id, null, {
    username: createdUser.username,
    adminRole: createdUser.adminRole,
    customerRole: createdUser.customerRole,
  });
}
