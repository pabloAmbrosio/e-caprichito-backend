import { deleteOTP, revokeAllTokens } from "../../../auth/services";

export async function revokeExternalSessions(
  userId: string,
  email: string | null,
  phone: string | null,
) {
  await Promise.all([
    revokeAllTokens(userId),
    deleteOTP({ userId, email, phone }),
  ]);
}
