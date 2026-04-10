import { CannotDeleteOwnAccountError } from "../../errors";

export function assertNotSelf(userId: string, requestingUserId: string) {
  if (userId === requestingUserId) throw new CannotDeleteOwnAccountError();
}
