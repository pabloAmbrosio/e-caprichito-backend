import { db } from "../../../../lib/prisma";
import {
  DuplicateUsernameError,
  DuplicateEmailError,
  DuplicatePhoneError,
} from "../../errors";

export async function assertUniqueFields(
  username: string,
  email?: string,
  phone?: string,
) {
  const existing = await db.user.findFirst({
    where: {
      OR: [
        { username },
        ...(email ? [{ email }] : []),
        ...(phone ? [{ phone }] : []),
      ],
    },
    select: { username: true, email: true, phone: true },
  });

  if (!existing) return;

  if (existing.username === username) throw new DuplicateUsernameError();
  if (email && existing.email === email) throw new DuplicateEmailError();
  if (phone && existing.phone === phone) throw new DuplicatePhoneError();
}
