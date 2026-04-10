import { OrderStatus } from "../../../../lib/prisma";

export interface CancelOrderBackofficeInput {
  orderId: string;
  staffId: string;
  reason?: string;
}

export interface CancelOrderBackofficeResult {
  orderId: string;
  previousStatus: OrderStatus;
  status: "CANCELLED";
  reason?: string;
  shipmentFailed: boolean;
  paymentCancelled: boolean;
}
