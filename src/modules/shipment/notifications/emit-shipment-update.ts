import type { Server } from "socket.io";

interface ShipmentNotification {
    orderId: string;
    shipmentId: string;
    status: string;
    note?: string;
}

export function emitShipmentUpdate(io: Server, userId: string, payload: ShipmentNotification) {
    io.to(`user:${userId}`).emit("shipment:updated", payload);
}
