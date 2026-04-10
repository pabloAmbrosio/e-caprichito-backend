import { db } from "../../../../lib/prisma";
import {
  DuplicateUsernameError,
  DuplicateEmailError,
  DuplicatePhoneError,
} from "../../errors";

// While soft-deleted, another user may have claimed the same unique fields
export async function assertNoConflicts(
  userId: string,
  username: string,
  email: string | null,
  phone: string | null,
) {
  const conflict = await db.user.findFirst({
    where: {
      deletedAt: null,
      id: { not: userId },
      OR: [
        { username },
        ...(email ? [{ email }] : []),
        ...(phone ? [{ phone }] : []),
      ],
    },
    select: { username: true, email: true, phone: true },
  });

  if (!conflict) return;

  if (conflict.username === username) throw new DuplicateUsernameError();
  if (email && conflict.email === email) throw new DuplicateEmailError();
  if (phone && conflict.phone === phone) throw new DuplicatePhoneError();
}
