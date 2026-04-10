import { db } from "../../../../lib/prisma";
import { ExistingUser, UpdateNormalizedFields } from "../../types";
import { DuplicateEmailError, DuplicatePhoneError } from "../../errors";

async function assertFieldUnique(
  field: "email" | "phone",
  value: string,
  excludeUserId: string,
) {
  const existing = await db.user.findFirst({
    where: { [field]: value, id: { not: excludeUserId }, deletedAt: null },
    select: { id: true },
  });

  if (existing) {
    throw field === "email" ? new DuplicateEmailError() : new DuplicatePhoneError();
  }
}

export async function assertUniqueContact(
  userId: string,
  normalized: UpdateNormalizedFields,
  existingUser: ExistingUser,
) {
  const checks: Promise<void>[] = [];

  if (
    normalized.email !== undefined &&
    normalized.email !== null &&
    normalized.email !== existingUser.email
  ) {
    checks.push(assertFieldUnique("email", normalized.email, userId));
  }

  if (
    normalized.phone !== undefined &&
    normalized.phone !== null &&
    normalized.phone !== existingUser.phone
  ) {
    checks.push(assertFieldUnique("phone", normalized.phone, userId));
  }

  await Promise.all(checks);
}
