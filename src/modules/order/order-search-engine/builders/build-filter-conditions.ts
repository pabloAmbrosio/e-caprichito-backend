import { Prisma } from "../../../../lib/prisma";
import type { OrderSearchFilters } from "../types";

export const buildFilterConditions = (filters: OrderSearchFilters): Prisma.Sql[] => {
  const conditions: Prisma.Sql[] = [];

  if (filters.status) {
    conditions.push(Prisma.sql`AND o.status = ${filters.status}`);
  }

  if (filters.paymentStatus) {
    conditions.push(
      Prisma.sql`AND EXISTS (
        SELECT 1 FROM "Payment" pay_f
        WHERE pay_f."orderId" = o.id AND pay_f.status = ${filters.paymentStatus}
      )`
    );
  }

  if (filters.shipmentStatus) {
    conditions.push(
      Prisma.sql`AND EXISTS (
        SELECT 1 FROM "Shipment" s_f
        WHERE s_f."orderId" = o.id AND s_f.status = ${filters.shipmentStatus}
      )`
    );
  }

  if (filters.dateFrom) {
    conditions.push(Prisma.sql`AND o."createdAt" >= ${new Date(filters.dateFrom)}`);
  }

  if (filters.dateTo) {
    conditions.push(Prisma.sql`AND o."createdAt" <= ${new Date(filters.dateTo)}`);
  }

  return conditions;
};
