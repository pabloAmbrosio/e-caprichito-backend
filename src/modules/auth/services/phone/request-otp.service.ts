import { db } from "../../../../lib/prisma";
import { messaging } from "../../../../lib/messaging";
import { createOTP } from "../otp";
import { UserNotFoundError } from "../../errors";

export const requestOTPForPhone = async (phone: string) => {
  const user = await db.user.findUnique({
    where: { phone, deletedAt: null }
  });

  if (!user) {
    throw new UserNotFoundError('No existe un usuario con ese teléfono');
  }

  const code = await createOTP(user.id, phone);
  await messaging.send({
    channel: 'sms',
    to: phone,
    message: `Tu código de verificación es: ${code}. Válido por 5 minutos.`,
  });

  return { expiresIn: 300 }; // 5 minutos en segundos
};
