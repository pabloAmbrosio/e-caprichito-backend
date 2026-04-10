import { Prisma, ShipmentStatus } from "../../../../lib/prisma";

export function buildShipmentStatusFilter(shipmentStatus: ShipmentStatus): Prisma.OrderWhereInput {
  return { shipment: { status: shipmentStatus } };
}
