import { Prisma, OrderStatus, PaymentStatus, ShipmentStatus } from "../../../../lib/prisma";
import { orderBackofficeSelect } from "../../order.selects";
import type { PaginationMeta } from "./pagination.types";
import type { OrderSearchRow } from "../../order-search-engine";

export interface ListOrdersBackofficeInput {
  page?: number;
  limit?: number;
  search?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  shipmentStatus?: ShipmentStatus;
  customerIds?: string[];
  productIds?: string[];
  dateFrom?: string;
  dateTo?: string;
  minTotalInCents?: number;
  maxTotalInCents?: number;
  sortBy?: "createdAt" | "status" | "discountTotalInCents";
  sortOrder?: "asc" | "desc";
}

export type BackofficeOrder = Prisma.OrderGetPayload<{ select: typeof orderBackofficeSelect }>;

export interface ListOrdersBackofficeResult {
  items: (BackofficeOrder | OrderSearchRow)[];
  pagination: PaginationMeta;
}
