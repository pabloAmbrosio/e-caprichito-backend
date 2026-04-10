import { db } from "../../../../lib/prisma";
import { comparePassword } from "../../../../lib/bcrypt";
import { userSelect } from "../../user.selects";
import { InvalidCredentialsError, GoogleLoginRequiredError } from "../../errors";

export const loginUser = async (identifier: string, password: string) => {
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
    throw new InvalidCredentialsError();
  }

  if (!user.passwordHash) {
    throw new GoogleLoginRequiredError();
  }

  const isValid = await comparePassword(password, user.passwordHash);

  if (!isValid) {
    throw new InvalidCredentialsError();
  }

  const safeUser = await db.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
    select: userSelect
  });

  return safeUser;
};
