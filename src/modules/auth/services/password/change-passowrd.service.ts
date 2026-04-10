import { db } from "../../../../lib/prisma";
import { hashPassword, comparePassword } from "../../../../lib/bcrypt";
import {InvalidCredentialsError} from '../../errors'


export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
) => {
  const user = await db.user.findUnique({
    where: { id: userId }
  });

  if (!user || !user.passwordHash) {
    throw new InvalidCredentialsError();
  }

  const isValid = await comparePassword(
    currentPassword, user.passwordHash
  );

  if (!isValid) {
    throw new InvalidCredentialsError();
  }

  const newHash = await hashPassword(newPassword);

  await db.user.update({
    where: { id: userId },
    data: { passwordHash: newHash }
  });
};