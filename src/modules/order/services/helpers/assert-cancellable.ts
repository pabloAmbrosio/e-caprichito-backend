import { OrderStatus } from "../../../../lib/prisma";
import { OrderNotCancellableError } from "../../errors";

const CANCELLABLE_STATUSES: OrderStatus[] = ["PENDING", "CONFIRMED"];

export function assertCancellable(status: OrderStatus) {
  if (!CANCELLABLE_STATUSES.includes(status)) {
    throw new OrderNotCancellableError(status);
  }
}
