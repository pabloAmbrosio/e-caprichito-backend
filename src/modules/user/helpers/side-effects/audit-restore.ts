import { logUserAudit } from "../../utils/audit-logger";

interface RestoredUser {
  username: string;
  adminRole: string;
  deletedAt: Date | null;
}

export function auditRestore(
  requestingUserId: string,
  targetUserId: string,
  user: RestoredUser,
) {
  logUserAudit("RESTORE_USER", requestingUserId, targetUserId, {
    username: user.username,
    adminRole: user.adminRole,
    deletedAt: user.deletedAt!.toISOString(),
  }, null);
}
