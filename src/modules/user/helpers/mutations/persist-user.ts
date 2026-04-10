import { db } from "../../../../lib/prisma";
import { Prisma } from "../../../../lib/prisma";
import { CreateUserInput } from "../../schemas";
import { CreateNormalizedFields } from "../../types";
import { DuplicateFieldError } from "../../errors";
import { resolveCustomerRole } from "../../utils/resolve-customer-role";
import { userPublicSelect } from "../../select";

// P2002 guard: two requests may pass uniqueness check simultaneously
export async function persistUser(
  data: CreateUserInput,
  normalized: CreateNormalizedFields,
  passwordHash: string,
) {
  const customerRole = resolveCustomerRole(data.adminRole, data.customerRole);

  try {
    return await db.user.create({
      data: {
        username: data.username,
        email: normalized.email,
        phone: normalized.phone,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        adminRole: data.adminRole,
        customerRole,
        phoneVerified: false,
        emailVerified: false,
      },
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
