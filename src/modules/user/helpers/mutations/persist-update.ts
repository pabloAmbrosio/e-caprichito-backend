import { db } from "../../../../lib/prisma";
import { Prisma } from "../../../../lib/prisma";
import { DuplicateFieldError } from "../../errors";
import { userPublicSelect } from "../../select";
import { buildUpdateData } from "../transforms/build-update-data";

// P2002 guard: race condition on unique fields
export async function persistUpdate(userId: string, updateData: ReturnType<typeof buildUpdateData>) {
  try {
    return await db.user.update({
      where: { id: userId },
      data: updateData,
      select: userPublicSelect,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new DuplicateFieldError();
    }
    throw error;
  }
}
