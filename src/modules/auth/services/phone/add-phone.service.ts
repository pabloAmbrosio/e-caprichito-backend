import { db } from "../../../../lib/prisma";
import { messaging } from "../../../../lib/messaging";
import { PhoneAlreadyExistsError } from "../../errors";
import { createOTP } from "../otp";

export const addPhoneToUser = async (userId: string, phone: string) => {

  const existingUser = await db.user.findUnique({
    where: { phone }
  });

  if (existingUser && existingUser.id !== userId) {
    throw new PhoneAlreadyExistsError(phone);
  }

  await db.user.update({
    where: { id: userId },
    data: { phone, phoneVerified: false }
  });

  const code = await createOTP(userId, phone);

  await messaging.send({
    channel: 'sms',
    to: phone,
    message: `Tu código de verificación es: ${code}. Válido por 5 minutos.`,
  });

  return { expiresIn: 300 };
};
