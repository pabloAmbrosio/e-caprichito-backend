import { logUserAudit } from "../../utils/audit-logger";

interface DeletedUser {
  username: string;
  adminRole: string;
}

export function auditDelete(
  requestingUserId: string,
  targetUserId: string,
  user: DeletedUser,
) {
  logUserAudit("DELETE_USER", requestingUserId, targetUserId, {
    username: user.username,
    adminRole: user.adminRole,
  }, null);
}
