import type { OrderStatus, PaymentStatus, ShipmentStatus } from "../../../../lib/prisma";

export interface OrderSearchFilters {
  search?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  shipmentStatus?: ShipmentStatus;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "status" | "discountTotalInCents";
  sortOrder?: "asc" | "desc";
}
