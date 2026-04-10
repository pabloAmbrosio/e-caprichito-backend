import { db } from "../../../../lib/prisma";
import { messaging } from "../../../../lib/messaging";
import { UserNotFoundError, NoContactMethodError } from "../../errors";
import { OTP_EXPIRATION_SECONDS } from "../../constants";
import { createOTP, createOTPForEmail } from "../otp";

const maskPhone = (phone: string): string => {

  if (phone.length <= 6) return '***' + phone.slice(-2);
  return phone.slice(0, 3) + '******' + phone.slice(-4);
};

const maskEmail = (email: string): string => {
  const [local, domain] = email.split('@');
  return `${local[0]}***@${domain}`;
};

export const forgotPassword = async (identifier: string) => {

  const user = await db.user.findFirst({
    where: {
      OR: [
        { username: identifier },
        { email: identifier },
        { phone: identifier }
      ]
    }
  });

  if (!user) {
    throw new UserNotFoundError('No se encontró un usuario con ese identificador');
  }

  const otpMessage = (code: string) => `Tu código de verificación es: ${code}. Válido por 5 minutos.`;

  if (user.phone) {
    const code = await createOTP(user.id, user.phone);
    await messaging.send({ channel: 'sms', to: user.phone, message: otpMessage(code) });
    return {
      userId: user.id,
      channel: 'sms' as const,
      maskedDestination: maskPhone(user.phone),
      expiresIn: OTP_EXPIRATION_SECONDS
    };
  }

  if (user.email) {
    const code = await createOTPForEmail(user.id, user.email);
    await messaging.send({
      channel: 'email',
      to: user.email,
      subject: 'Código de verificación',
      message: otpMessage(code),
    });
    return {
      userId: user.id,
      channel: 'email' as const,
      maskedDestination: maskEmail(user.email),
      expiresIn: OTP_EXPIRATION_SECONDS
    };
  }

  throw new NoContactMethodError();
};
