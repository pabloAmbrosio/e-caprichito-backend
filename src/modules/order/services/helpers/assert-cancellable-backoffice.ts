import { OrderStatus } from "../../../../lib/prisma";
import { OrderNotCancellableError } from "../../errors";

// Incluye SHIPPED (a diferencia del shop)
const BACKOFFICE_CANCELLABLE_STATUSES: OrderStatus[] = ["PENDING", "CONFIRMED", "SHIPPED"];

export function assertCancellableBackoffice(status: OrderStatus) {
  if (!BACKOFFICE_CANCELLABLE_STATUSES.includes(status)) {
    throw new OrderNotCancellableError(status);
  }
}
