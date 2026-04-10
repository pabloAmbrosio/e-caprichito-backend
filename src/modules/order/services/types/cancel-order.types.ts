import { OrderStatus } from "../../../../lib/prisma";

export interface CancelOrderInput {
  userId: string;
  orderId: string;
}

export interface CancelOrderResult {
  orderId: string;
  previousStatus: OrderStatus;
  status: OrderStatus;
}
