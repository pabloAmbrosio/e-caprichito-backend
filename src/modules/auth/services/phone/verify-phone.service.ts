import { db } from "../../../../lib/prisma";
import { verifyOTP } from "../otp";
import { userSelect } from "../../user.selects";
import { InvalidOTPCodeError } from "../../errors";

export const verifyPhoneNumber = async (userId: string, code: string) => {
  const isValid = await verifyOTP(userId, code);

  if (!isValid) {
    throw new InvalidOTPCodeError();
  }

  const user = await db.user.update({
    where: { id: userId },
    data: { phoneVerified: true },
    select: userSelect
  });

  return user;
};
