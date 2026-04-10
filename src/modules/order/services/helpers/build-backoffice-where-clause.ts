import { Prisma } from "../../../../lib/prisma";
import type { ListOrdersBackofficeInput } from "../types/list-orders.types";
import { buildStatusFilter } from "./build-status-filter";
import { buildDateRangeFilter } from "./build-date-range-filter";
import { buildProductFilter } from "./build-product-filter";
import { buildPaymentStatusFilter } from "./build-payment-status-filter";
import { buildShipmentStatusFilter } from "./build-shipment-status-filter";
import { buildCustomerFilter } from "./build-customer-filter";
import { buildAmountFilter } from "./build-amount-filter";

export function buildBackofficeWhereClause(query: ListOrdersBackofficeInput): Prisma.OrderWhereInput {
  const conditions: Prisma.OrderWhereInput[] = [];

  if (query.status)                conditions.push(buildStatusFilter(query.status));
  if (query.paymentStatus)         conditions.push(buildPaymentStatusFilter(query.paymentStatus));
  if (query.shipmentStatus)         conditions.push(buildShipmentStatusFilter(query.shipmentStatus));
  if (query.customerIds?.length)   conditions.push(buildCustomerFilter(query.customerIds));
  if (query.productIds?.length)    conditions.push(buildProductFilter(query.productIds));
  if (query.dateFrom || query.dateTo) conditions.push(buildDateRangeFilter(query.dateFrom, query.dateTo));
  if (query.minTotalInCents !== undefined || query.maxTotalInCents !== undefined) {
    conditions.push(buildAmountFilter(query.minTotalInCents, query.maxTotalInCents));
  }

  return conditions.length > 0 ? { AND: conditions } : {};
}
