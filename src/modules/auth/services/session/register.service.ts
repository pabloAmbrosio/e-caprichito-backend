import { db } from "../../../../lib/prisma";
import { hashPassword } from "../../../../lib/bcrypt";
import { messaging } from "../../../../lib/messaging";
import { RegisterInput } from "../../schemas";
import { createOTP } from "../otp";
import { userSelect } from "../../user.selects";
import { AdminRole, CustomerRole } from "../../../../lib/roles";
import { UsernameAlreadyExistsError, PhoneAlreadyExistsError, EmailAlreadyExistsError } from "../../errors";

export const register = async (data: RegisterInput) => {
  const existingUser = await db.user.findFirst({
    where: {
      OR: [
        { username: data.username },
        { phone: data.phone },
        ...(data.email ? [{ email: data.email }] : [])
      ]
    }
  });

  if (existingUser) {
    if (existingUser.username === data.username) {
      throw new UsernameAlreadyExistsError(data.username);
    }
    if (existingUser.phone === data.phone) {
      throw new PhoneAlreadyExistsError(data.phone);
    }
    if (data.email && existingUser.email === data.email) {
      throw new EmailAlreadyExistsError(data.email);
    }
  }

  const passwordHash = await hashPassword(data.password);

  const user = await db.user.create({
    data: {
      username: data.username,
      phone: data.phone,
      passwordHash,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phoneVerified: false,
      emailVerified: false,
      adminRole: AdminRole.CUSTOMER,
      customerRole: CustomerRole.MEMBER,
    },
    select: userSelect
  });

  if (user.phone) {
    const code = await createOTP(user.id, user.phone);
    await messaging.send({
      channel: 'sms',
      to: user.phone,
      message: `Tu código de verificación es: ${code}. Válido por 5 minutos.`,
    });
  }

  return user;
};
