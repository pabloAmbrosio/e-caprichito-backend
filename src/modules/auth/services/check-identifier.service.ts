import { db } from "../../../lib/prisma";

export const checkIdentifierExists = async (identifier: string): Promise<boolean> => {
  const user = await db.user.findFirst({
    where: {
      OR: [
        { username: identifier },
        { email: identifier },
        { phone: identifier },
      ],
    },
    select: { id: true },
  });

  return !!user;
};
