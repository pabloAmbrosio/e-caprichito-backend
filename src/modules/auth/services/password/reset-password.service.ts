import { db } from "../../../../lib/prisma";
import { hashPassword } from "../../../../lib/bcrypt";
import { verifyOTP } from "../otp";
import { revokeAllTokens } from "../token";
import { InvalidOTPCodeError, UserNotFoundError } from "../../errors";

export const resetPassword = async (
  userId: string,
  code: string,
  newPassword: string
) => {
  const user = await db.user.findUnique({
    where: { id: userId, deletedAt: null }
  });

  if (!user) {
    throw new UserNotFoundError();
  }

  const isValid = await verifyOTP(userId, code);
  if (!isValid) {
    throw new InvalidOTPCodeError();
  }

  const newHash = await hashPassword(newPassword);
  await db.user.update({
    where: { id: userId },
    data: { passwordHash: newHash }
  });

  await revokeAllTokens(userId);
};
