import { Prisma } from "../../../lib/prisma";
import { UpdateUserInput } from "../schemas";
import { userUpdateCheckSelect } from "../select";

export interface UpdateUserServiceInput {
  userId: string;
  data: UpdateUserInput;
  requestingUserId?: string;
  requestingUserRole?: string;
}

export type ExistingUser = Prisma.UserGetPayload<{ select: typeof userUpdateCheckSelect }>;

export interface UpdateNormalizedFields {
  email: string | null | undefined;
  phone: string | null | undefined;
}
